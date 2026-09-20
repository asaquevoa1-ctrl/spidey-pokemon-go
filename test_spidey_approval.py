import unittest
from unittest.mock import patch

from spidey_approval import criar_token, ler_token


class ApprovalTokenTests(unittest.TestCase):
    def test_roundtrip(self):
        with patch("spidey_approval.time.time", return_value=1_700_000_000):
            token = criar_token(
                {
                    "titulo": "Evento",
                    "mensagem": "Teste",
                    "coordenadas": [[-25.095, -50.161]],
                },
                "segredo-forte",
                ttl_segundos=3600,
            )

        with patch("spidey_approval.time.time", return_value=1_700_000_100):
            dados = ler_token(token, "segredo-forte")

        self.assertEqual(dados["titulo"], "Evento")
        self.assertEqual(dados["mensagem"], "Teste")
        self.assertEqual(dados["coordenadas"], [[-25.095, -50.161]])

    def test_rejeita_assinatura_errada(self):
        token = criar_token({"titulo": "Evento"}, "segredo-certo")
        with self.assertRaises(ValueError):
            ler_token(token, "segredo-errado")

    def test_rejeita_expirado(self):
        with patch("spidey_approval.time.time", return_value=1_000):
            token = criar_token({"titulo": "Evento"}, "segredo", ttl_segundos=10)
        with patch("spidey_approval.time.time", return_value=1_011):
            with self.assertRaises(ValueError):
                ler_token(token, "segredo")


if __name__ == "__main__":
    unittest.main()
