import json
import os
from html.parser import HTMLParser
from urllib.parse import urljoin

import requests
from flask import Flask, jsonify, request

from premium_art import criar_card_premium
from spidey_art_v4 import criar_card

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


def mandar_discord(titulo, mensagem, url=None, imagem_bytes=None):
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
        resposta = requests.post(
            DISCORD_WEBHOOK,
            data={
                "payload_json": json.dumps({"embeds": [embed]}, ensure_ascii=False)
            },
            files={
                "file": ("spidey-card.png", imagem_bytes, "image/png")
            },
            timeout=30,
        )
    else:
        resposta = requests.post(
            DISCORD_WEBHOOK,
            json={"embeds": [embed]},
            timeout=15,
        )
    resposta.raise_for_status()


@app.route("/", methods=["GET"])
def home():
    return "🕷️ Spidey Pokémon GO está online!"


@app.route("/enviar", methods=["POST"])
def enviar():
    dados = request.get_json(silent=True) or {}
    titulo = dados.get("titulo", "🕷️ Spidey Pokémon GO")
    mensagem = dados.get("mensagem", "")

    if not mensagem:
        return jsonify({"erro": "Mensagem vazia"}), 400

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
    )

    resposta = {
        "status": "enviado",
        "arte": bool(imagem_bytes),
        "modo_arte": modo_arte,
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
