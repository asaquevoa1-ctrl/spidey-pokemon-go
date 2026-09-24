import json
import unittest
from datetime import date, time
from pathlib import Path

from scripts.world_event_times import calcular, texto


CONFIG = Path("config/world_event_points.json")


class WorldEventTimesTests(unittest.TestCase):
    def test_taipei_replaces_singapore_at_position_five(self):
        config = json.loads(CONFIG.read_text(encoding="utf-8"))
        points = config["points"]
        names = [point["name"] for point in points]
        self.assertFalse(any("Singapura" in name or "Singapore" in name for name in names))

        taipei = next(point for point in points if point["order"] == 5)
        self.assertEqual(taipei["name"], "Taipei, Taiwan")
        self.assertEqual(taipei["timezone"], "Asia/Taipei")
        self.assertEqual(taipei["flag"], "🇹🇼")

    def test_taipei_window_is_converted_to_brasilia_from_event_date(self):
        _, rows = calcular(date(2026, 10, 17), time(11, 0), time(17, 0), CONFIG)
        taipei = next(row for row in rows if row["name"] == "Taipei, Taiwan")
        self.assertTrue(taipei["local_start"].startswith("2026-10-17T11:00:00"))
        self.assertTrue(taipei["local_end"].startswith("2026-10-17T17:00:00"))
        self.assertTrue(taipei["brasilia_start"].startswith("2026-10-17T00:00:00"))
        self.assertTrue(taipei["brasilia_end"].startswith("2026-10-17T06:00:00"))

    def test_text_shows_brasilia_and_local_start_end(self):
        output = texto(date(2026, 10, 17), time(11, 0), time(17, 0), CONFIG)
        self.assertIn("🇧🇷 HORÁRIOS DE BRASÍLIA", output)
        self.assertIn("00h00–06h00 — 🇹🇼 Taipei, Taiwan", output)
        self.assertIn("🕒 Local: 11h00–17h00", output)
        self.assertNotIn("Singapura", output)
        self.assertNotIn("Singapore", output)

    def test_overnight_window_moves_end_to_next_local_day(self):
        _, rows = calcular(date(2026, 10, 17), time(22, 0), time(2, 0), CONFIG)
        sao_paulo = next(row for row in rows if row["name"] == "Ibirapuera, São Paulo")
        self.assertTrue(sao_paulo["local_start"].startswith("2026-10-17T22:00:00"))
        self.assertTrue(sao_paulo["local_end"].startswith("2026-10-18T02:00:00"))
        self.assertTrue(sao_paulo["brasilia_end"].startswith("2026-10-18T02:00:00"))


if __name__ == "__main__":
    unittest.main()
