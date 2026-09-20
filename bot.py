import os
import re
from html.parser import HTMLParser
from urllib.parse import urljoin

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")
NEWS_URL = "https://pokemongo.com/pt-BR/news"
G47IX_PROFILE = "https://twstalker.com/g47ix"

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
        headers={
            "User-Agent": "Mozilla/5.0"
        },
        timeout=20
    )

    resposta.raise_for_status()

    parser = NewsParser()
    parser.feed(resposta.text)

    if not parser.noticias:
        raise RuntimeError(
            "Nenhuma notícia encontrada."
        )

    return parser.noticias[0]


def buscar_g47ix():
    resposta = requests.get(
        G47IX_PROFILE,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 Chrome/140 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml"
        },
        timeout=25
    )

    resposta.raise_for_status()

    ids = set(
        re.findall(
            r"/g47ix/status/(\d{15,})",
            resposta.text,
            flags=re.IGNORECASE
        )
    )

    if not ids:
        raise RuntimeError(
            "Fonte G47IX respondeu, mas nenhuma publicação foi encontrada."
        )

    ultimo_id = max(ids, key=int)

    return {
        "id": ultimo_id,
        "url": f"https://x.com/g47ix/status/{ultimo_id}",
        "quantidade_encontrada": len(ids),
        "fonte": G47IX_PROFILE
    }


def mandar_discord(titulo, mensagem, url=None):
    if not DISCORD_WEBHOOK:
        raise RuntimeError(
            "DISCORD_WEBHOOK não configurado."
        )

    embed = {
        "title": titulo[:256],
        "description": mensagem[:4000],
        "color": 5763719
    }

    if url:
        embed["url"] = url

    resposta = requests.post(
        DISCORD_WEBHOOK,
        json={
            "embeds": [embed]
        },
        timeout=15
    )

    resposta.raise_for_status()


@app.route("/", methods=["GET"])
def home():
    return "🕷️ Spidey Pokémon GO está online!"


@app.route("/enviar", methods=["POST"])
def enviar():
    dados = request.get_json(silent=True) or {}

    titulo = dados.get(
        "titulo",
        "🕷️ Spidey Pokémon GO"
    )

    mensagem = dados.get(
        "mensagem",
        ""
    )

    if not mensagem:
        return jsonify(
            {"erro": "Mensagem vazia"}
        ), 400

    mandar_discord(
        titulo,
        mensagem
    )

    return jsonify({
        "status": "enviado"
    })


@app.route("/check-oficial", methods=["GET"])
def check_oficial():
    global ultima_enviada

    try:
        titulo, url = buscar_noticia()

        enviar_agora = (
            request.args.get("send") == "1"
        )

        if not enviar_agora:
            return jsonify({
                "status": "encontrada",
                "titulo": titulo,
                "url": url
            })

        if ultima_enviada == url:
            return jsonify({
                "status": "sem novidade",
                "titulo": titulo,
                "url": url
            })

        mandar_discord(
            "📰 Nova notícia oficial",
            (
                f"**{titulo}**\n\n"
                "✅ Fonte oficial Pokémon GO\n"
                "🕷️ Detectado pelo Spidey"
            ),
            url
        )

        ultima_enviada = url

        return jsonify({
            "status": "enviado",
            "titulo": titulo,
            "url": url
        })

    except Exception as erro:
        return jsonify({
            "erro": str(erro)
        }), 500


@app.route("/check-g47ix-source", methods=["GET"])
def check_g47ix_source():
    try:
        dados = buscar_g47ix()
        return jsonify({
            "status": "ok",
            **dados
        })
    except Exception as erro:
        return jsonify({
            "status": "erro",
            "erro": str(erro)
        }), 500


if __name__ == "__main__":
    porta = int(
        os.environ.get("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=porta
    )
