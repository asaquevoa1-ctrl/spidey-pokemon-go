import base64
import io
import json
import os
import re
import tempfile
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

import requests
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont

QUEUE = Path("queue/curated")
ASSETS = Path("assets/generated")
LOGO = Path("assets/spidey-logo-oficial.jpg")
REPO = os.getenv("GITHUB_REPOSITORY", "asaquevoa1-ctrl/spidey-pokemon-go").strip()
BRANCH = os.getenv("SPIDEY_ASSET_BRANCH", "main").strip() or "main"
MODEL = os.getenv("SPIDEY_IMAGE_MODEL", "gpt-image-2.5-sunburst").strip()
STANDARD = "spidey-premium-v1"
GOLD_ENGINE = "spidey-gold-openai-v1"
GOLD_REFERENCE = "spidey-gold-standard-2026-09-25"
ELIGIBLE = {"pending", "awaiting_gold_art", "rejected_art"}
UA = "Mozilla/5.0 (SpideyPokemonGO/3.0)"


class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_p = False
        self.parts = []
        self.paragraphs = []
        self.description = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = (a.get("property") or a.get("name") or "").lower()
            value = (a.get("content") or "").strip()
            if key in {"description", "og:description", "twitter:description"} and value and not self.description:
                self.description = unescape(value)
        elif tag == "p":
            self.in_p = True
            self.parts = []

    def handle_data(self, data):
        if self.in_p and data.strip():
            self.parts.append(data.strip())

    def handle_endtag(self, tag):
        if tag == "p" and self.in_p:
            text = re.sub(r"\s+", " ", " ".join(self.parts)).strip()
            if len(text) >= 35:
                self.paragraphs.append(text)
            self.in_p = False
            self.parts = []


def source_label(item):
    sid = str(item.get("_source_id") or "")
    if sid.startswith("oficial-"):
        return "Pokémon GO oficial"
    if sid.startswith("g47ix-"):
        return "G47IX"
    if sid.startswith("pokeminers-"):
        return "PokeMiners"
    if sid.startswith("sps-"):
        return "SPS"
    return "Spidey"


def raw_url(path):
    return f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{path.as_posix()}"


def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()


def fetch_page_context(url):
    if not str(url or "").startswith("http"):
        return ""
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=35, allow_redirects=True)
        r.raise_for_status()
        parser = PageText()
        parser.feed(r.text)
        chunks = []
        if parser.description:
            chunks.append(parser.description)
        chunks.extend(parser.paragraphs[:14])
        return "\n".join(dict.fromkeys(x for x in chunks if x))[:7500]
    except Exception as exc:
        print("GOLD_CONTEXT_ERROR", exc)
        return ""


def fetch_source_image(url):
    r = requests.get(str(url), headers={"User-Agent": UA}, timeout=45, allow_redirects=True)
    r.raise_for_status()
    if len(r.content) < 8000:
        raise RuntimeError("mídia-fonte pequena ou inválida")
    image = Image.open(io.BytesIO(r.content)).convert("RGB")
    if image.width < 450 or image.height < 300:
        raise RuntimeError(f"mídia-fonte insuficiente: {image.width}x{image.height}")
    image.thumbnail((1536, 1536), Image.Resampling.LANCZOS)
    return image


def clean_title(item):
    title = re.sub(r"^[^A-Za-zÀ-ÿ0-9]+", "", str(item.get("titulo") or "Pokémon GO")).strip()
    return title or "Pokémon GO"


def prompt_for(item, revision, page_context):
    message = str(item.get("mensagem") or "").strip()
    title = clean_title(item)
    constraints = ", ".join(str(x) for x in (item.get("visual_constraints") or [])) or "nenhuma regra extra"
    revision_note = "primeira geração" if revision <= 1 else f"revisão R{revision}; mudar de forma perceptível a composição em relação à anterior"
    return f"""
Crie UMA arte final vertical premium para o canal brasileiro Spidey Pokémon GO.

Isto NÃO é um card simples, NÃO é uma captura emoldurada e NÃO deve colocar a imagem de referência dentro de uma caixa. Reconstrua a cena como uma peça promocional cinematográfica completa, rica e compartilhável, com profundidade, iluminação premium, cenário temático, personagem/evento dominante, contraste forte, acabamento gamer/editorial e composição visual equivalente a campanha oficial de grande evento.

PADRÃO VISUAL OBRIGATÓRIO SPIDEY GOLD STANDARD:
- vertical 2:3, mobile-first;
- protagonista grande integrado ao ambiente, não uma foto colada;
- azul neon + dourado como identidade de apoio, sem engessar a paleta temática do evento;
- título principal muito forte, grande e legível;
- blocos informativos premium integrados à cena, com ícones limpos;
- aparência cinematográfica, vibrante, moderna e de alto impacto;
- jamais aparência genérica, template simples, dashboard corporativo, caixa de remédio ou screenshot dentro de moldura;
- texto visível em português do Brasil, exceto nomes oficiais, nomes de Pokémon e marcas;
- não inventar datas, horários, bônus, shiny, locais, recompensas ou itens;
- se algum dado não estiver confirmado no contexto factual, simplesmente omita esse bloco;
- não desenhe logotipo Spidey, não crie marca d'água Spidey e não duplique branding: o logotipo oficial será aplicado depois pelo sistema;
- deixe uma faixa limpa no topo para o cabeçalho oficial e uma área limpa no rodapé central para o logotipo oficial;
- não inserir marcas d'água aleatórias.

TÍTULO/ASSUNTO:
{title}

TEXTO DA ENTRADA:
{message[:4500]}

CONTEXTO FACTUAL DA FONTE:
{page_context or 'Sem contexto adicional disponível; use somente a entrada e a imagem de referência.'}

REGRAS VISUAIS ESPECÍFICAS:
{constraints}

GERAÇÃO:
{revision_note}

Use a imagem de referência somente para preservar o assunto/personagem e pistas visuais factuais. O resultado deve parecer uma arte nova e premium do Spidey, no mesmo nível visual de peças como City Safari, Autumn Picnic, Hora do Holofote, collabs e alertas premium já aprovados pelo editor.
""".strip()


def overlay_brand(path, item):
    image = Image.open(path).convert("RGBA")
    w, h = image.size
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Cabeçalho fixo oficial.
    draw.rounded_rectangle((30, 28, 205, 92), radius=8, fill=(16, 91, 218, 245))
    draw.text((52, 43), "SPIDEY", font=font(31, True), fill="white")
    draw.rectangle((222, 31, 226, 91), fill=(240, 245, 255, 235))
    draw.text((245, 33), "POKÉMON GO", font=font(22, True), fill="white")
    draw.text((245, 62), "NOTÍCIAS • EVENTOS • COMUNIDADE", font=font(17, True), fill=(240, 245, 255, 245))
    slogan = "SEMPRE\nUM PASSO\nÀ FRENTE"
    draw.multiline_text((w - 190, 28), slogan, font=font(19, False), fill="white", spacing=5, align="center")
    draw.rectangle((w - 135, 105, w - 62, 111), fill=(20, 119, 255, 245))

    # Rodapé escurecido para assinatura oficial sem competir com a arte.
    footer_h = 250
    for y in range(h - footer_h, h):
        t = (y - (h - footer_h)) / footer_h
        alpha = int(25 + 205 * t)
        draw.line((0, y, w, y), fill=(0, 10, 28, alpha))

    logo = Image.open(LOGO).convert("RGB")
    side = min(215, int(w * 0.21))
    logo = logo.resize((side, side), Image.Resampling.LANCZOS).convert("RGBA")
    mask = Image.new("L", (side, side), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, side - 1, side - 1), fill=255)
    lx = (w - side) // 2
    ly = h - side - 25
    overlay.paste(logo, (lx, ly), mask)

    line_y = ly + side // 2
    draw.rectangle((35, line_y, lx - 18, line_y + 5), fill=(235, 194, 73, 235))
    draw.rectangle((lx + side + 18, line_y, w - 35, line_y + 5), fill=(235, 194, 73, 235))
    draw.text((45, h - 105), "JOGO\nEXPLORAÇÃO\nCOMUNIDADE", font=font(16, False), fill=(247, 249, 252, 240), spacing=7)
    src = f"Fonte: {source_label(item)}"
    sw = draw.textbbox((0, 0), src, font=font(16, False))[2]
    draw.text((w - sw - 45, h - 70), src, font=font(16, False), fill=(247, 249, 252, 240))

    final = Image.alpha_composite(image, overlay).convert("RGB")
    final.save(path, "JPEG", quality=95, optimize=True)


def clear_approval_state(item):
    for key in (
        "discord_approval_id", "discord_reactions_ready", "sent_at_utc", "approval_reconciled",
        "decision_at_utc", "discord_reactions", "discord_public_id", "published_at_utc",
        "publication_reconciled", "approval_binding_version", "approved_revision",
        "approved_image_url", "approved_discord_approval_id", "approved_art_sha256",
        "approved_at_utc", "approval_binding_error", "published_revision", "published_image_url",
        "published_approval_id", "published_art_sha256", "publication_block_reason",
        "publication_blocked_at_utc",
    ):
        item.pop(key, None)


def prepare_revision(item):
    try:
        current = int(item.get("art_revision") or 1)
    except (TypeError, ValueError):
        current = 1

    status = str(item.get("status") or "")
    force = bool(item.get("force_gold_regeneration"))
    if status == "rejected_art" or force:
        history = item.setdefault("art_revision_history", [])
        history.append({
            "revision": current,
            "status": status if status else "superseded_visual_standard",
            "image_url": item.get("image_url"),
            "discord_approval_id": item.get("discord_approval_id"),
            "decision_at_utc": item.get("decision_at_utc"),
            "discord_reactions": item.get("discord_reactions"),
            "art_generator_version": item.get("art_generator_version"),
            "art_revision_style": item.get("art_revision_style"),
        })
        clear_approval_state(item)
        return current + 1, "human_rejected" if status == "rejected_art" else "gold_standard_upgrade"
    return current, str(item.get("art_revision_reason") or "gold_standard_initial")


def generate_one(path, item):
    if not LOGO.exists():
        raise RuntimeError("logo oficial ausente em assets/spidey-logo-oficial.jpg")
    if not os.getenv("OPENAI_API_KEY", "").strip():
        raise RuntimeError("OPENAI_API_KEY ausente")

    source_url = str(item.get("_source_image") or "").strip()
    if not source_url.startswith("http"):
        raise RuntimeError("_source_image ausente ou inválida")

    revision, reason = prepare_revision(item)
    source = fetch_source_image(source_url)
    page_context = fetch_page_context(item.get("source_url"))
    prompt = prompt_for(item, revision, page_context)

    ASSETS.mkdir(parents=True, exist_ok=True)
    out = ASSETS / f"{path.stem}-gold-r{revision}.jpg"

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        source.save(tmp.name, "PNG")
        temp_name = tmp.name

    try:
        client = OpenAI()
        with open(temp_name, "rb") as ref:
            result = client.images.edit(
                model=MODEL,
                image=ref,
                prompt=prompt,
                size="1024x1536",
                quality="high",
            )
        image_bytes = base64.b64decode(result.data[0].b64_json)
        with Image.open(io.BytesIO(image_bytes)) as probe:
            probe.verify()
        generated = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        if generated.width < 1000 or generated.height < 1200:
            raise RuntimeError(f"imagem Gold em resolução inesperada: {generated.width}x{generated.height}")
        generated.save(out, "JPEG", quality=95, optimize=True)
        overlay_brand(out, item)
    finally:
        try:
            os.unlink(temp_name)
        except OSError:
            pass

    clear_approval_state(item)
    item.update({
        "image_url": raw_url(out),
        "status": "pending",
        "art_revision": revision,
        "art_revision_reason": reason,
        "needs_art_revision": False,
        "art_ready_for_review": True,
        "art_standard_version": STANDARD,
        "art_generator_version": GOLD_ENGINE,
        "art_generation_model": MODEL,
        "visual_reference_set": GOLD_REFERENCE,
        "gold_standard_visual": True,
        "brand_logo_overlay": True,
        "art_revision_style": "gold_cinematic_editorial",
        "gold_generated_at_utc": datetime.now(timezone.utc).isoformat(),
    })
    item.pop("gold_art_error", None)
    item.pop("force_gold_regeneration", None)
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("GOLD_ART_READY", path.name, f"R{revision}", out.as_posix())


def main():
    QUEUE.mkdir(parents=True, exist_ok=True)
    done = 0
    failed = 0
    for path in sorted(QUEUE.glob("*.json")):
        try:
            item = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print("GOLD_JSON_ERROR", path.name, exc)
            continue

        status = str(item.get("status") or "")
        force = bool(item.get("force_gold_regeneration"))
        if status not in ELIGIBLE and not force:
            continue
        if item.get("gold_standard_visual") is True and item.get("art_generator_version") == GOLD_ENGINE and not force and status == "pending":
            continue

        try:
            generate_one(path, item)
            done += 1
        except Exception as exc:
            item["status"] = "awaiting_gold_art"
            item["art_ready_for_review"] = False
            item["gold_art_error"] = str(exc)[:800]
            item["gold_art_retry_at_utc"] = datetime.now(timezone.utc).isoformat()
            clear_approval_state(item)
            path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("GOLD_ART_WAIT", path.name, str(exc))
            failed += 1

    print(f"Gold Standard: {done} pronta(s), {failed} aguardando nova tentativa.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
