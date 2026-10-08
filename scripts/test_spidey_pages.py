import ast
import hashlib
import json
import re
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

from scripts.build_spidey_pages import ROOT, build, verify_public_data, prepare_shell, read_analytics
from scripts.check_app_health import validate_shell


class StaticPublicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.weekly = json.loads((ROOT / 'spidey-app/data/weekly.json').read_text())
        cls.anchor = date.fromisoformat(cls.weekly['week_start'])

    def test_public_package_preserves_art_and_works_without_server_endpoints(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'pages'
            result = build(output, today=self.anchor)
            app = output / 'spidey-app'
            self.assertGreater(result['art_entries'], 0)
            self.assertEqual(result['events'], len(json.loads((ROOT / 'spidey-app/data/events.json').read_text())['events']))
            self.assertEqual(result['week'], [self.weekly['week_start'], self.weekly['week_end']])
            self.assertLess(result['bytes'], 1_000_000_000)
            self.assertNotIn('api/catalog?', (app / 'catalog.js').read_text())
            self.assertIn('gpxLink.href = url;', (app / 'stamps-v2.js').read_text())
            self.assertNotIn('api/gpx?', (app / 'stamps-v2.js').read_text())
            self.assertIn('connect-src', (app / 'index.html').read_text())
            core = ast.literal_eval(re.search(r'const CORE = (\[.*?\]);', (app / 'sw.js').read_text(), re.S).group(1))
            self.assertTrue(core)
            self.assertTrue(all((app / path).exists() for path in core))
            self.assertFalse(any('/review/' in path for path in core))
            self.assertFalse(json.loads((app / 'api/push/public-key').read_text())['available'])
            self.assertEqual([str(p.relative_to(app)) for p in (app / 'api').rglob('*') if p.is_file()], ['api/push/public-key'])
            for name in ('events', 'stamps', 'weekly', 'local-events', 'pvp'):
                self.assertEqual((app / f'data/{name}.json').read_bytes(), (ROOT / f'spidey-app/data/{name}.json').read_bytes())
            source = ROOT / 'spidey-app'
            for file in (app / 'assets').rglob('*'):
                if file.is_file():
                    self.assertEqual(hashlib.sha256(file.read_bytes()).digest(), hashlib.sha256((source / file.relative_to(app)).read_bytes()).digest())
            first = result
            self.assertEqual(build(output, today=self.anchor), first)

    def test_refuses_stale_week_and_protects_source_and_unrelated_files(self):
        with self.assertRaisesRegex(ValueError, 'semana atual'):
            verify_public_data(ROOT / 'spidey-app', date.fromisoformat(self.weekly['week_end']) + timedelta(days=1))
        with self.assertRaises(ValueError):
            build(ROOT / 'spidey-app', today=self.anchor)
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            sentinel = output / 'keep.txt'
            sentinel.write_text('preservar')
            with self.assertRaisesRegex(ValueError, 'não foram gerados'):
                build(output, today=self.anchor)
            self.assertEqual(sentinel.read_text(), 'preservar')

    def test_stats_remain_off_without_a_real_site_identifier(self):
        source = (ROOT / 'spidey-app/index.html').read_text()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            disabled = prepare_shell(source, read_analytics(root))
            self.assertNotIn('web-analytics.js', disabled)
            self.assertNotIn('cloudflareinsights.com', disabled)
            self.assertIn('nem ferramentas de análise de visitantes', disabled)
            self.assertEqual(validate_shell(disabled, {}, 'github-pages'), [])
            path = root / 'config/spidey-web-analytics.json'
            path.parent.mkdir()
            path.write_text(json.dumps({'enabled': True, 'hostname': 'asaquevoa1-ctrl.github.io', 'site_token': None}))
            with self.assertRaisesRegex(ValueError, 'identificador público'):
                read_analytics(root)

    def test_enabled_stats_have_exact_connections_and_an_accurate_privacy_notice(self):
        source = (ROOT / 'spidey-app/index.html').read_text()
        token = '1234567890abcdef1234567890abcdef'
        shell = prepare_shell(source, {'enabled': True, 'hostname': 'asaquevoa1-ctrl.github.io', 'site_token': token})
        self.assertEqual(validate_shell(shell, {}, 'github-pages'), [])
        self.assertIn('data-site-token="' + token + '"', shell)
        self.assertIn('Cloudflare Web Analytics', shell)
        self.assertNotIn('nem ferramentas de análise de visitantes', shell)
        self.assertIn('Visitas não equivalem ao número de pessoas diferentes', shell)
        self.assertIn('no-referrer', shell)
        broadened = shell.replace('https://cloudflareinsights.com;', 'https://cloudflareinsights.com https://unexpected.example;')
        self.assertIn('Política de conexões do app ausente ou ampliada', validate_shell(broadened, {}, 'github-pages'))

    def test_enabled_package_includes_the_loader_and_keeps_the_site_identifier_public_only(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'source'
            root.mkdir()
            (root / 'spidey-app').symlink_to(ROOT / 'spidey-app', target_is_directory=True)
            config = root / 'config/spidey-web-analytics.json'
            config.parent.mkdir()
            config.write_text(json.dumps({'enabled': True, 'hostname': 'asaquevoa1-ctrl.github.io', 'site_token': 'a' * 32}))
            output = Path(directory) / 'public'
            report = build(output, root=root, today=self.anchor)
            app = output / 'spidey-app'
            self.assertEqual(report['web_analytics'], {'enabled': True, 'provider': 'cloudflare'})
            self.assertEqual(validate_shell((app / 'index.html').read_text(), {}, 'github-pages'), [])
            self.assertEqual((app / 'web-analytics.js').read_bytes(), (ROOT / 'spidey-app/web-analytics.js').read_bytes())
            self.assertFalse((output / 'config').exists())
            self.assertEqual((app / 'data/events.json').read_bytes(), (ROOT / 'spidey-app/data/events.json').read_bytes())

    def test_invalid_stats_configuration_cannot_change_the_destination(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = root / 'config/spidey-web-analytics.json'
            path.parent.mkdir()
            for config in [
                {'enabled': True, 'hostname': 'other.example', 'site_token': 'a' * 32},
                {'enabled': 'true', 'hostname': 'asaquevoa1-ctrl.github.io', 'site_token': 'a' * 32},
                {'enabled': True, 'hostname': 'asaquevoa1-ctrl.github.io', 'site_token': 123},
                {'enabled': False, 'hostname': 'asaquevoa1-ctrl.github.io', 'site_token': 'a' * 32},
            ]:
                path.write_text(json.dumps(config))
                with self.assertRaises(ValueError):
                    read_analytics(root)


if __name__ == '__main__':
    unittest.main()
