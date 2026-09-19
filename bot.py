import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")

@app.route("/", methods=["GET"])
def home():
    return "🕷️ Spidey Pokémon GO está online!"

@app.route("/enviar", methods=["POST"])
def enviar():
    dados = request.get_json(silent=True) or {}

    mensagem = dados.get("mensagem", "")
    titulo = dados.get("titulo", "🕷️ Spidey Pokémon GO")

    if not mensagem:
        return jsonify({"erro": "Mensagem vazia"}), 400

    payload = {
        "embeds": [{
            "title": titulo,
            "description": mensagem,
            "color": 16763904
        }]
    }

    resposta = requests.post(DISCORD_WEBHOOK, json=payload, timeout=15)

    if resposta.status_code in (200, 204):
        return jsonify({"status": "enviado"}), 200

    return jsonify({
        "erro": "Discord recusou a mensagem",
        "codigo": resposta.status_code
    }), 500


if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=porta)
