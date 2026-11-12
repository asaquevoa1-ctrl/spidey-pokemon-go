from datetime import date, datetime
import unittest
from zoneinfo import ZoneInfo

from scripts.build_spidey_weekly import BR, build, event_range


class WeeklyCurrentExpiryTest(unittest.TestCase):
    def test_current_week_excludes_events_ended_before_reference(self):
        payload = build(
            date(2026, 11, 11),
            reference=datetime(2026, 11, 11, 7, 36, tzinfo=BR),
        )
        ids = {
            item["id"]
            for section in payload["sections"].values()
            for item in section
        }
        self.assertNotIn("2026-pokemon-night-out-london", ids)
        self.assertNotIn("2026-11-10-raid-hour-zamazenta-crowned", ids)
        self.assertIn("2026-11-11-max-hour-registeel", ids)
        self.assertIn("2026-11-06-gmax-machamp-research-completion", ids)

    def test_date_only_range_ends_in_the_event_iana_timezone(self):
        london = {
            "schedule": {
                "precision": "date",
                "start_date": "2026-11-10",
                "end_date": "2026-11-10",
                "local_timezone": "Europe/London",
            }
        }
        start, end = event_range(london)
        self.assertEqual(start, datetime(2026, 11, 9, 21, 0, tzinfo=BR))
        self.assertEqual(end.date().isoformat(), "2026-11-10")
        self.assertEqual(end.astimezone(ZoneInfo("Europe/London")).date().isoformat(), "2026-11-11")
        self.assertEqual(end.astimezone(ZoneInfo("Europe/London")).time().isoformat(), "00:00:00")


    def test_timed_events_are_hidden_at_the_exact_local_end(self):
        before_regidrago_end = build(date(2026, 11, 12), reference=datetime(2026, 11, 12, 18, 59, 59, tzinfo=BR))
        at_regidrago_end = build(date(2026, 11, 12), reference=datetime(2026, 11, 12, 19, 0, tzinfo=BR))
        before_into_the_wild_end = build(date(2026, 11, 13), reference=datetime(2026, 11, 13, 19, 59, 59, tzinfo=BR))
        at_into_the_wild_end = build(date(2026, 11, 13), reference=datetime(2026, 11, 13, 20, 0, tzinfo=BR))
        ids_before = {item["id"] for section in before_regidrago_end["sections"].values() for item in section}
        ids_19 = {item["id"] for section in at_regidrago_end["sections"].values() for item in section}
        ids_before_wild_end = {item["id"] for section in before_into_the_wild_end["sections"].values() for item in section}
        ids_wild_end = {item["id"] for section in at_into_the_wild_end["sections"].values() for item in section}
        self.assertIn("2026-11-12-max-hour-regidrago", ids_before)
        self.assertNotIn("2026-11-12-max-hour-regidrago", ids_19)
        self.assertIn("2026-11-09-into-the-wild", ids_19)
        self.assertIn("2026-11-09-into-the-wild", ids_before_wild_end)
        self.assertNotIn("2026-11-09-into-the-wild", ids_wild_end)
        self.assertIn("2026-11-go-wild-area-global", ids_wild_end)


if __name__ == "__main__":
    unittest.main()
