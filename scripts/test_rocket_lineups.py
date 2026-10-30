"""Offline contract tests; external checks are isolated in the scheduled job."""
import copy
import json
import unittest
from pathlib import Path
from scripts.sync_rocket_lineups import DEST, normalize, source_date, verify_page, run

class RocketSnapshotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snapshot = json.loads(DEST.read_text(encoding="utf-8"))
        cls.raw = {}
        for m in cls.snapshot["members"]:
            cls.raw[m["source_key"]] = [
                {"slot": s["position"], "is_encounter": s["encounter_possible"],
                 "pokemons": [{"name": p["name"], "shiny_available": p["shiny_possible"]} for p in s["pokemon"]]}
                for s in m["slots"]
            ]
        cls.mock_page = "Team GO Rocket Lineups Updated on October 2, 2026 Giovanni Cliff Arlo Sierra " + " ".join(
            mon["name"] for key in ("Giovanni", "Cliff", "Arlo", "Sierra") for mon in cls.raw[key][0]["pokemons"]
        )

    def test_snapshot_roundtrip_matches_source_normalization(self):
        self.assertEqual(self.snapshot["schema_version"], "spidey-rocket-v1")
        self.assertEqual(len(self.snapshot["members"]), 26)
        self.assertEqual(normalize(self.raw), self.snapshot["members"])
        self.assertEqual({m["source_key"] for m in self.snapshot["members"] if m["group"] != "grunt"},
                         {"Giovanni", "Cliff", "Arlo", "Sierra"})
        self.assertEqual(self.snapshot["source"]["source_updated_on"], "2026-10-02")
        self.assertFalse(any("asset_url" in json.dumps(m) for m in self.snapshot["members"]))

    def test_page_date_and_leaders_crosscheck(self):
        self.assertEqual(source_date(self.mock_page), "2026-10-02")
        verify_page(self.raw, self.mock_page)
        old = copy.deepcopy(self.snapshot)
        self.assertEqual(run(self.raw, self.mock_page, old), old)

    def test_visible_html_date_can_be_split_across_tags_without_guessing(self):
        html = (
            '<!doctype html><html><head><title>Team GO Rocket Lineups</title>'
            '<script>const decoy = "Updated on October 30, 2026";</script></head>'
            '<body><h1>Team GO Rocket Lineups</h1>'
            '<div class="source-date">Updated <span>on</span> '
            '<time datetime="2026-10-02"><strong>October</strong> 2, 2026</time></div>'
            '<p>Giovanni Cliff Arlo Sierra Persian Cubone Alolan Grimer Pancham</p>'
            '</body></html>'
        )
        self.assertEqual(source_date(html), "2026-10-02")
        self.assertEqual(source_date("<p>Updated on October <b>2</b> , 2026</p>"), "2026-10-02")
        self.assertEqual(source_date("Updated on October 2, 2026"), "2026-10-02")
        self.assertEqual(run(self.raw, html, self.snapshot), self.snapshot)
        with self.assertRaises(ValueError):
            source_date('<script>Updated on October 2, 2026</script><p>Updated on yesterday</p>')
        with self.assertRaises(ValueError):
            source_date('<p>Updated <b>on</b> unknown date</p>')

    def test_fail_closed_on_missing_or_malicious_source(self):
        bad = copy.deepcopy(self.raw)
        del bad["Giovanni"]
        with self.assertRaises(ValueError):
            normalize(bad)
        bad = copy.deepcopy(self.raw)
        bad["Cliff"][1]["pokemons"] = [{"name": "<script>alert(1)</script>", "shiny_available": True}]
        with self.assertRaises(ValueError):
            normalize(bad)
        with self.assertRaises(ValueError):
            source_date("Updated on yesterday")
        with self.assertRaises(ValueError):
            verify_page(self.raw, "Bad page")
        with self.assertRaises(ValueError):
            run(self.raw, self.mock_page.replace("October 2", "September 2"), self.snapshot)

    def test_catchability_is_never_reinterpreted_as_guaranteed(self):
        for member in self.snapshot["members"]:
            self.assertEqual([s["position"] for s in member["slots"]], [1, 2, 3])
            self.assertTrue(all(type(s["encounter_possible"]) is bool for s in member["slots"]))
            self.assertFalse(any(s.get("guaranteed") for s in member["slots"]))
        self.assertEqual(self.snapshot["members"][0]["slots"][2]["pokemon"][0]["name"], "Zekrom")

if __name__ == "__main__":
    unittest.main()
