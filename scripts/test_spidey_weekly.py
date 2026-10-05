import copy
import unittest
from datetime import date

from scripts.build_spidey_weekly import build, load, EVENTS_FILE, load_art_master, resolve_weekly_art, validate_weekly


class WeeklyPublicationTests(unittest.TestCase):
    def test_october_week_is_current_even_with_events_without_art(self):
        weekly = build(date(2026, 10, 5))
        validate_weekly(weekly)
        self.assertEqual((weekly["week_start"], weekly["week_end"]), ("2026-10-05", "2026-10-11"))
        items = [item for group in weekly["sections"].values() for item in group]
        tcg = next(item for item in items if item["id"] == "2026-09-tcg-30th-us-retail")
        self.assertEqual(tcg["weekly_art"]["kind"], "missing")
        self.assertFalse(tcg["weekly_art"]["premium"])
        self.assertGreater(weekly["meta"]["events_without_weekly_art"], 0)
        self.assertGreater(weekly["meta"]["events_with_premium_weekly_art"], 0)
        self.assertEqual(weekly["meta"]["events_with_generated_weekly_art"], 0)

    def test_all_approved_originals_outrank_competing_catalog_art(self):
        master = load_art_master()
        for event_id, approved in master.items():
            with self.subTest(event_id=event_id):
                art = resolve_weekly_art({"id": event_id, "art": {"url": "competing.png", "standard": "spidey-premium-v1"}}, master)
                self.assertEqual(art["url"], approved["file"])
                self.assertEqual(art["sha256"], approved["sha256"])
                self.assertTrue(art["premium"])

    def test_official_illustration_is_not_premium_and_cannot_replace_a_missing_master(self):
        event = next(event for event in load(EVENTS_FILE)["events"] if event["id"] == "2026-10-world-space-week")
        master = load_art_master()
        art = resolve_weekly_art(event, master)
        self.assertEqual(art["kind"], "official_illustration")
        self.assertFalse(art["premium"])
        master[event["id"]] = {"file": "assets/missing.png", "sha256": "0" * 64, "status": "APPROVED"}
        self.assertEqual(resolve_weekly_art(event, master)["kind"], "missing")

    def test_publication_gate_rejects_unreviewed_images_and_misleading_coverage(self):
        weekly = build(date(2026, 10, 5))
        forged = copy.deepcopy(weekly)
        item = next(item for group in forged["sections"].values() for item in group)
        item["weekly_art"] = {"url": "unreviewed.png", "premium": True}
        with self.assertRaisesRegex(ValueError, "artwork differs"):
            validate_weekly(forged)
        forged = copy.deepcopy(weekly)
        forged["meta"]["events_with_weekly_art"] = forged["meta"]["events_in_weekly"]
        with self.assertRaisesRegex(ValueError, "counts do not match"):
            validate_weekly(forged)


if __name__ == "__main__":
    unittest.main()
