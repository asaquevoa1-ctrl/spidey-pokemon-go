"""Automated official-news publication must never fabricate game mechanics."""
import copy
import unittest
from datetime import date, timedelta
from scripts.sync_official_news_to_app import canonical, date_from_index, news_record, sync

def base_catalog():
    return [
        {"id": "existing-%s" % i, "source": {"url": "https://pokemongo.com/news/event-%s" % i},
         "art": {"url": "approved-%s.png" % i, "sha256": "locked-%s" % i}}
        for i in range(60)
    ]

class OfficialNewsTests(unittest.TestCase):
    def test_calendar_news_stays_unannounced_until_verified(self):
        target = news_record("New official event announcement", "https://pokemongo.com/news/new-story", date(2026,10,26), date(2026,10,26))
        self.assertEqual(target["content_type"], "news")
        self.assertEqual(target["calendar"], {"mode": "hidden"})
        self.assertEqual(target["notifications"]["enabled"], False)
        self.assertEqual(target["presentation"]["requires_art"], False)
        self.assertNotIn("schedule", target)
        self.assertNotIn("pokemon", target)
        self.assertNotIn("gpx", target)
        self.assertEqual(target["audit"]["editorial_detail_pending"], True)
        self.assertEqual(target["source"]["confidence"], "official")

    def test_url_identity_matches_localized_edition_and_rejects_other_domains(self):
        a=canonical("https://pokemongo.com/pt-BR/news/halloween-part-1-2026")
        b=canonical("https://pokemongo.com/news/halloween-part-1-2026?utm_source=news")
        self.assertEqual(a,b)
        self.assertFalse(canonical("https://not-pokemongo.com/news/fake"))
        self.assertFalse(canonical("http://pokemongo.com/news/no-http"))
        self.assertFalse(canonical("https://pokemongo.com/"))

    def test_index_dates_are_checked_before_publishing(self):
        self.assertEqual(date_from_index("Oct 26, 2026 A new event was announced"),date(2026,10,26))
        self.assertEqual(date_from_index("Nov 2, 2026 New raid day"),date(2026,11,2))
        self.assertIsNone(date_from_index("No date available"))
        self.assertIsNone(date_from_index("Oct 40, 2026 Impossible day"))

    def test_new_official_headline_is_appended_once_with_existing_art_unchanged(self):
        today=date(2026,10,26)
        all_records=base_catalog()
        before=copy.deepcopy(all_records)
        lines=[
            ("Oct 26, 2026 New special Pokémon GO event announced","https://pokemongo.com/news/new-special-event"),
            ("Oct 26, 2026 New special Pokémon GO event announced","https://pokemongo.com/pt-BR/news/new-special-event"),
            ("Oct 25, 2026 Already registered event","https://pokemongo.com/pt-BR/news/event-1"),
            ("Oct 26, 2026 Other official story for news","https://pokemongo.com/news/another-story"),
        ]
        result,report=sync(all_records,lines,today)
        self.assertEqual(report["new"],2)
        self.assertEqual(result[:60],before)
        self.assertEqual(len(result),62)
        result2,report2=sync(result,lines,today)
        self.assertEqual(report2["new"],0)
        self.assertEqual(result2,result)

    def test_stale_dates_or_unknown_sources_cannot_be_published(self):
        today=date(2026,10,26)
        rows=[
            ("Oct 1, 2026 Obsolete season article from October","https://pokemongo.com/news/old-season"),
            ("Oct 26, 2026 Unauthorized external link","https://evil.example/news/fake"),
            ("Oct 26, 2026 New current news from official site","https://pokemongo.com/news/new-current"),
        ]
        result,report=sync(base_catalog(),rows,today)
        self.assertEqual(report["new"],1)
        self.assertEqual(len(result),61)

    def test_empty_and_corrupted_index_are_never_accepted(self):
        with self.assertRaises(ValueError):
            sync(base_catalog(), [], date(2026,10,26))
        with self.assertRaises(ValueError):
            sync(base_catalog(), [("Welcome official homepage","https://pokemongo.com/news/item-%s"%i) for i in range(6)],date(2026,10,26))
        with self.assertRaises(ValueError):
            sync([], [("Oct 26, 2026 Today news","https://pokemongo.com/news/item")],date(2026,10,26))
