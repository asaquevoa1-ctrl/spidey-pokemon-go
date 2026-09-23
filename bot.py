import hashlib
import io
import json
import os
import re
import time
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
WHAPI_BASE_URL = os.getenv("WHAPI_BASE_URL", "https://gate.whapi.cloud").rstrip("/")
WHAPI_TOKEN = os.getenv("WHAPI_TOKEN", "").strip()
WHAPI_CHANNEL_ID = os.getenv("WHAPI_CHANNEL_ID", "").strip()

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

    if not resposta.ok and components:
        print(
            f"Discord recusou componentes ({resposta.status_code}); reenviando conteúdo sem botões.",
            flush=True,
        )
        payload_conteudo = dict(payload)
        payload_conteudo.pop("components", None)
        if imagem_bytes or gpx_bytes:
            resposta_conteudo = requests.post(
                webhook_url,
                data={"payload_json": json.dumps(payload_conteudo, ensure_ascii=False)},
                files=files,
                timeout=60,
            )
        else:
            resposta_conteudo = requests.post(
                webhook_url,
                json=payload_conteudo,
                timeout=15,
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


def _coord_crua(lat, lon):
    def numero(valor):
        return f"{float(valor):.7f}".rstrip("0").rstrip(".")
    return f"{numero(lat)},{numero(lon)}"


def mandar_discord_texto_puro(texto, webhook_url=None):
    webhook_url = webhook_url or DISCORD_WEBHOOK
    if not webhook_url:
        raise RuntimeError("Webhook do Discord não configurado.")
    resposta = requests.post(webhook_url, json={"content": str(texto)[:2000]}, timeout=15)
    if not resposta.ok:
        raise RuntimeError(f"Discord texto HTTP {resposta.status_code}: {resposta.text[:500]}")


def mandar_coordenadas_cruas(coordenadas, webhook_url=None):
    for lat, lon in coordenadas or []:
        mandar_discord_texto_puro(_coord_crua(lat, lon), webhook_url=webhook_url)


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

    # Notícias oficiais detectadas pelo PokeMiners devem chegar limpas e com arte.
    # O link continua servindo para a detecção na origem, mas não é exibido no card.
    if "OFICIAL" in str(titulo).upper() and "POKEMINERS" in mensagem_original.upper():
        mensagem_original = re.sub(
            r"🔗\s*Fonte oficial:\s*https?://\S+",
            "📌 Fonte oficial: Pokémon GO",
            mensagem_original,
            flags=re.I,
        )
        dados = dict(dados)
        dados["url"] = None
        dados["gerar_arte"] = True
        dados["usar_premium"] = False
        dados["permitir_fallback"] = True

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
            if img.width < 1000 or img.height < 1200:
                raise ValueError(f"Arte em baixa resolução: {img.width}x{img.height}; mínimo 1000x1200")
            arquivo = io.BytesIO()
            img.save(arquivo, format="PNG", optimize=True)
            imagem_bytes = arquivo.getvalue()
            modo_arte = "fornecida"
        except Exception as erro_imagem:
            raise ValueError(f"Falha ao carregar imagem fornecida: {erro_imagem}")

    gerar_arte = dados.get("gerar_arte", "G47IX" in titulo.upper())

    if gerar_arte:
        if bool(dados.get("usar_premium", True)) and os.getenv("OPENAI_API_KEY"):
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


def _whapi_configurado():
    return bool(WHAPI_TOKEN and WHAPI_CHANNEL_ID)


def _whapi_caption(conteudo):
    partes = [conteudo["titulo"], conteudo["mensagem_original"]]
    if conteudo["coordenadas"]:
        coords = "\n".join(_coord_crua(lat, lon) for lat, lon in conteudo["coordenadas"])
        partes.append(f"📍 Coordenadas:\n{coords}")
    if conteudo["url"]:
        partes.append(f"🔗 Fonte: {conteudo['url']}")
    return "\n\n".join(str(p).strip() for p in partes if p).strip()


def _publicar_whapi(conteudo):
    if not _whapi_configurado():
        return None
    imagem_url = str(conteudo.get("imagem_url") or "").strip()
    if not imagem_url:
        raise RuntimeError("Imagem publica ausente para publicacao automatica no Canal")

    payload = {
        "to": WHAPI_CHANNEL_ID,
        "media": imagem_url,
        "caption": _whapi_caption(conteudo),
    }
    headers = {
        "Authorization": f"Bearer {WHAPI_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    ultimo_erro = None
    for espera in (0, 2, 5):
        if espera:
            time.sleep(espera)
        try:
            resposta = requests.post(
                f"{WHAPI_BASE_URL}/messages/image",
                headers=headers,
                json=payload,
                timeout=60,
            )
            if resposta.status_code >= 500:
                ultimo_erro = RuntimeError(
                    f"Whapi HTTP {resposta.status_code}: {resposta.text[:500]}"
                )
                continue
            resposta.raise_for_status()
            return resposta.json()
        except (requests.RequestException, ValueError) as erro:
            ultimo_erro = erro

    raise RuntimeError(f"Falha ao publicar no Canal via Whapi: {ultimo_erro}")


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
                },
                {
                    "type": 2,
                    "style": 5,
                    "label": "📢 Abrir canal Spidey",
                    "url": "https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F",
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
                "usar_premium": bool(dados.get("usar_premium", True)),
                "permitir_fallback": bool(dados.get("permitir_fallback", False)),
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
    if bool(dados.get("gerar_arte")) and not conteudo["imagem_bytes"]:
        return _html_resultado(
            "Arte indisponível",
            "A publicação não foi liberada porque nenhuma arte válida está disponível. Tente novamente após corrigir a arte.",
            "#ffb84d",
        ), 503

    if _whapi_configurado():
        try:
            resultado_whapi = _publicar_whapi(conteudo)
        except Exception as erro_whapi:
            mandar_discord_texto_puro(
                f"❌ FALHA WHATSAPP • {conteudo['titulo']}\n{str(erro_whapi)[:1200]}",
                webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
            )
            return _html_resultado(
                "Falha ao publicar no WhatsApp",
                "O Spidey não confirmou a publicação no Canal. A aprovação não foi consumida; tente novamente depois da correção.",
                "#ff5a67",
            ), 502

        tokens_processados.add(token_id)
        detalhe = "Imagem + legenda publicadas automaticamente no Canal Spidey Pokémon GO."
        try:
            sent_id = ((resultado_whapi or {}).get("sent_message") or {}).get("id")
            if sent_id:
                detalhe += f" ID: {sent_id}"
        except Exception:
            pass
        mandar_discord_texto_puro(
            f"✅ WHATSAPP PUBLICADO • {conteudo['titulo']}\n{detalhe}\nhttps://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F",
            webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
        )
        return _html_resultado(
            "Publicado no WhatsApp",
            "A publicação foi enviada automaticamente para o Canal Spidey Pokémon GO com arte e legenda no mesmo post.",
            "#57e389",
        )

    mensagem_publicada = conteudo["mensagem_original"]
    if conteudo["gpx_bytes"]:
        mensagem_publicada += "\n\n🗺️ Arquivo GPX anexado."

    preparar_whatsapp = f"{PUBLIC_BASE_URL}/whatsapp?t={token}"
    mensagem_publicada += (
        f"\n\n📲 [PREPARAR WHATSAPP]({preparar_whatsapp})"
        f"\n📢 [ABRIR CANAL SPIDEY](https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F)"
    )

    mandar_discord(
        f"✅ APROVADO • {conteudo['titulo']}",
        mensagem_publicada,
        url=conteudo["url"],
        imagem_bytes=conteudo["imagem_bytes"],
        gpx_bytes=conteudo["gpx_bytes"],
        gpx_nome=conteudo["gpx_nome"],
        webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
    )
    mandar_coordenadas_cruas(conteudo["coordenadas"], webhook_url=DISCORD_PUBLICADOS_WEBHOOK)
    tokens_processados.add(token_id)

    return _html_resultado(
        "Publicação aprovada",
        "O conteúdo foi aprovado e encaminhado para a etapa de publicação manual porque o gateway automático ainda não está configurado.",
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
    coordenadas_cruas = [_coord_crua(lat, lon) for lat, lon in coordenadas]
    url = dados.get("url")
    imagem_url = str(dados.get("imagem_url") or "").strip()
    if url:
        mensagem += f"\n\n🔗 Fonte: {url}"

    texto = f"{titulo}\n\n{mensagem}".strip()
    wa_url = "https://wa.me/?text=" + quote(texto)
    texto_js = json.dumps(texto, ensure_ascii=False)
    imagem_js = json.dumps(imagem_url, ensure_ascii=False)
    texto_html = (
        texto.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    coords_html = "".join(
        f'<div class="coord"><code>{c}</code><button class="mini" data-coord="{c}" onclick="copiarCoord(this.dataset.coord)">É só copiar</button></div>'
        for c in coordenadas_cruas
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
.wa{{background:#25D366;color:#062d16}}.copy{{background:#dcecff;color:#0b2a55}}.launch{{background:#57e389;color:#062d16}}.download{{background:#f5c84c;color:#2f2600}}
.coord{{display:flex;gap:10px;align-items:center;margin-top:12px;padding:12px;border-radius:14px;background:#07192f}}
.coord code{{flex:1;font-size:17px;word-break:break-all}}.mini{{border:0;border-radius:10px;padding:10px 12px;font-weight:700;cursor:pointer}}
small{{display:block;margin-top:16px;color:#b9c9df;line-height:1.4}}
</style>
</head>
<body><div class="card"><div style="font-size:40px">🕷️</div><h1>Pronto para o WhatsApp</h1>
<textarea id="texto" readonly>{texto_html}</textarea>
<button class="btn launch" onclick="prepararCanal()">🚀 Preparar e abrir canal</button>
<button class="btn download" onclick="baixarArte()">🖼️ Baixar arte</button>
<button class="btn copy" onclick="copiar()">📋 Copiar texto</button>
<a class="btn wa" href="https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F">📢 Abrir canal Spidey Pokémon GO</a>
{('<h2 style="margin-top:22px">📍 Coordenadas</h2><div style="color:#b9c9df">É só copiar</div>' + coords_html) if coordenadas_cruas else ''}
<small>Use Preparar e abrir canal: o Spidey copia o texto, baixa a arte e abre diretamente o canal. No WhatsApp, anexe a imagem recém-baixada e cole o texto. Quando houver coordenadas, envie cada coordenada separadamente.</small>
</div>
<script>
const texto = {texto_js};
const imagemUrl = {imagem_js};
const canalUrl = 'https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F';
async function copiar(){{
  await navigator.clipboard.writeText(texto);
  const b=document.querySelector('.copy');
  b.textContent='✅ Texto copiado';
}}
async function baixarArte(){{
  const b=document.querySelector('.download');
  if (!imagemUrl) {{ b.textContent='⚠️ Arte indisponível'; return false; }}
  try {{
    const r = await fetch(imagemUrl, {{cache:'no-store'}});
    if (!r.ok) throw new Error('Falha ao carregar arte');
    const blob = await r.blob();
    const ext = blob.type.includes('png') ? 'png' : 'jpg';
    const nome = `spidey-post.${{ext}}`;
    const obj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = obj;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(obj), 5000);
    b.textContent='✅ Arte baixada';
    return true;
  }} catch (_) {{
    b.textContent='⚠️ Toque para tentar baixar de novo';
    return false;
  }}
}}
async function prepararCanal(){{
  const b=document.querySelector('.launch');
  b.textContent='⏳ Preparando...';
  try {{ await navigator.clipboard.writeText(texto); }} catch (_) {{}}
  await baixarArte();
  b.textContent='✅ Texto copiado + arte pronta';
  setTimeout(()=>{{ window.location.href=canalUrl; }}, 650);
}}
async function copiarCoord(valor){{await navigator.clipboard.writeText(valor);}}
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
