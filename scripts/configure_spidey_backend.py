"""Connect a permanent verified Worker. No login, credentials or push dispatch."""
import argparse
import json
from pathlib import Path
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.build_spidey_pages import ROOT, read_backend
from scripts.check_spidey_backend import verify


def configure(url):
    config = {'enabled': True, 'url': url, 'hosting': 'cloudflare-workers'}
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        (root / 'config').mkdir()
        (root / 'config/spidey-backend.json').write_text(json.dumps(config))
        read_backend(root)
    report = verify(url)
    if not report['ok']:
        raise ValueError('Serviço ainda não pronto: ' + '; '.join(report['failures']))
    (ROOT / 'config/spidey-backend.json').write_text(json.dumps(config, indent=2) + '\n')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', required=True)
    args = parser.parse_args()
    print(json.dumps(configure(args.url), ensure_ascii=False))
