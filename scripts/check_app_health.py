"""Synthetic checks of public files only: no visitor telemetry, GPS or push sends."""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, date
from html.parser import HTMLParser
from pathlib import Path
from zoneinfo import ZoneInfo

BASE = 'https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/'
CATALOGS = ['events', 'weekly', 'local-events', 'pvp']


class MetaPolicies(HTMLParser):
    def __init__(self):
        super().__init__()
        self.policies = {}

    def handle_starttag(self, tag, attrs):
        if tag == 'meta':
            attrs = dict(attrs)
            key = attrs.get('http-equiv', attrs.get('name', '')).lower()
            self.policies[key] = attrs.get('content', '')


def validate_shell(html, headers, hosting):
    issues = []
    if 'data-view="pvpView"' not in html or 'data-view="mapView"' in html:
        issues.append('Navegação PvP não publicada')
    if 'privacyView' not in html:
        issues.append('Tela de privacidade ausente')
    if hosting == 'github-pages':
        meta = MetaPolicies()
        meta.feed(html)
        directives = [part.strip().split() for part in meta.policies.get('content-security-policy', '').split(';')]
        connections = [part for part in directives if part and part[0] == 'connect-src']
        if connections != [['connect-src', "'self'"]]:
            issues.append('Política de conexões do app ausente ou ampliada')
        if meta.policies.get('referrer') != 'no-referrer':
            issues.append('Política de referência do app ausente')
    else:
        for key, expected in [('x-content-type-options', 'nosniff'), ('referrer-policy', 'no-referrer'), ('x-frame-options', 'SAMEORIGIN')]:
            if headers.get(key) != expected:
                issues.append(f'Proteção HTTP ausente: {key}')
        if "connect-src 'self'" not in headers.get('content-security-policy', ''):
            issues.append('Política de conexões do app ausente')
    return issues


def validate_push(data, hosting):
    if hosting == 'github-pages':
        if data.get('available') is not False or data.get('publicKey') is not None or data.get('error') != 'push_not_configured':
            return ['Disponibilidade de alertas incompatível com hospedagem estática']
    elif not data.get('publicKey'):
        return ['Serviço de alertas indisponível']
    return []


def request(base, path, method='GET'):
    url = urllib.parse.urljoin(base, path)
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, method=method, headers={'User-Agent': 'SpideyNexus-synthetic-health', 'Cache-Control': 'no-cache'})
            with urllib.request.urlopen(req, timeout=20) as response:
                raw = response.read(6_000_001) if method == 'GET' else b''
                if len(raw) > 6_000_000:
                    raise ValueError('public_response_too_large')
                return raw, dict((k.lower(),v) for k,v in response.headers.items())
        except Exception as error:
            if attempt == 0:
                time.sleep(1)
            else:
                code = error.code if isinstance(error, urllib.error.HTTPError) else type(error).__name__
                raise ValueError(f'{path}: {code}') from None


def validate_catalogs(catalogs, now):
    issues = []
    if not catalogs['events'].get('events'):
        issues.append('Calendário vazio')
    weekly = catalogs['weekly']
    try:
        if not date.fromisoformat(weekly['week_start']) <= now.astimezone(ZoneInfo('America/Sao_Paulo')).date() <= date.fromisoformat(weekly['week_end']):
            issues.append('Resumo semanal fora da semana atual')
        if len(weekly['days']) != 7:
            issues.append('Resumo semanal incompleto')
    except (KeyError, ValueError, TypeError):
        issues.append('Resumo semanal inválido')
    local = catalogs['local-events'].get('events', [])
    chicago = next((e for e in local if e.get('id') == '2026-chicago-fossil-museum'), None)
    if not chicago or chicago.get('source', {}).get('confidence') != 'official' or chicago.get('schedule', {}).get('timezone') != 'America/Chicago':
        issues.append('Evento de Chicago ausente ou sem confirmação')
    pvp = catalogs['pvp']
    if pvp.get('schema_version') != 'spidey-pvp-v1' or set(l.get('id') for l in pvp.get('leagues', [])) != {'great', 'ultra', 'master'}:
        issues.append('PvP incompleto')
    else:
        for league in pvp['leagues']:
            if len(league.get('entries', [])) < 100:
                issues.append(f"Ranking incompleto: {league['id']}")
    return issues


def check(base=BASE, now=None, hosting='github-pages', all_images=False):
    now = now or datetime.now(timezone.utc)
    if hosting not in {'github-pages', 'vercel'}:
        raise ValueError('unknown_hosting_profile')
    report = {'checked_at': now.isoformat(), 'base_url': base, 'hosting': hosting, 'checks': [], 'failures': [], 'capabilities': {'push': hosting == 'vercel'}, 'limitations': []}
    catalog_paths = {name: f'data/{name}.json' if hosting == 'github-pages' else f'api/catalog?file={name}' for name in CATALOGS}
    paths = ['index.html', 'pvp.js', 'pvp.css', 'navigation.js', 'sw.js', 'premium-approved-master.js', 'api/push/public-key'] + list(catalog_paths.values())
    if hosting == 'github-pages':
        paths += ['catalog.js', 'stamps-v2.js', 'manifest.webmanifest', 'data/stamps.json']
        report['limitations'] = ['Push e Amigos/chat não são fornecidos pela hospedagem estática', 'Políticas meta não equivalem a todos os cabeçalhos HTTP da Vercel', 'Verificação HTTP não certifica Android físico, PWA/offline ou renderização de todas as imagens']
    results = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {path: pool.submit(request,base,path) for path in paths}
        for path, future in futures.items():
            try:
                raw, headers = future.result()
                results[path] = (raw,headers)
                report['checks'].append({'path': path, 'ok': True, 'bytes': len(raw)})
            except Exception as error:
                report['checks'].append({'path':path,'ok':False})
                report['failures'].append(str(error))
    try:
        shell, headers = results['index.html']; html = shell.decode()
        report['failures'].extend(validate_shell(html, headers, hosting))
        catalogs = {name: json.loads(results[path][0]) for name, path in catalog_paths.items()}
        report['failures'].extend(validate_catalogs(catalogs,now))
        report['catalogs'] = {'events': len(catalogs['events']['events']), 'week_start': catalogs['weekly']['week_start'], 'week_end': catalogs['weekly']['week_end'], 'pvp': {league['id']: len(league.get('entries', [])) for league in catalogs['pvp'].get('leagues', [])}}
        report['failures'].extend(validate_push(json.loads(results['api/push/public-key'][0]), hosting))
        if hosting == 'github-pages':
            rallies = json.loads(results['data/stamps.json'][0]).get('rallies', [])
            if not rallies:
                report['failures'].append('Catálogo de Selos vazio')
            report['catalogs']['rallies'] = len(rallies)
        source = results['premium-approved-master.js'][0].decode()
        master = json.loads(re.search(r'const master = (\{.*?\});',source,re.S).group(1))
        items = list({item['file']: item for item in master.values()}.values())
        if not items:
            report['failures'].append('Catálogo de artes aprovadas vazio')
            report['ok'] = False
            return report
        report['approved_art'] = {'entries': len(master), 'unique_files': len(items), 'audit': 'all' if all_images else 'sample'}
        images = items if all_images else [items[(now.hour * 12 + now.minute // 5) % len(items)]]
        # A full audit is explicit; ordinary cycles fetch one image per hour.
        full = all_images or now.minute < 5
        with ThreadPoolExecutor(max_workers=4) as pool:
            futures = {image['file']: (image, pool.submit(request, base, image['file'], 'GET' if full else 'HEAD')) for image in images}
            for path, (image, future) in futures.items():
                try:
                    raw, _ = future.result()
                    matches = not full or hashlib.sha256(raw).hexdigest() == image['sha256']
                    report['checks'].append({'path': path, 'ok': matches, 'sha256_checked': full})
                    if not matches:
                        report['failures'].append(f'Arte aprovada divergiu do original: {path}')
                except Exception as error:
                    report['checks'].append({'path': path, 'ok': False, 'sha256_checked': False})
                    report['failures'].append(str(error))
    except Exception as error:
        report['failures'].append('Validação dos dados: ' + type(error).__name__)
    report['ok'] = not report['failures']
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url',default=BASE)
    parser.add_argument('--hosting', choices=['github-pages', 'vercel'], default='github-pages')
    parser.add_argument('--all-images', action='store_true', help='Conferir hashes de todos os originais aprovados nesta execução')
    parser.add_argument('--output',default='app-health.json')
    args = parser.parse_args()
    report = check(args.base_url, hosting=args.hosting, all_images=args.all_images)
    Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({key: report.get(key) for key in ['checked_at', 'base_url', 'hosting', 'ok', 'catalogs', 'approved_art', 'capabilities', 'limitations', 'failures']},ensure_ascii=False))
    raise SystemExit(0 if report['ok'] else 1)


if __name__ == '__main__':
    main()

