import json
import os
from html.parser import HTMLParser
from urllib.parse import urljoin

import requests
from flask import Flask, jsonify, request

from premium_art import criar_card_premium
from spidey_art_v4 import criar_card
from spidey_geo import criar_gpx, extrair_coordenadas, formatar_coordenadas

app = Flask(__name__)

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")
NEWS_URL = "https://pokemongo.com/pt-BR/news"

ultima_enviada = None


class NewsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.link = None
        self.textos = []
        self.noticias = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href", "")
        if "/news/" in href:
            url = urljoin(NEWS_URL, href)
            if url.rstrip("/") != NEWS_URL.rstrip("/"):
                self.link = url
                self.textos = []

    def handle_data(self, data):
        if self.link:
            texto = data.strip()
            if texto:
                self.textos.append(texto)

    def handle_endtag(self, tag):
        if tag == "a" and self.link:
            titulo = " ".join(self.textos).strip()
            if titulo:
                item = (titulo, self.link)
                if item not in self.noticias:
                    self.noticias.append(item)
            self.link = None
            self.textos = []


def buscar_noticia():
    resposta = requests.get(
        NEWS_URL,
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=20,
    )
    resposta.raise_for_status()
    parser = NewsParser()
    parser.feed(resposta.text)
    if not parser.noticias:
        raise RuntimeError("Nenhuma notícia encontrada.")
    return parser.noticias[0]


def mandar_discord(
    titulo,
    mensagem,
    url=None,
    imagem_bytes=None,
    gpx_bytes=None,
    gpx_nome="spidey-rota.gpx",
):
    if not DISCORD_WEBHOOK:
        raise RuntimeError("DISCORD_WEBHOOK não configurado.")

    embed = {
        "title": titulo[:256],
        "description": mensagem[:4000],
        "color": 5763719,
    }
    if url:
        embed["url"] = url
    if imagem_bytes:
        embed["image"] = {"url": "attachment://spidey-card.png"}

    if imagem_bytes or gpx_bytes:
        files = []
        indice = 0
        if imagem_bytes:
            files.append(
                (
                    f"files[{indice}]",
                    ("spidey-card.png", imagem_bytes, "image/png"),
                )
            )
            indice += 1
        if gpx_bytes:
            files.append(
                (
                    f"files[{indice}]",
                    (gpx_nome, gpx_bytes, "application/gpx+xml"),
                )
            )

        resposta = requests.post(
            DISCORD_WEBHOOK,
            data={
                "payload_json": json.dumps({"embeds": [embed]}, ensure_ascii=False)
            },
            files=files,
            timeout=60,
        )
    else:
        resposta = requests.post(
            DISCORD_WEBHOOK,
            json={"embeds": [embed]},
            timeout=15,
        )
    resposta.raise_for_status()


def _coordenadas_explicitas(valor):
    """Aceita lista [[lat, lon], ...] ou lista de objetos {lat, lon}."""
    if not isinstance(valor, list):
        return []

    saida = []
    vistos = set()
    for item in valor:
        try:
            if isinstance(item, dict):
                lat = float(item["lat"])
                lon = float(item.get("lon", item.get("lng")))
            else:
                lat = float(item[0])
                lon = float(item[1])
        except (KeyError, TypeError, ValueError, IndexError):
            continue

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            continue

        chave = (round(lat, 7), round(lon, 7))
        if chave not in vistos:
            vistos.add(chave)
            saida.append(chave)

    return saida


@app.route("/", methods=["GET"])
def home():
    return "🕷️ Spidey Pokémon GO está online!"


@app.route("/enviar", methods=["POST"])
def enviar():
    dados = request.get_json(silent=True) or {}
    titulo = dados.get("titulo", "🕷️ Spidey Pokémon GO")
    mensagem_original = dados.get("mensagem", "")

    if not mensagem_original:
        return jsonify({"erro": "Mensagem vazia"}), 400

    coordenadas = _coordenadas_explicitas(dados.get("coordenadas"))
    if not coordenadas:
        coordenadas = extrair_coordenadas(mensagem_original)

    gerar_gpx = bool(dados.get("gerar_gpx", True)) and bool(coordenadas)
    gpx_bytes = criar_gpx(coordenadas, titulo) if gerar_gpx else None

    mensagem = mensagem_original
    if coordenadas:
        bloco_coords = formatar_coordenadas(coordenadas)
        mensagem += f"\n\n📍 Coordenadas verificadas na entrada:\n{bloco_coords}"
        if gpx_bytes:
            mensagem += "\n\n🗺️ Arquivo GPX anexado."

    imagem_bytes = None
    modo_arte = "sem_arte"
    erro_premium = None
    gerar_arte = dados.get("gerar_arte", "G47IX" in titulo.upper())

    if gerar_arte:
        if os.getenv("OPENAI_API_KEY"):
            try:
                imagem_bytes = criar_card_premium(titulo, mensagem)
                modo_arte = "premium"
            except Exception as erro:
                erro_premium = str(erro)[:500]
                print(f"Falha na arte premium: {erro_premium}", flush=True)
        else:
            erro_premium = "OPENAI_API_KEY ausente no processo"

        if imagem_bytes is None:
            try:
                imagem_bytes = criar_card(titulo, mensagem)
                modo_arte = "fallback_v4"
            except Exception as erro_arte:
                print(f"Falha ao gerar arte fallback: {erro_arte}", flush=True)

    mandar_discord(
        titulo,
        mensagem,
        url=dados.get("url"),
        imagem_bytes=imagem_bytes,
        gpx_bytes=gpx_bytes,
        gpx_nome=dados.get("gpx_nome", "spidey-coordenadas.gpx"),
    )

    resposta = {
        "status": "enviado",
        "arte": bool(imagem_bytes),
        "modo_arte": modo_arte,
        "coordenadas": len(coordenadas),
        "gpx": bool(gpx_bytes),
    }
    if erro_premium:
        resposta["diagnostico_premium"] = erro_premium
    return jsonify(resposta)


@app.route("/check-oficial", methods=["GET"])
def check_oficial():
    global ultima_enviada
    try:
        titulo, url = buscar_noticia()
        enviar_agora = request.args.get("send") == "1"

        if not enviar_agora:
            return jsonify({"status": "encontrada", "titulo": titulo, "url": url})

        if ultima_enviada == url:
            return jsonify({"status": "sem novidade", "titulo": titulo, "url": url})

        mandar_discord(
            "📰 Nova notícia oficial",
            f"**{titulo}**\n\n✅ Fonte oficial Pokémon GO\n🕷️ Detectado pelo Spidey",
            url,
        )
        ultima_enviada = url
        return jsonify({"status": "enviado", "titulo": titulo, "url": url})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500


if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=porta)
