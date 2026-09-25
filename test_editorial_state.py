import unittest
from unittest.mock import patch

from scripts.discord_publish_bridge import (
    BINDING_VERSION,
    clean_embed,
    signature,
    status_publicavel,
    validar_vinculo_aprovacao,
)
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

    def _binding_data(self):
        hash_ok = "a" * 64
        return {
            "status": "approved",
            "needs_art_revision": False,
            "approval_binding_version": BINDING_VERSION,
            "art_revision": 3,
            "approved_revision": 3,
            "image_url": "https://example.com/r3.jpg",
            "approved_image_url": "https://example.com/r3.jpg",
            "discord_approval_id": "123",
            "approved_discord_approval_id": "123",
            "approved_art_sha256": hash_ok,
        }

    @patch("scripts.discord_publish_bridge._message_image_sha256", return_value="a" * 64)
    @patch("scripts.discord_publish_bridge._current_art_sha256", return_value="a" * 64)
    def test_binding_exato_libera_publicacao(self, _current, _message):
        ok, detail = validar_vinculo_aprovacao(self._binding_data(), {}, "123")
        self.assertTrue(ok)
        self.assertEqual(detail, "a" * 64)

    @patch("scripts.discord_publish_bridge._message_image_sha256", return_value="a" * 64)
    @patch("scripts.discord_publish_bridge._current_art_sha256", return_value="a" * 64)
    def test_binding_bloqueia_aprovacao_de_revisao_antiga(self, _current, _message):
        data = self._binding_data()
        data["art_revision"] = 4
        ok, detail = validar_vinculo_aprovacao(data, {}, "123")
        self.assertFalse(ok)
        self.assertIn("difere", detail)

    @patch("scripts.discord_publish_bridge._message_image_sha256", return_value="a" * 64)
    @patch("scripts.discord_publish_bridge._current_art_sha256", return_value="a" * 64)
    def test_binding_bloqueia_mensagem_antiga(self, _current, _message):
        data = self._binding_data()
        data["discord_approval_id"] = "999"
        ok, detail = validar_vinculo_aprovacao(data, {}, "123")
        self.assertFalse(ok)
        self.assertIn("mensagem", detail)

    @patch("scripts.discord_publish_bridge._message_image_sha256", return_value="a" * 64)
    @patch("scripts.discord_publish_bridge._current_art_sha256", return_value="a" * 64)
    def test_binding_bloqueia_item_marcado_para_revisao(self, _current, _message):
        data = self._binding_data()
        data["needs_art_revision"] = True
        ok, detail = validar_vinculo_aprovacao(data, {}, "123")
        self.assertFalse(ok)
        self.assertIn("needs_art_revision", detail)

    @patch("scripts.discord_publish_bridge._message_image_sha256", return_value="a" * 64)
    @patch("scripts.discord_publish_bridge._current_art_sha256", return_value="b" * 64)
    def test_binding_bloqueia_arquivo_alterado_depois_do_ok(self, _current, _message):
        ok, detail = validar_vinculo_aprovacao(self._binding_data(), {}, "123")
        self.assertFalse(ok)
        self.assertIn("mudou", detail)


if __name__ == "__main__":
    unittest.main()
