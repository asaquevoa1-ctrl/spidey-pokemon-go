"""Guard against resurfacing an explicitly retired NFL event in the public app.

Historical source documents and approved artwork remain untouched.
"""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RETIRED_ID = "2026-10-11-nfl-cardinals-pokemon-go-day"


class RetiredNflPublicCatalogTests(unittest.TestCase):
    def test_nfl_absent_from_both_public_catalogs(self):
        for name in ("events", "local-events"):
            with self.subTest(catalog=name):
                data = json.loads((ROOT / "spidey-app" / "data" / f"{name}.json").read_text(encoding="utf-8"))
                self.assertNotIn(RETIRED_ID, [event["id"] for event in data["events"]])

    def test_other_local_events_preserved(self):
        data = json.loads((ROOT / "spidey-app/data/local-events.json").read_text(encoding="utf-8"))
        ids = {event["id"] for event in data["events"]}
        self.assertIn("2026-10-24-fc-seoul", ids)
        self.assertIn("2026-chicago-fossil-museum", ids)

    def test_app_refreshes_catalog_from_network(self):
        # PWA loads current JSON with network-first strategy; historical assets stay intact.
        worker = (ROOT / "spidey-app/sw.js").read_text(encoding="utf-8")
        self.assertIn("const isData =", worker)
        self.assertIn("fetch(request, { cache: 'no-store' })", worker)

    def test_historical_approved_art_preserved(self):
        art = ROOT / "spidey-app/assets/events/premium/nfl-cardinals-20261011-approved-v1.png"
        self.assertTrue(art.is_file(), "Keep previously approved files; only retire public display.")


if __name__ == "__main__":
    unittest.main()
