import json
import hashlib
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch
from scripts.check_app_health import check, validate_catalogs, validate_shell, validate_push

PAGES_SHELL = '<button data-view="pvpView"></button><section id="privacyView"></section><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src &apos;self&apos;; connect-src &apos;self&apos;">'


class AppHealthTests(unittest.TestCase):
    def catalogs(self):
        return {name: json.loads(Path(f'spidey-app/data/{name}.json').read_text()) for name in ['events','weekly','local-events','pvp']}

    def test_healthy_reference(self):
        data=self.catalogs()
        now=datetime.fromisoformat(data['weekly']['week_start']+'T12:00:00+00:00')
        self.assertEqual(validate_catalogs(data,now),[])

    def test_monitor_detects_missing_chicago_and_incomplete_pvp(self):
        data=self.catalogs()
        data['local-events']['events']=[]
        data['pvp']['leagues']=[]
        errors=validate_catalogs(data,datetime(2026,10,5,15,tzinfo=timezone.utc))
        self.assertIn('Evento de Chicago ausente ou sem confirmação',errors)
        self.assertIn('PvP incompleto',errors)

    def test_monitor_detects_stale_calendar_using_brasilia_date(self):
        data=self.catalogs()
        now=datetime.fromisoformat(data['weekly']['week_end']+'T03:00:00+00:00')+timedelta(days=1)
        self.assertIn('Resumo semanal fora da semana atual',validate_catalogs(data,now))

    def test_pages_requires_private_connection_policy_even_without_custom_headers(self):
        self.assertEqual(validate_shell(PAGES_SHELL, {}, 'github-pages'), [])
        broad = PAGES_SHELL.replace('connect-src &apos;self&apos;', 'connect-src &apos;self&apos; https://example.org')
        self.assertIn('Política de conexões do app ausente ou ampliada', validate_shell(broad, {}, 'github-pages'))
        self.assertIn('Política de referência do app ausente', validate_shell(PAGES_SHELL.replace('no-referrer', 'unsafe-url'), {}, 'github-pages'))

    def test_vercel_still_requires_server_headers_and_configured_push(self):
        self.assertIn('Proteção HTTP ausente: x-frame-options', validate_shell(PAGES_SHELL, {}, 'vercel'))
        self.assertEqual(validate_push({'publicKey': None}, 'vercel'), ['Serviço de alertas indisponível'])
        self.assertEqual(validate_push({'publicKey': 'configured-public-key'}, 'vercel'), [])

    def test_pages_reports_push_unavailable_instead_of_promising_delivery(self):
        self.assertEqual(validate_push({'available': False, 'publicKey': None, 'error': 'push_not_configured'}, 'github-pages'), [])
        self.assertTrue(validate_push({'available': True, 'publicKey': 'unexpected'}, 'github-pages'))

    def fake_public_files(self):
        data = self.catalogs()
        image = b'approved public image bytes'
        master = {'approved-event': {'file': 'assets/events/approved.png', 'sha256': hashlib.sha256(image).hexdigest()}}
        files = {f'data/{name}.json': json.dumps(value).encode() for name, value in data.items()}
        files.update({
            'index.html': PAGES_SHELL.encode(),
            'premium-approved-master.js': ('const master = ' + json.dumps(master) + ';').encode(),
            'api/push/public-key': b'{"available":false,"publicKey":null,"error":"push_not_configured"}',
            'data/stamps.json': b'{"rallies":[{"id":"public-rally"}]}',
            'assets/events/approved.png': image,
        })
        for path in ['pvp.js', 'pvp.css', 'navigation.js', 'sw.js', 'catalog.js', 'stamps-v2.js', 'manifest.webmanifest']:
            files[path] = b'public static file'
        now = datetime.fromisoformat(data['weekly']['week_start'] + 'T12:00:00+00:00')
        return files, now

    def run_fake_site(self, files, now, **options):
        def public_request(base, path, method='GET'):
            if path not in files:
                raise ValueError(f'{path}: 404')
            return (files[path] if method == 'GET' else b''), {}
        with patch('scripts.check_app_health.request', side_effect=public_request):
            return check(now=now, hosting='github-pages', **options)

    def test_static_site_audit_reads_public_catalogs_and_exact_approved_bytes(self):
        files, now = self.fake_public_files()
        report = self.run_fake_site(files, now, all_images=True)
        self.assertTrue(report['ok'], report['failures'])
        self.assertFalse(report['capabilities']['push'])
        self.assertEqual(report['approved_art']['audit'], 'all')
        self.assertTrue(report['checks'][-1]['sha256_checked'])
        self.assertFalse(any('api/catalog' in row['path'] for row in report['checks']))

    def test_static_site_missing_asset_is_not_masked_by_disabled_push(self):
        files, now = self.fake_public_files()
        del files['stamps-v2.js']
        report = self.run_fake_site(files, now)
        self.assertFalse(report['ok'])
        self.assertIn('stamps-v2.js: 404', report['failures'])

    def test_static_site_full_audit_detects_changed_art(self):
        files, now = self.fake_public_files()
        files['assets/events/approved.png'] = b'changed image bytes'
        report = self.run_fake_site(files, now, all_images=True)
        self.assertFalse(report['ok'])
        self.assertIn('Arte aprovada divergiu do original: assets/events/approved.png', report['failures'])
        self.assertFalse(report['checks'][-1]['ok'])

    def test_full_audit_does_not_accept_an_empty_approval_catalog(self):
        files, now = self.fake_public_files()
        files['premium-approved-master.js'] = b'const master = {};'
        report = self.run_fake_site(files, now, all_images=True)
        self.assertFalse(report['ok'])
        self.assertIn('Catálogo de artes aprovadas vazio', report['failures'])


if __name__=='__main__':
    unittest.main()

