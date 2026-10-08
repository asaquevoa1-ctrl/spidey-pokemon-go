"""Package the public Spidey app for free static hosting; never copy server data."""
from __future__ import annotations

import argparse
import ast
import hashlib
import html
import json
import re
import shutil
from datetime import datetime, date
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.html', '.js', '.css', '.json', '.webmanifest', '.txt', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico', '.woff', '.woff2'}
POLICY = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
CATALOG_REQUEST = "fetch(`api/catalog?file=${encodeURIComponent(file)}`,"
STATIC_REQUEST = "fetch(`data/${file}.json`,"
GPX_REQUEST = "gpxLink.href = navigator.onLine === false ? url : `api/gpx?rally=${encodeURIComponent(rally.id)}`;"
ANALYTICS_HOST = 'asaquevoa1-ctrl.github.io'
ANALYTICS_SCRIPT = 'https://static.cloudflareinsights.com/beacon.min.js'
ANALYTICS_ENDPOINT = 'https://cloudflareinsights.com'
NO_ANALYTICS_COPY = 'Não instalamos anúncios, rastreadores de comportamento nem ferramentas de análise de visitantes.'
ANALYTICS_COPY = ('Não instalamos anúncios nem rastreadores de comportamento. '
                  'Usamos Cloudflare Web Analytics para contar visitas e visualizações e acompanhar o carregamento. '
                  'A Cloudflare declara que esse recurso não coleta nem usa dados pessoais dos visitantes. '
                  'Não enviamos seus times, progresso dos selos, buscas ou coordenadas copiadas para essa medição. '
                  'Respeitamos as preferências Não Rastrear e Global Privacy Control do navegador. '
                  'Visitas não equivalem ao número de pessoas diferentes ou de instalações do app.')


def read_analytics(root: Path) -> dict:
    path = root / 'config/spidey-web-analytics.json'
    data = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {
        'enabled': False, 'hostname': ANALYTICS_HOST, 'site_token': None}
    if not isinstance(data, dict) or set(data) != {'enabled', 'hostname', 'site_token'} or type(data['enabled']) is not bool:
        raise ValueError('Configuração de estatísticas inválida')
    if data['hostname'] != ANALYTICS_HOST:
        raise ValueError('Estatísticas restritas ao endereço público atual')
    if data['enabled'] and (not isinstance(data['site_token'], str) or not re.fullmatch('[a-f0-9]{32}', data['site_token'])):
        raise ValueError('Falta o identificador público do site no Cloudflare Web Analytics')
    if not data['enabled'] and data['site_token'] is not None:
        raise ValueError('Estatísticas desativadas devem manter site_token nulo')
    return data


def prepare_shell(text: str, analytics: dict) -> str:
    if text.count('</head>') != 1 or text.count('</body>') != 1 or 'http-equiv="Content-Security-Policy"' in text:
        raise ValueError('Cabeçalho HTML mudou; revisar a política de segurança')
    policy, provider = POLICY, 'off'
    if analytics['enabled']:
        if text.count(NO_ANALYTICS_COPY) != 1:
            raise ValueError('Texto de privacidade mudou; revisar antes de ativar estatísticas')
        text = text.replace(NO_ANALYTICS_COPY, ANALYTICS_COPY)
        policy = policy.replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' " + ANALYTICS_SCRIPT)
        policy = policy.replace("connect-src 'self'", "connect-src 'self' " + ANALYTICS_ENDPOINT)
        provider = 'cloudflare'
        loader = '<script src="web-analytics.js?v=20261008-analytics1" data-site-token="' + analytics['site_token'] + '" defer></script>\n'
        text = text.replace('</body>', loader + '</body>')
    metadata = ('<meta name="referrer" content="no-referrer">\n'
                '<meta name="spidey-web-analytics" content="' + provider + '">\n'
                '<meta http-equiv="Content-Security-Policy" content="' + html.escape(policy, quote=True) + '">\n')
    return text.replace('</head>', metadata + '</head>')


def verify_public_data(app: Path, today: date | None = None) -> dict:
    catalogs = {name: json.loads((app / f'data/{name}.json').read_text(encoding='utf-8'))
                for name in ('events', 'stamps', 'weekly', 'local-events', 'pvp')}
    weekly = catalogs['weekly']
    today = today or datetime.now(ZoneInfo('America/Sao_Paulo')).date()
    if not date.fromisoformat(weekly['week_start']) <= today <= date.fromisoformat(weekly['week_end']) or len(weekly['days']) != 7:
        raise ValueError('Resumo semanal incompleto ou fora da semana atual')
    if not catalogs['events']['events'] or not catalogs['stamps']['rallies']:
        raise ValueError('Catálogo público vazio')
    pvp = catalogs['pvp']
    if pvp['schema_version'] != 'spidey-pvp-v1' or {league['id'] for league in pvp['leagues']} != {'great', 'ultra', 'master'}:
        raise ValueError('Ligas PvP incompletas')
    if any(len(league['entries']) < 100 for league in pvp['leagues']):
        raise ValueError('Ranking PvP incompleto')
    source = (app / 'premium-approved-master.js').read_text(encoding='utf-8')
    master = json.loads(re.search(r'const master = (\{.*?\});', source, re.S).group(1))
    for item in master.values():
        file = app / item['file']
        if item['status'] != 'APPROVED' or not file.resolve().is_relative_to(app.resolve()):
            raise ValueError('Referência inválida de arte aprovada')
        if hashlib.sha256(file.read_bytes()).hexdigest() != item['sha256']:
            raise ValueError(f"Arte aprovada divergente: {item['file']}")
    return {'events': len(catalogs['events']['events']), 'art_entries': len(master),
            'week': [weekly['week_start'], weekly['week_end']],
            'pvp': {league['id']: len(league['entries']) for league in pvp['leagues']}}


def build(output: Path, root: Path = ROOT, today: date | None = None) -> dict:
    root, output = root.resolve(), output.resolve()
    app = root / 'spidey-app'
    # Only a dedicated generated directory may be cleared; never source or ancestors.
    if output == root or output in root.parents or output == app or output.is_relative_to(app):
        raise ValueError('Diretório de saída precisa ser separado da fonte')
    result = verify_public_data(app, today)
    analytics = read_analytics(root)
    if output.exists() and any(output.iterdir()) and not (output / '.spidey-pages-generated').is_file():
        raise ValueError('A saída contém arquivos que não foram gerados por este script')
    if output.exists():
        shutil.rmtree(output)
    published = output / 'spidey-app'
    for file in app.rglob('*'):
        relative = file.relative_to(app)
        if not file.is_file() or file.is_symlink() or any(part in {'api', 'node_modules', 'review'} for part in relative.parts):
            continue
        if file.suffix.lower() not in EXTENSIONS or file.name in {'package.json', 'vercel.json', 'PREMIUM_V2_NOTE.txt'}:
            continue
        if file.suffix == '.html' and file.name.startswith('qa-'):
            continue
        target = published / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(file, target)
    catalog = published / 'catalog.js'
    text = catalog.read_text(encoding='utf-8')
    if text.count(CATALOG_REQUEST) != 1:
        raise ValueError('Adaptador de catálogos mudou; revisar antes de publicar')
    catalog.write_text(text.replace(CATALOG_REQUEST, STATIC_REQUEST), encoding='utf-8')
    stamps = published / 'stamps-v2.js'
    text = stamps.read_text(encoding='utf-8')
    if text.count(GPX_REQUEST) != 1:
        raise ValueError('Download GPX mudou; revisar antes de publicar')
    # Use the existing complete-route Blob on both online and offline paths.
    stamps.write_text(text.replace(GPX_REQUEST, 'gpxLink.href = url;'), encoding='utf-8')
    # Review candidates are not published; absent pre-cache entries abort SW install.
    worker = published / 'sw.js'
    text = worker.read_text(encoding='utf-8')
    core_match = re.search(r'const CORE = (\[.*?\]);', text, re.S)
    if core_match is None:
        raise ValueError('Lista de cache mudou; revisar antes de publicar')
    core = ast.literal_eval(core_match.group(1))
    core = [path for path in core if '/review/' not in path]
    if any(not isinstance(path, str) or not path.startswith('./') or '..' in Path(path).parts
           or not (published / path).exists() for path in core):
        raise ValueError('Cache referencia arquivo ausente ou fora do app')
    worker.write_text(text[:core_match.start(1)] + json.dumps(core, ensure_ascii=False, indent=2)
                      + text[core_match.end(1):], encoding='utf-8')
    index = published / 'index.html'
    text = index.read_text(encoding='utf-8')
    index.write_text(prepare_shell(text, analytics), encoding='utf-8')
    result['web_analytics'] = {'enabled': analytics['enabled'], 'provider': 'cloudflare' if analytics['enabled'] else None}
    # Public availability only. No subscription store, registration or dispatch exists here.
    key = published / 'api/push/public-key'
    key.parent.mkdir(parents=True, exist_ok=True)
    key.write_text('{"available":false,"publicKey":null,"error":"push_not_configured"}\n', encoding='utf-8')
    (output / 'index.html').write_text('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0;url=./spidey-app/"><title>Spidey</title></head><body><a href="./spidey-app/">Abrir Spidey</a></body></html>\n', encoding='utf-8')
    (output / '.nojekyll').touch()
    (output / '.spidey-pages-generated').touch()
    files = [file for file in output.rglob('*') if file.is_file()]
    result.update(files=len(files), bytes=sum(file.stat().st_size for file in files))
    if result['bytes'] >= 1_000_000_000:
        raise ValueError('Pacote excede o limite de publicação gratuita')
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT / 'pages-public')
    args = parser.parse_args()
    print(json.dumps(build(args.output), ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
