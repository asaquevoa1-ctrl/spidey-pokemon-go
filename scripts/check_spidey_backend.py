"""Read public backend health only; never send push or read user records."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.build_spidey_pages import ROOT, read_backend
from scripts.check_app_health import request, validate_backend_health


def verify(url, now=None):
    now = now or datetime.now(timezone.utc)
    health = json.loads(request(url + '/', 'health')[0])
    errors = validate_backend_health(health, now)
    for path in ['api/push/public-key', 'api/social']:
        result = json.loads(request(url + '/', path)[0])
        if result.get('available') is not True:
            errors.append(f'{path}: indisponível')
    return {'ok': not errors, 'checked_at': now.isoformat(), 'url': url,
            'scheduler': health.get('push', {}).get('scheduler'), 'failures': errors}


if __name__ == '__main__':
    config = read_backend(ROOT)
    if not config['enabled']:
        print(json.dumps({'ok': True, 'state': 'not_activated', 'push_available': False,
                          'note': 'Serviço adicional ainda não ativado; nenhum envio realizado.'}))
        raise SystemExit(0)
    try:
        result = verify(config['url'])
    except Exception as error:
        result = {'ok': False, 'failures': [str(error)]}
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(0 if result['ok'] else 1)
