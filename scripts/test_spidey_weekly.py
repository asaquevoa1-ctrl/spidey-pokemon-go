import copy
import io
import json
import os
import tempfile
import unittest
from contextlib import redirect_stdout
from datetime import date, datetime
from pathlib import Path
from unittest.mock import patch

from scripts import build_spidey_weekly as generator
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


class WeeklyWriteTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        root = Path(self.directory.name)
        self.current = root / "weekly/current.json"
        self.app = root / "spidey-app/data/weekly.json"
        self.archive = root / "weekly/archive"
        self.events = root / "events.json"
        self.events.write_bytes(EVENTS_FILE.read_bytes())
        for name, value in (("CURRENT_FILE", self.current), ("APP_WEEKLY_FILE", self.app),
                            ("ARCHIVE_DIR", self.archive), ("EVENTS_FILE", self.events)):
            replacement = patch.object(generator, name, value)
            replacement.start()
            self.addCleanup(replacement.stop)

    def run_generator(self, timestamp, anchor="2026-10-05"):
        output = io.StringIO()
        with patch.dict(os.environ, {"SPIDEY_WEEKLY_DATE": anchor}), \
                patch.object(generator, "datetime", wraps=datetime) as clock, \
                redirect_stdout(output):
            clock.now.return_value = datetime.fromisoformat(timestamp)
            self.assertEqual(generator.main(), 0)
        payload = load(self.current)
        paths = [self.current, self.app, self.archive / f"{payload['week_start']}.json"]
        self.assertTrue(all(load(path) == payload for path in paths))
        validate_weekly(payload)
        return payload, paths, json.loads(output.getvalue())

    def test_unchanged_content_does_not_rewrite_any_weekly_copy(self):
        payload, paths, _ = self.run_generator("2026-10-05T09:00:00-03:00")
        snapshots = {path: path.read_bytes() for path in paths}
        for path in paths:
            os.utime(path, ns=(1234567890000000000, 1234567890000000000))
        repeated, _, result = self.run_generator("2026-10-05T10:00:00-03:00")
        self.assertEqual(repeated, payload)
        self.assertEqual(result["files_changed"], 0)
        for path in paths:
            self.assertEqual(path.read_bytes(), snapshots[path])
            self.assertEqual(path.stat().st_mtime_ns, 1234567890000000000)

    def test_real_calendar_change_updates_all_copies_and_generation_time(self):
        before, _, _ = self.run_generator("2026-10-05T09:00:00-03:00")
        selected = next(item for group in before["sections"].values() for item in group)
        catalog = load(self.events)
        event = next(event for event in catalog["events"] if event["id"] == selected["id"])
        event["summary"] = "Resumo atualizado para o teste de publicação."
        self.events.write_text(json.dumps(catalog), encoding="utf-8")
        after, _, result = self.run_generator("2026-10-05T10:00:00-03:00")
        changed = next(item for group in after["sections"].values() for item in group if item["id"] == selected["id"])
        self.assertEqual(changed["summary"], event["summary"])
        self.assertEqual(after["meta"]["generated_at"], "2026-10-05T10:00:00-03:00")
        self.assertEqual(result["files_changed"], 3)

    def test_missing_or_corrupt_copies_are_repaired_without_a_new_timestamp(self):
        payload, paths, _ = self.run_generator("2026-10-05T09:00:00-03:00")
        self.app.unlink()
        paths[2].write_text("invalid JSON", encoding="utf-8")
        repaired, _, result = self.run_generator("2026-10-05T10:00:00-03:00")
        self.assertEqual(repaired, payload)
        self.assertEqual(result["files_changed"], 2)

    def test_invalid_canonical_json_and_metadata_are_rebuilt(self):
        for invalid in ("invalid JSON", "[]", '{"meta": []}', '{"meta": {"generated_at": null}}'):
            with self.subTest(invalid=invalid):
                self.current.parent.mkdir(parents=True, exist_ok=True)
                self.current.write_text(invalid, encoding="utf-8")
                payload, _, result = self.run_generator("2026-10-05T10:00:00-03:00")
                self.assertEqual(payload["meta"]["generated_at"], "2026-10-05T10:00:00-03:00")
                self.assertGreaterEqual(result["files_changed"], 1)

    def test_new_week_updates_period_and_generation_time(self):
        before, _, _ = self.run_generator("2026-10-11T23:00:00-03:00")
        after, _, result = self.run_generator("2026-10-12T00:00:00-03:00", "2026-10-12")
        self.assertEqual((after["week_start"], after["week_end"]), ("2026-10-12", "2026-10-18"))
        self.assertNotEqual(after["week_start"], before["week_start"])
        self.assertEqual(after["meta"]["generated_at"], "2026-10-12T00:00:00-03:00")
        self.assertEqual(result["files_changed"], 3)


if __name__ == "__main__":
    unittest.main()
