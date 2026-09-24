import os
import unittest
from pathlib import Path

from scripts import g47ix_curated_monitor
from scripts import official_curated_monitor
from scripts import pokeminers_curated_monitor
from scripts import sps_curated_monitor
from scripts.curated_dispatch import _queue_path
from scripts.discord_source_monitor import extrair_coordenadas
from spidey_approval import criar_token, ler_token


class PipelineStabilityTests(unittest.TestCase):
    def test_monitors_import_as_package(self):
        self.assertTrue(callable(official_curated_monitor.main))
        self.assertTrue(callable(g47ix_curated_monitor.main))
        self.assertTrue(callable(pokeminers_curated_monitor.main))
        self.assertTrue(callable(sps_curated_monitor.main))

    def test_official_parser_deduplicates_news(self):
        parser = official_curated_monitor.NewsParser()
        parser.feed(
            '<a href="/pt-BR/news/a">Notícia A</a>'
            '<a href="/pt-BR/news/a">Notícia A</a>'
            '<a href="/pt-BR/news/b">Notícia B</a>'
        )
        self.assertEqual(len(parser.noticias), 2)
        self.assertTrue(parser.noticias[0][1].endswith('/pt-BR/news/a'))

    def test_queue_path_is_deterministic(self):
        payload = {"titulo": "Teste", "mensagem": "Mensagem"}
        p1 = _queue_path(payload, "fonte-123")
        p2 = _queue_path(payload, "fonte-123")
        self.assertEqual(p1, p2)
        self.assertTrue(p1.startswith("queue/pending/"))
        self.assertTrue(p1.endswith(".json"))

    def test_sps_coordinates_are_deduplicated_and_removed_from_body(self):
        texto = (
            "Evento Rattata\n"
            "-25.1234567,-49.1234567\n"
            "-25.1234567, -49.1234567\n"
            "Leve seu time."
        )
        coords = extrair_coordenadas(texto)
        self.assertEqual(coords, [[-25.1234567, -49.1234567]])
        corpo = sps_curated_monitor.remover_coordenadas_do_corpo(texto)
        self.assertNotIn("-25.1234567", corpo)
        self.assertIn("Leve seu time.", corpo)

    def test_approval_token_roundtrip(self):
        token = criar_token({"titulo": "Teste", "imagem_url": "https://example.com/a.jpg"}, "segredo", 60)
        data = ler_token(token, "segredo")
        self.assertEqual(data["titulo"], "Teste")

    def test_reference_curated_assets_are_not_tiny(self):
        for rel in (
            "assets/curated/spidey-city-safari-rio-2026-final.jpg",
            "assets/curated/spidey-mlb-seattle-2026-final.jpg",
        ):
            path = Path(rel)
            self.assertTrue(path.exists(), rel)
            self.assertGreater(path.stat().st_size, 100_000, rel)


if __name__ == "__main__":
    unittest.main()
