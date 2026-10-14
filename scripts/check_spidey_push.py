"""Verify only public health and public VAPID key of a Cloudflare Worker."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.build_spidey_pages import ROOT, read_push
from scripts.check_app_health import request


def verify(url):
    health = json.loads(request(url + '/', 'health')[0])
    key = json.loads(request(url + '/', 'api/push/public-key')[0])
    push = health.get('push', {})
    scheduler = push.get('scheduler') or {}
    try:
        checked = datetime.fromisoformat(scheduler['checked_at'].replace('Z', '+00:00'))
        age = (datetime.now(timezone.utc) - checked).total_seconds()
    except (ValueError, TypeError, KeyError, AttributeError):
        age = float('inf')
    failures = []
    if health.get('ok') is not True or push.get('available') is not True:
        failures.append('Push indisponível')
    if scheduler.get('status') != 'ok' or not -60 < age <= 2700:
        failures.append('Agendamento ainda não comprovado ou desatualizado')
    if not isinstance(key.get('publicKey'), str) or not key.get('publicKey'):
        failures.append('Chave pública indisponível')
    if 'social' in health:
        failures.append('Servidor social não pode ser ativado neste escopo')
    return {'ok': not failures, 'url': url, 'scheduler': scheduler, 'failures': failures}


if __name__ == '__main__':
    config = read_push(ROOT)
    if not config['enabled']:
        print(json.dumps({'ok': True, 'state': 'not_activated', 'push_available': False}))
        raise SystemExit(0)
    try:
        output = verify(config['url'])
    except Exception as err:
        output = {'ok': False, 'failures': [str(err)]}
    print(json.dumps(output, ensure_ascii=False))
    raise SystemExit(0 if output['ok'] else 1)
