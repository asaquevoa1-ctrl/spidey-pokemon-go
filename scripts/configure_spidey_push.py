"""Enable exact public Worker URL only after a successful read-only health check."""
import argparse
import json
from pathlib import Path
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.build_spidey_pages import ROOT, read_push
from scripts.check_spidey_push import verify


def configure(url):
    value = {'enabled': True, 'url': url, 'hosting': 'cloudflare-workers'}
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / 'config'
        p.mkdir(parents=True)
        (p / 'spidey-push.json').write_text(json.dumps(value))
        read_push(Path(d))
    report = verify(url)
    if not report['ok']:
        raise ValueError('Servidor não pronto: ' + '; '.join(report['failures']))
    (ROOT / 'config/spidey-push.json').write_text(json.dumps(value, indent=2) + '\n')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', required=True)
    args = parser.parse_args()
    print(json.dumps(configure(args.url), ensure_ascii=False))
