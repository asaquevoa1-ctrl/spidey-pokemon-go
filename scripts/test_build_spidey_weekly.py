from datetime import date, datetime
import unittest
from zoneinfo import ZoneInfo

from scripts.build_spidey_weekly import BR, build, event_range


class WeeklyCurrentExpiryTest(unittest.TestCase):
    def test_laic_research_deadline_expires_at_the_official_brazil_boundary(self):
        event_id = "2026-12-04-laic-2027-timed-research-deadline"

        def current_ids(reference):
            payload = build(date(2026, 12, 4), reference=reference)
            return {
                item["id"]
                for section in payload["sections"].values()
                for item in section
            }

        self.assertIn(
            event_id,
            current_ids(datetime.fromisoformat("2026-12-04T16:59:59-03:00")),
        )
        self.assertNotIn(
            event_id,
            current_ids(datetime.fromisoformat("2026-12-04T17:00:01-03:00")),
        )

    def test_tcg_research_deadline_preserves_the_last_us_local_window(self):
        event_id = "2026-11-20-tcg-30th-timed-research-deadline"

        def current_ids(reference):
            payload = build(date(2026, 11, 20), reference=reference)
            return {
                item["id"]
                for section in payload["sections"].values()
                for item in section
            }

        self.assertIn(
            event_id,
            current_ids(datetime.fromisoformat("2026-11-21T04:59:59-03:00")),
        )
        self.assertNotIn(
            event_id,
            current_ids(datetime.fromisoformat("2026-11-21T05:00:01-03:00")),
        )

    def test_minior_leonids_leaves_current_week_after_brazil_end_boundary(self):
        event_id = "2026-11-minior-leonids"

        def current_ids(reference):
            payload = build(date(2026, 11, 20), reference=reference)
            return {
                item["id"]
                for section in payload["sections"].values()
                for item in section
            }

        self.assertIn(
            event_id,
            current_ids(datetime.fromisoformat("2026-11-19T23:59:59-03:00")),
        )
        self.assertNotIn(
            event_id,
            current_ids(datetime.fromisoformat("2026-11-20T00:00:00-03:00")),
        )

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
        self.assertEqual(end.astimezone(ZoneInfo("Europe/London")).date().isoformat(), "2026-11-10")
        self.assertEqual(end.astimezone(ZoneInfo("Europe/London")).time().isoformat(), "23:59:59.999999")


if __name__ == "__main__":
    unittest.main()
