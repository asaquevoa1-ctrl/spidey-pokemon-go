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
from pathlib import Path
from zoneinfo import ZoneInfo

BASE = 'https://spidey-pokemon-go.vercel.app/spidey-app/'


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


def check(base=BASE, now=None):
    now = now or datetime.now(timezone.utc)
    report = {'checked_at': now.isoformat(), 'base_url': base, 'checks': [], 'failures': []}
    paths = ['index.html', 'pvp.js', 'pvp.css', 'navigation.js', 'sw.js', 'premium-approved-master.js', 'api/push/public-key'] + [f'api/catalog?file={file}' for file in ['events', 'weekly', 'local-events', 'pvp']]
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
        if 'data-view="pvpView"' not in html or 'data-view="mapView"' in html:
            report['failures'].append('Navegação PvP não publicada')
        if 'privacyView' not in html:
            report['failures'].append('Tela de privacidade ausente')
        for key, expected in [('x-content-type-options','nosniff'),('referrer-policy','no-referrer'),('x-frame-options','SAMEORIGIN')]:
            if headers.get(key) != expected:
                report['failures'].append(f'Proteção HTTP ausente: {key}')
        if "connect-src 'self'" not in headers.get('content-security-policy',''):
            report['failures'].append('Política de conexões do app ausente')
        catalogs = {file: json.loads(results[f'api/catalog?file={file}'][0]) for file in ['events','weekly','local-events','pvp']}
        report['failures'].extend(validate_catalogs(catalogs,now))
        if not json.loads(results['api/push/public-key'][0]).get('publicKey'):
            report['failures'].append('Serviço de alertas indisponível')
        source = results['premium-approved-master.js'][0].decode()
        master = json.loads(re.search(r'const master = (\{.*?\});',source,re.S).group(1))
        items = list({item['file']: item for item in master.values()}.values())
        image = items[(now.hour * 12 + now.minute // 5) % len(items)]
        # HEAD every cycle; one complete image per hour avoids heavy polling.
        full = now.minute < 5
        raw, headers = request(base,image['file'],'GET' if full else 'HEAD')
        if full and hashlib.sha256(raw).hexdigest() != image['sha256']:
            report['failures'].append('Uma arte aprovada divergiu do original')
        report['checks'].append({'path': image['file'], 'ok':True, 'sha256_checked':full})
    except Exception as error:
        report['failures'].append('Validação dos dados: ' + type(error).__name__)
    report['ok'] = not report['failures']
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url',default=BASE)
    parser.add_argument('--output',default='app-health.json')
    args = parser.parse_args()
    report = check(args.base_url)
    Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'ok':report['ok'],'checks':len(report['checks']),'failures':report['failures']},ensure_ascii=False))
    raise SystemExit(0 if report['ok'] else 1)


if __name__ == '__main__':
    main()
