import html
import re
from xml.sax.saxutils import escape

_COORD_RE = re.compile(
    r"(?<![\d.])([-+]?\d{1,2}\.\d{3,})\s*[,;]\s*([-+]?\d{1,3}\.\d{3,})(?![\d.])"
)


def extrair_coordenadas(texto):
    """Extrai somente pares decimais plausíveis lat/lon, preservando a ordem."""
    encontrados = []
    vistos = set()

    for lat_s, lon_s in _COORD_RE.findall(texto or ""):
        try:
            lat = float(lat_s)
            lon = float(lon_s)
        except ValueError:
            continue

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            continue

        chave = (round(lat, 7), round(lon, 7))
        if chave in vistos:
            continue

        vistos.add(chave)
        encontrados.append(chave)

    return encontrados


def formatar_coordenadas(coordenadas):
    if not coordenadas:
        return ""

    linhas = []
    for i, (lat, lon) in enumerate(coordenadas, start=1):
        prefixo = f"{i}. " if len(coordenadas) > 1 else ""
        linhas.append(f"{prefixo}{lat:.6f}, {lon:.6f}")
    return "\n".join(linhas)


def criar_gpx(coordenadas, nome="Spidey Pokémon GO"):
    """Cria GPX 1.1. Um ponto vira waypoint; vários pontos também formam rota."""
    if not coordenadas:
        return None

    nome_xml = escape(nome or "Spidey Pokémon GO")
    partes = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx version="1.1" creator="Spidey Pokemon GO" '
        'xmlns="http://www.topografix.com/GPX/1/1" '
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
        'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 '
        'http://www.topografix.com/GPX/1/1/gpx.xsd">',
        f"  <metadata><name>{nome_xml}</name></metadata>",
    ]

    for i, (lat, lon) in enumerate(coordenadas, start=1):
        ponto_nome = nome_xml if len(coordenadas) == 1 else f"{nome_xml} - Ponto {i}"
        partes.append(
            f'  <wpt lat="{lat:.7f}" lon="{lon:.7f}"><name>{ponto_nome}</name></wpt>'
        )

    if len(coordenadas) > 1:
        partes.append(f"  <rte><name>{nome_xml}</name>")
        for i, (lat, lon) in enumerate(coordenadas, start=1):
            partes.append(
                f'    <rtept lat="{lat:.7f}" lon="{lon:.7f}"><name>Ponto {i}</name></rtept>'
            )
        partes.append("  </rte>")

    partes.append("</gpx>")
    return ("\n".join(partes) + "\n").encode("utf-8")
