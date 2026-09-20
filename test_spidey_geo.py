import unittest

from spidey_geo import criar_gpx, extrair_coordenadas, formatar_coordenadas


class GeoTests(unittest.TestCase):
    def test_extrai_coordenada_decimal_valida(self):
        texto = "Local confirmado: -25.428400, -49.273300"
        self.assertEqual(extrair_coordenadas(texto), [(-25.4284, -49.2733)])

    def test_ignora_valores_fora_do_mapa(self):
        texto = "999.0000, 999.0000 e 91.0000, -49.0000"
        self.assertEqual(extrair_coordenadas(texto), [])

    def test_remove_duplicadas(self):
        texto = "-25.428400,-49.273300 / -25.428400, -49.273300"
        self.assertEqual(len(extrair_coordenadas(texto)), 1)

    def test_gpx_um_ponto(self):
        gpx = criar_gpx([(-25.4284, -49.2733)], "Teste").decode("utf-8")
        self.assertIn('<wpt lat="-25.4284000" lon="-49.2733000">', gpx)
        self.assertNotIn("<rte>", gpx)

    def test_gpx_multiplos_pontos_cria_rota(self):
        gpx = criar_gpx(
            [(-25.4284, -49.2733), (-25.4290, -49.2740)],
            "Teste",
        ).decode("utf-8")
        self.assertIn("<rte>", gpx)
        self.assertEqual(gpx.count("<rtept "), 2)

    def test_formatacao(self):
        saida = formatar_coordenadas([(-25.4284, -49.2733)])
        self.assertEqual(saida, "-25.428400, -49.273300")


if __name__ == "__main__":
    unittest.main()
