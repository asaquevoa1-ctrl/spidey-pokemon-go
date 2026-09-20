import os
from html.parser import HTMLParser
from urllib.parse import urljoin

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")
NEWS_URL = "https://pokemongo.com/pt-BR/news"

ULTIMA_ENVIADA = None


class PokemonNewsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.link_atual = None
        self.textos = []
        self.noticias = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return

        href = dict(attrs).get("href", "")

        if (
            "/news/" in href
            and ("pt-BR" in href or "pt_BR" in href)
        ):
            self.link_atual = href
            self.textos = []

    def handle_data(self, data):
        if self.link_atual:
            texto = data.strip()
            if texto:
                self.textos.append(texto)

    def handle_endtag(self, tag):
        if tag == "a" and self.link_atual:
            titulo = " ".join(self.textos).strip()

            if titulo:
                url = urljoin(NEWS_URL, self.link_atual)

                item = (titulo, url)

                if item not in self.noticias:
                    self.noticias.append(item)

            self.link_atual = None
            self.textos = []


def buscar_noticia():
    resposta = requests.get(
        NEWS_URL,
        headers={
            "User-Agent": "Mozilla/5.0 SpideyPokemonGO/1.0"
        },
        timeout=20
    )

    resposta.raise_for_status()

    parser = PokemonNewsParser()
    parser.feed(resposta.text)

    if not parser.noticias:
        raise RuntimeError(
            "Nenhuma notícia foi encontrada."
        )

    return parser.noticias[0]


def enviar_discord(titulo, url):
    if not DISCORD_WEBHOOK:
        raise RuntimeError(
            "DISCORD_WEBHOOK não configurado."
        )

    payload = {
        "embeds": [
            {
                "title": titulo[:256],
                "url": url,
                "description": (
                    "✅ Fonte oficial Pokémon GO\n"
                    "🕷️ Detectado pelo Spidey"
                ),
                "color": 5763719
            }
        ]
    }

    resposta = requests.post(
        DISCORD_WEBHOOK,
        json=payload,
        timeout=15
    )

    resposta.raise_for_status()


@app.route("/", methods=["GET"])
def home():
    return "🕷️ Spidey Pokémon GO está online!"


@app.route("/enviar", methods=["POST"])
def enviar():
    dados = request.get_json(silent=True) or {}

    mensagem = dados.get("mensagem", "")
    titulo = dados.get(
        "titulo",
        "🕷️ Spidey Pokémon GO"
    )

    if not mensagem:
        return jsonify(
            {"erro": "Mensagem vazia"}
        ), 400

    payload = {
        "embeds": [
            {
                "title": titulo,
                "description": mensagem,
                "color": 16763904
            }
        ]
    }

    resposta = requests.post(
        DISCORD_WEBHOOK,
        json=payload,
        timeout=15
    )

    resposta.raise_for_status()

    return jsonify(
        {"status": "enviado"}
    )


@app.route("/check-oficial", methods=["GET"])
def check_oficial():
    global ULTIMA_ENVIADA

    try:
        titulo, url = buscar_noticia()

        enviar = request.args.get("send") == "1"

        if enviar:
            if ULTIMA_ENVIADA == url:
                return jsonify({
                    "status": "sem novidade",
                    "titulo": titulo,
                    "url": url
                })

            enviar_discord(titulo, url)
            ULTIMA_ENVIADA = url

            return jsonify({
                "status": "enviado",
                "titulo": titulo,
                "url": url
            })

        return jsonify({
            "status": "encontrada",
            "titulo": titulo,
            "url": url
        })

    except Exception as erro:
        return jsonify({
            "erro": str(erro)
        }), 500


if __name__ == "__main__":
    porta = int(
        os.environ.get("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=porta
    )        "erro": "Discord recusou a mensagem",
        "codigo": resposta.status_code
    }), 500


if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=porta)
