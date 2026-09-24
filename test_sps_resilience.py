import unittest
from unittest.mock import patch

from scripts import sps_weekly_monitor as weekly


class SPSWeeklyResilienceTests(unittest.TestCase):
    def test_classifica_agenda_semanal(self):
        texto = "GO Weekly - Events This Week - Raid Hour and Spotlight Hour"
        self.assertTrue(weekly.semanal(texto))
        self.assertFalse(weekly.semanal("Raid Hour hoje às 18h"))

    def test_falha_de_envio_nao_avanca_cursor(self):
        msg = {"id": "123", "content": "GO Weekly - Events This Week - Raid Hour"}
        with patch.object(weekly, "ler_estado", return_value="122"), \
             patch.object(weekly, "buscar_desde_cursor", return_value=[msg]), \
             patch.object(weekly, "imagens", return_value=[]), \
             patch.object(weekly, "enviar", return_value=False), \
             patch.object(weekly, "salvar_estado") as salvar:
            self.assertEqual(weekly.main(), 0)
            salvar.assert_not_called()

    def test_sucesso_avanca_cursor(self):
        msg = {"id": "123", "content": "GO Weekly - Events This Week - Raid Hour"}
        with patch.object(weekly, "ler_estado", side_effect=["122", "123"]), \
             patch.object(weekly, "buscar_desde_cursor", return_value=[msg]), \
             patch.object(weekly, "imagens", return_value=[]), \
             patch.object(weekly, "enviar", return_value=True), \
             patch.object(weekly, "salvar_estado") as salvar:
            self.assertEqual(weekly.main(), 0)
            salvar.assert_called_once_with("123")

    def test_imagem_sem_texto_ocr_nao_e_descartada(self):
        msg = {"id": "123", "content": "", "attachments": [{"url": "x", "filename": "agenda.png"}]}
        with patch.object(weekly, "ler_estado", return_value="122"), \
             patch.object(weekly, "buscar_desde_cursor", return_value=[msg]), \
             patch.object(weekly, "imagens", return_value=msg["attachments"]), \
             patch.object(weekly, "ocr_primeira_imagem", return_value=""), \
             patch.object(weekly, "salvar_estado") as salvar:
            with self.assertRaises(RuntimeError):
                weekly.main()
            salvar.assert_not_called()


if __name__ == "__main__":
    unittest.main()
