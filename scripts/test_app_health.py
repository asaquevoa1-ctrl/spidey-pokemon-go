import json
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path
from scripts.check_app_health import validate_catalogs


class AppHealthTests(unittest.TestCase):
    def catalogs(self):
        return {name: json.loads(Path(f'spidey-app/data/{name}.json').read_text()) for name in ['events','weekly','local-events','pvp']}

    def test_healthy_reference(self):
        data=self.catalogs()
        now=datetime.fromisoformat(data['weekly']['week_start']+'T12:00:00+00:00')
        self.assertEqual(validate_catalogs(data,now),[])

    def test_monitor_detects_missing_chicago_and_incomplete_pvp(self):
        data=self.catalogs()
        data['local-events']['events']=[]
        data['pvp']['leagues']=[]
        errors=validate_catalogs(data,datetime(2026,10,5,15,tzinfo=timezone.utc))
        self.assertIn('Evento de Chicago ausente ou sem confirmação',errors)
        self.assertIn('PvP incompleto',errors)

    def test_monitor_detects_stale_calendar_using_brasilia_date(self):
        data=self.catalogs()
        now=datetime.fromisoformat(data['weekly']['week_end']+'T03:00:00+00:00')+timedelta(days=1)
        self.assertIn('Resumo semanal fora da semana atual',validate_catalogs(data,now))


if __name__=='__main__':
    unittest.main()
