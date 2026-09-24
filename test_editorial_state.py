import unittest

from scripts.discord_publish_bridge import clean_embed, signature, status_publicavel
from scripts.sync_approval_state import status_terminal


class EditorialStateTests(unittest.TestCase):
    def test_somente_approved_e_publicavel(self):
        self.assertTrue(status_publicavel("approved"))
        for status in (
            None,
            "",
            "sent",
            "pending",
            "published",
            "rejected",
            "rejected_art",
            "decision_conflict",
            "blocked_art_standard",
        ):
            with self.subTest(status=status):
                self.assertFalse(status_publicavel(status))

    def test_estados_bloqueados_sao_terminais_no_sync(self):
        for status in (
            "published",
            "rejected",
            "rejected_art",
            "decision_conflict",
            "blocked_art_standard",
        ):
            with self.subTest(status=status):
                self.assertTrue(status_terminal(status))
        self.assertFalse(status_terminal("sent"))
        self.assertFalse(status_terminal("approved"))

    def test_rodape_de_aprovacao_nao_vai_para_publico(self):
        embed = {
            "title": "Evento",
            "description": "Descrição",
            "footer": {"text": "Reaja com ✅ ou ❌"},
        }
        cleaned = clean_embed(embed)
        self.assertNotIn("footer", cleaned)
        self.assertEqual(cleaned["title"], "Evento")

    def test_assinatura_e_estavel_para_deduplicacao(self):
        message = {
            "embeds": [
                {
                    "title": "  Evento X  ",
                    "description": " Descrição ",
                    "url": " https://example.com/x ",
                }
            ]
        }
        self.assertEqual(
            signature(message),
            ("Evento X", "Descrição", "https://example.com/x"),
        )


if __name__ == "__main__":
    unittest.main()
