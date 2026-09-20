import hashlib
import io
import json
import os
from html.parser import HTMLParser
from urllib.parse import quote, urljoin

import requests
from PIL import Image, ImageFile
from flask import Flask, jsonify, request

from premium_art import criar_card_premium
from spidey_approval import criar_token, ler_token
from spidey_art_v4 import criar_card
from spidey_geo import criar_gpx, extrair_coordenadas, formatar_coordenadas

ImageFile.LOAD_TRUNCATED_IMAGES = True

app = Flask(__name__)

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")
DISCORD_APPROVAL_WEBHOOK = os.getenv("DISCORD_APPROVAL_WEBHOOK") or DISCORD_WEBHOOK
DISCORD_PUBLICADOS_WEBHOOK = os.getenv("DISCORD_PUBLICADOS_WEBHOOK") or DISCORD_WEBHOOK
PUBLIC_BASE_URL = os.getenv(
    "PUBLIC_BASE_URL",
    "https://spidey-pokemon-go.onrender.com",
).rstrip("/")
NEWS_URL = "https://pokemongo.com/pt-BR/news"

ultima_enviada = None
tokens_processados = set()


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


def _segredo_aprovacao():
    return os.getenv("APPROVAL_SECRET") or DISCORD_WEBHOOK or ""


def _html_resultado(titulo, texto, cor="#0a84ff"):
    return f"""<!doctype html>
<html lang="pt-BR">
<head><meta name="viewport" content="width=device-width,initial-scale=1"><title>{titulo}</title></head>
<body style="margin:0;background:#081a33;color:#fff;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh">
<div style="max-width:560px;margin:24px;padding:28px;border-radius:24px;background:#102a4d;box-shadow:0 18px 60px #0008">
<div style="font-size:42px">🕷️</div><h1 style="margin:10px 0;color:{cor}">{titulo}</h1><p style="font-size:18px;line-height:1.5">{texto}</p>
</div></body></html>"""


def mandar_discord(
    titulo,
    mensagem,
    url=None,
    imagem_bytes=None,
    gpx_bytes=None,
    gpx_nome="spidey-rota.gpx",
    webhook_url=None,
    components=None,
):
    webhook_url = webhook_url or DISCORD_WEBHOOK
    if not webhook_url:
        raise RuntimeError("Webhook do Discord não configurado.")

    embed = {
        "title": titulo[:256],
        "description": mensagem[:4000],
        "color": 5763719,
    }
    if url:
        embed["url"] = url
    if imagem_bytes:
        embed["image"] = {"url": "attachment://spidey-card.png"}

    payload = {"embeds": [embed]}
    if components:
        payload["components"] = components

    if imagem_bytes or gpx_bytes:
        files = []
        attachments = []
        indice = 0
        if imagem_bytes:
            files.append(
                (
                    f"files[{indice}]",
                    ("spidey-card.png", imagem_bytes, "image/png"),
                )
            )
            attachments.append({"id": indice, "filename": "spidey-card.png"})
            indice += 1
        if gpx_bytes:
            files.append(
                (
                    f"files[{indice}]",
                    (gpx_nome, gpx_bytes, "application/gpx+xml"),
                )
            )
            attachments.append({"id": indice, "filename": gpx_nome})

        payload["attachments"] = attachments
        resposta = requests.post(
            webhook_url,
            params={"with_components": "true"} if components else None,
            data={"payload_json": json.dumps(payload, ensure_ascii=False)},
            files=files,
            timeout=60,
        )
    else:
        resposta = requests.post(
            webhook_url,
            params={"with_components": "true"} if components else None,
            json=payload,
            timeout=15,
        )

    if not resposta.ok and components and (imagem_bytes or gpx_bytes):
        print(
            f"Discord recusou anexos + componentes ({resposta.status_code}); usando fallback em duas mensagens.",
            flush=True,
        )
        payload_conteudo = dict(payload)
        payload_conteudo.pop("components", None)
        payload_conteudo.pop("attachments", None)
        resposta_conteudo = requests.post(
            webhook_url,
            data={"payload_json": json.dumps(payload_conteudo, ensure_ascii=False)},
            files=files,
            timeout=60,
        )
        if not resposta_conteudo.ok:
            raise RuntimeError(
                f"Discord conteúdo HTTP {resposta_conteudo.status_code}: {resposta_conteudo.text[:500]}"
            )

        resposta_botoes = requests.post(
            webhook_url,
            params={"with_components": "true"},
            json={
                "content": "🕷️ Decida abaixo se esta publicação deve seguir:",
                "components": components,
            },
            timeout=15,
        )
        if not resposta_botoes.ok:
            print(
                f"Discord não exibiu botões ({resposta_botoes.status_code}); links de aprovação permanecem disponíveis.",
                flush=True,
            )
        return

    if not resposta.ok:
        raise RuntimeError(
            f"Discord HTTP {resposta.status_code}: {resposta.text[:500]}"
        )


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


def _preparar_conteudo(dados):
    titulo = dados.get("titulo", "🕷️ Spidey Pokémon GO")
    mensagem_original = dados.get("mensagem", "")
    if not mensagem_original:
        raise ValueError("Mensagem vazia")

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
    imagem_url = dados.get("imagem_url")
    if imagem_url:
        try:
            resposta_imagem = requests.get(imagem_url, timeout=30)
            resposta_imagem.raise_for_status()
            img = Image.open(io.BytesIO(resposta_imagem.content)).convert("RGB")
            arquivo = io.BytesIO()
            img.save(arquivo, format="PNG", optimize=True)
            imagem_bytes = arquivo.getvalue()
            modo_arte = "fornecida"
        except Exception as erro_imagem:
            raise ValueError(f"Falha ao carregar imagem fornecida: {erro_imagem}")

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
            if bool(dados.get("permitir_fallback", False)):
                try:
                    imagem_bytes = criar_card(titulo, mensagem)
                    modo_arte = "fallback_v4"
                except Exception as erro_arte:
                    print(f"Falha ao gerar arte fallback: {erro_arte}", flush=True)
            else:
                modo_arte = "premium_indisponivel"

    return {
        "titulo": titulo,
        "mensagem_original": mensagem_original,
        "mensagem": mensagem,
        "url": dados.get("url"),
        "coordenadas": coordenadas,
        "gpx_bytes": gpx_bytes,
        "gpx_nome": dados.get("gpx_nome", "spidey-coordenadas.gpx"),
        "imagem_bytes": imagem_bytes,
        "modo_arte": modo_arte,
        "erro_premium": erro_premium,
        "gerar_arte": gerar_arte,
        "imagem_url": imagem_url,
    }


def _botoes_aprovacao(token):
    aprovar = f"{PUBLIC_BASE_URL}/aprovar?t={token}"
    rejeitar = f"{PUBLIC_BASE_URL}/rejeitar?t={token}"
    return [
        {
            "type": 1,
            "components": [
                {"type": 2, "style": 5, "label": "✅ Aprovar", "url": aprovar},
                {"type": 2, "style": 5, "label": "❌ Rejeitar", "url": rejeitar},
            ],
        }
    ]


def _links_aprovacao(token):
    aprovar = f"{PUBLIC_BASE_URL}/aprovar?t={token}"
    rejeitar = f"{PUBLIC_BASE_URL}/rejeitar?t={token}"
    return f"\n\n✅ [APROVAR]({aprovar})   ❌ [REPROVAR]({rejeitar})"


def _botao_whatsapp(token):
    preparar = f"{PUBLIC_BASE_URL}/whatsapp?t={token}"
    return [
        {
            "type": 1,
            "components": [
                {
                    "type": 2,
                    "style": 5,
                    "label": "📲 Preparar WhatsApp",
                    "url": preparar,
                }
            ],
        }
    ]


@app.route("/", methods=["GET"])
def home():
    return "🕷️ Spidey Pokémon GO está online!"


@app.route("/enviar", methods=["POST"])
def enviar():
    dados = request.get_json(silent=True) or {}
    try:
        conteudo = _preparar_conteudo(dados)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    if (
        bool(conteudo["gerar_arte"])
        and conteudo["modo_arte"] != "premium"
        and not bool(dados.get("permitir_fallback", False))
    ):
        return jsonify({
            "status": "aguardando_arte_premium",
            "arte": False,
            "modo_arte": conteudo["modo_arte"],
            "diagnostico_premium": conteudo["erro_premium"],
        }), 503

    exige_aprovacao = dados.get(
        "aprovar",
        "G47IX" in conteudo["titulo"].upper(),
    )

    if exige_aprovacao:
        segredo = _segredo_aprovacao()
        if not segredo:
            return jsonify({"erro": "Segredo de aprovação não disponível"}), 500

        token = criar_token(
            {
                "titulo": conteudo["titulo"],
                "mensagem": conteudo["mensagem_original"],
                "url": conteudo["url"],
                "coordenadas": conteudo["coordenadas"],
                "gerar_gpx": bool(conteudo["gpx_bytes"]),
                "gpx_nome": conteudo["gpx_nome"],
                "gerar_arte": bool(conteudo["gerar_arte"]),
                "imagem_url": conteudo.get("imagem_url"),
            },
            segredo,
        )

        mandar_discord(
            f"⏳ APROVAÇÃO • {conteudo['titulo']}",
            conteudo["mensagem"] + "\n\nEscolha uma opção:" + _links_aprovacao(token),
            url=conteudo["url"],
            imagem_bytes=conteudo["imagem_bytes"],
            gpx_bytes=conteudo["gpx_bytes"],
            gpx_nome=conteudo["gpx_nome"],
            webhook_url=DISCORD_APPROVAL_WEBHOOK,
            components=_botoes_aprovacao(token),
        )

        resposta = {
            "status": "enviado",
            "etapa": "aguardando_aprovacao",
            "arte": bool(conteudo["imagem_bytes"]),
            "modo_arte": conteudo["modo_arte"],
            "coordenadas": len(conteudo["coordenadas"]),
            "gpx": bool(conteudo["gpx_bytes"]),
        }
        if conteudo["erro_premium"]:
            resposta["diagnostico_premium"] = conteudo["erro_premium"]
        return jsonify(resposta)

    mandar_discord(
        conteudo["titulo"],
        conteudo["mensagem"],
        url=conteudo["url"],
        imagem_bytes=conteudo["imagem_bytes"],
        gpx_bytes=conteudo["gpx_bytes"],
        gpx_nome=conteudo["gpx_nome"],
    )

    resposta = {
        "status": "enviado",
        "arte": bool(conteudo["imagem_bytes"]),
        "modo_arte": conteudo["modo_arte"],
        "coordenadas": len(conteudo["coordenadas"]),
        "gpx": bool(conteudo["gpx_bytes"]),
    }
    if conteudo["erro_premium"]:
        resposta["diagnostico_premium"] = conteudo["erro_premium"]
    return jsonify(resposta)


@app.route("/aprovar", methods=["GET"])
def aprovar():
    token = request.args.get("t", "")
    segredo = _segredo_aprovacao()
    try:
        dados = ler_token(token, segredo)
    except ValueError as erro:
        return _html_resultado("Link inválido", str(erro), "#ff5a67"), 400

    token_id = hashlib.sha256(token.encode("utf-8")).hexdigest()
    if token_id in tokens_processados:
        return _html_resultado("Já processado", "Esta publicação já recebeu uma decisão.")

    conteudo = _preparar_conteudo(dados)
    if bool(dados.get("gerar_arte")) and conteudo["modo_arte"] != "premium":
        return _html_resultado(
            "Arte premium indisponível",
            "A publicação não foi liberada porque a arte premium ainda não foi gerada. Tente novamente mais tarde.",
            "#ffb84d",
        ), 503

    mandar_discord(
        f"✅ APROVADO • {conteudo['titulo']}",
        conteudo["mensagem"],
        url=conteudo["url"],
        imagem_bytes=conteudo["imagem_bytes"],
        gpx_bytes=conteudo["gpx_bytes"],
        gpx_nome=conteudo["gpx_nome"],
        webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
        components=_botao_whatsapp(token),
    )
    tokens_processados.add(token_id)

    return _html_resultado(
        "Publicação aprovada",
        "O conteúdo foi aprovado e encaminhado para a etapa de publicação do Spidey.",
        "#57e389",
    )


@app.route("/whatsapp", methods=["GET"])
def whatsapp():
    token = request.args.get("t", "")
    segredo = _segredo_aprovacao()
    try:
        dados = ler_token(token, segredo)
    except ValueError as erro:
        return _html_resultado("Link inválido", str(erro), "#ff5a67"), 400

    titulo = str(dados.get("titulo") or "Spidey Pokémon GO")
    mensagem = str(dados.get("mensagem") or "").strip()
    coordenadas = _coordenadas_explicitas(dados.get("coordenadas"))
    if coordenadas:
        mensagem += "\n\n📍 Coordenadas:\n" + formatar_coordenadas(coordenadas)
    url = dados.get("url")
    if url:
        mensagem += f"\n\n🔗 Fonte: {url}"

    texto = f"{titulo}\n\n{mensagem}".strip()
    wa_url = "https://wa.me/?text=" + quote(texto)
    texto_js = json.dumps(texto, ensure_ascii=False)
    texto_html = (
        texto.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )

    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spidey • WhatsApp</title>
<style>
body{{margin:0;background:#07192f;color:#fff;font-family:Arial,sans-serif;padding:20px}}
.card{{max-width:620px;margin:auto;background:#102a4d;border-radius:24px;padding:24px;box-shadow:0 18px 60px #0008}}
h1{{margin:8px 0 16px;color:#57e389}}textarea{{width:100%;min-height:260px;box-sizing:border-box;border:0;border-radius:16px;padding:16px;font-size:16px;line-height:1.45;background:#f7fbff;color:#10213b}}
.btn{{display:block;text-align:center;text-decoration:none;border:0;border-radius:16px;padding:15px;margin-top:12px;font-weight:700;font-size:17px;cursor:pointer}}
.wa{{background:#25D366;color:#062d16}}.copy{{background:#dcecff;color:#0b2a55}}
small{{display:block;margin-top:16px;color:#b9c9df;line-height:1.4}}
</style>
</head>
<body><div class="card"><div style="font-size:40px">🕷️</div><h1>Pronto para o WhatsApp</h1>
<textarea id="texto" readonly>{texto_html}</textarea>
<button class="btn copy" onclick="copiar()">📋 Copiar texto</button>
<a class="btn wa" href="{wa_url}">📲 Abrir WhatsApp</a>
<small>A arte aprovada continua na publicação do Discord. No WhatsApp, selecione o seu Canal e publique a arte junto com este texto.</small>
</div>
<script>
const texto = {texto_js};
async function copiar(){{await navigator.clipboard.writeText(texto); const b=document.querySelector('.copy'); b.textContent='✅ Texto copiado';}}
</script></body></html>"""


@app.route("/rejeitar", methods=["GET"])
def rejeitar():
    token = request.args.get("t", "")
    segredo = _segredo_aprovacao()
    try:
        ler_token(token, segredo)
    except ValueError as erro:
        return _html_resultado("Link inválido", str(erro), "#ff5a67"), 400

    token_id = hashlib.sha256(token.encode("utf-8")).hexdigest()
    if token_id in tokens_processados:
        return _html_resultado("Já processado", "Esta publicação já recebeu uma decisão.")

    tokens_processados.add(token_id)
    return _html_resultado(
        "Publicação rejeitada",
        "Nada foi encaminhado para publicação.",
        "#ffb84d",
    )


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

        dados = {
            "titulo": "📰 Nova notícia oficial Pokémon GO",
            "mensagem": f"{titulo}\n\n✅ Fonte oficial Pokémon GO",
            "url": url,
            "gerar_arte": True,
            "aprovar": True,
        }
        conteudo = _preparar_conteudo(dados)
        segredo = _segredo_aprovacao()
        token = criar_token(
            {
                "titulo": conteudo["titulo"],
                "mensagem": conteudo["mensagem_original"],
                "url": conteudo["url"],
                "coordenadas": conteudo["coordenadas"],
                "gerar_gpx": bool(conteudo["gpx_bytes"]),
                "gpx_nome": conteudo["gpx_nome"],
                "gerar_arte": True,
            },
            segredo,
        )
        mandar_discord(
            f"⏳ APROVAÇÃO • {conteudo['titulo']}",
            conteudo["mensagem"] + "\n\nEscolha uma opção:" + _links_aprovacao(token),
            url=url,
            imagem_bytes=conteudo["imagem_bytes"],
            gpx_bytes=conteudo["gpx_bytes"],
            gpx_nome=conteudo["gpx_nome"],
            webhook_url=DISCORD_APPROVAL_WEBHOOK,
            components=_botoes_aprovacao(token),
        )
        ultima_enviada = url
        return jsonify({
            "status": "enviado",
            "etapa": "aguardando_aprovacao",
            "titulo": titulo,
            "url": url,
        })
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500


if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=porta)
