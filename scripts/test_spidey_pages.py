import ast
import hashlib
import json
import re
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

from scripts.build_spidey_pages import ROOT, build, verify_public_data


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


if __name__ == '__main__':
    unittest.main()
