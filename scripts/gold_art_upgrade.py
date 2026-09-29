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
# Mantém o identificador certificado pelo guard. A composição interna passa a key art v2.
GOLD_ENGINE = "spidey-gold-openai-v1"
GOLD_REFERENCE = "spidey-gold-standard-2026-09-25"
ELIGIBLE = {"pending", "awaiting_gold_art", "rejected_art"}
UA = "Mozilla/5.0 (SpideyPokemonGO/4.0)"


class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_p = False
        self.parts = []
        self.paragraphs = []
        self.description = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            key = (attrs.get("property") or attrs.get("name") or "").lower()
            value = (attrs.get("content") or "").strip()
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
        response = requests.get(url, headers={"User-Agent": UA}, timeout=35, allow_redirects=True)
        response.raise_for_status()
        parser = PageText()
        parser.feed(response.text)
        chunks = []
        if parser.description:
            chunks.append(parser.description)
        chunks.extend(parser.paragraphs[:14])
        return "\n".join(dict.fromkeys(x for x in chunks if x))[:7500]
    except Exception as exc:
        print("GOLD_CONTEXT_ERROR", exc)
        return ""


def fetch_source_image(url):
    response = requests.get(str(url), headers={"User-Agent": UA}, timeout=45, allow_redirects=True)
    response.raise_for_status()
    if len(response.content) < 8000:
        raise RuntimeError("mídia-fonte pequena ou inválida")
    image = Image.open(io.BytesIO(response.content)).convert("RGB")
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
    revision_note = "primeira geração" if revision <= 1 else f"revisão R{revision}; mudar perceptivelmente enquadramento, luz ou profundidade"

    return f"""
Crie apenas o KEY ART cinematográfico vertical 2:3 para uma peça editorial premium de Pokémon GO.

A imagem gerada será finalizada por um sistema gráfico separado. Portanto:
- NÃO escreva título, legenda, data, horário, bônus, número, palavra, marca d'água ou texto de qualquer espécie;
- NÃO desenhe logotipos, marcas ou selos;
- NÃO crie cards, caixas, painéis, molduras, dashboards ou blocos de interface;
- NÃO coloque a imagem de referência dentro de outra imagem;
- NÃO deixe bordas de screenshot, telefone, navegador ou publicação social;
- NÃO invente personagens, formas, roupas, acessórios, shiny, itens ou elementos factuais não sustentados pela referência/contexto;
- preserve com alta fidelidade a identidade visual do Pokémon/personagem e os elementos factuais importantes da referência;
- reconstrua o assunto como uma CENA COMPLETA, full-bleed, com profundidade, atmosfera, iluminação volumétrica, primeiro plano/meio/fundo e acabamento de campanha premium;
- protagonista grande e integrado ao ambiente, nunca parecendo figurinha colada;
- composição mobile-first com leitura imediata;
- azul elétrico e dourado podem aparecer apenas como acentos Spidey, sem destruir a paleta natural do evento;
- reserve espaço visual respirável no terço inferior esquerdo para o título que será aplicado depois pelo sistema;
- mantenha o canto inferior direito relativamente limpo para a assinatura oficial pequena;
- evite áreas totalmente pretas, fundos vazios e estética genérica de template.

ASSUNTO PARA ENTENDER A CENA (não escrever este texto na imagem):
{title}

ENTRADA FACTUAL (usar somente para compreender o contexto visual; não reproduzir texto):
{message[:4200]}

CONTEXTO DA FONTE (não reproduzir texto):
{page_context or 'Sem contexto adicional; preserve apenas o que estiver sustentado pela entrada e pela imagem de referência.'}

REGRAS VISUAIS ESPECÍFICAS:
{constraints}

GERAÇÃO:
{revision_note}

Resultado esperado: key art cinematográfico de campanha, sem tipografia e sem UI. O acabamento editorial, título exato, fonte e logo serão inseridos posteriormente pelo sistema Spidey.
""".strip()


def text_width(draw, value, text_font):
    box = draw.textbbox((0, 0), value, font=text_font)
    return box[2] - box[0]


def wrap_title(draw, value, text_font, max_width):
    words = str(value or "").split()
    if not words:
        return ["POKÉMON GO"]
    lines = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if text_width(draw, candidate, text_font) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def fit_title(draw, value, max_width, max_lines=4):
    for size in range(72, 31, -2):
        title_font = font(size, True)
        lines = wrap_title(draw, value, title_font, max_width)
        if len(lines) <= max_lines and all(text_width(draw, line, title_font) <= max_width for line in lines):
            return title_font, lines
    title_font = font(32, True)
    return title_font, wrap_title(draw, value, title_font, max_width)[:max_lines]


def overlay_brand(path, item):
    image = Image.open(path).convert("RGBA")
    w, h = image.size
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Gradientes editoriais: protegem tipografia sem transformar a arte em um card.
    top_h = max(150, int(h * 0.13))
    for y in range(top_h):
        alpha = int(125 * (1 - y / top_h))
        draw.line((0, y, w, y), fill=(1, 8, 23, alpha))

    bottom_h = max(430, int(h * 0.35))
    start_y = h - bottom_h
    for y in range(start_y, h):
        t = (y - start_y) / bottom_h
        alpha = int(18 + 205 * (t ** 1.65))
        draw.line((0, y, w, y), fill=(1, 8, 23, alpha))

    margin = max(34, int(w * 0.045))

    # Cabeçalho mínimo. Sem caixa azul, slogan ou bloco fixo pesado.
    header_font = font(max(18, int(w * 0.021)), True)
    micro_font = font(max(14, int(w * 0.015)), False)
    draw.text((margin, 34), "SPIDEY  /  POKÉMON GO", font=header_font, fill=(250, 252, 255, 245))
    draw.text((margin, 70), "NOTÍCIAS • EVENTOS • COMUNIDADE", font=micro_font, fill=(188, 217, 245, 225))
    draw.rectangle((margin, 105, margin + int(w * 0.15), 109), fill=(235, 194, 73, 235))

    # Título exato aplicado pelo sistema: sem depender da capacidade tipográfica do modelo de imagem.
    title = clean_title(item)
    max_title_width = int(w * 0.76)
    title_font, lines = fit_title(draw, title, max_title_width)
    line_box = draw.textbbox((0, 0), "Ag", font=title_font)
    line_height = max(38, line_box[3] - line_box[1] + 10)
    title_height = line_height * len(lines)
    title_y = h - 105 - title_height

    # Sombra suave de texto, sem painel retangular.
    for index, line in enumerate(lines):
        y = title_y + index * line_height
        draw.text((margin + 2, y + 3), line, font=title_font, fill=(0, 0, 0, 155))
        draw.text((margin, y), line, font=title_font, fill=(252, 253, 255, 255))

    source = f"Fonte: {source_label(item)}"
    source_font = font(max(15, int(w * 0.016)), False)
    draw.text((margin, h - 58), source, font=source_font, fill=(220, 232, 245, 230))

    # Logo oficial pequeno, como assinatura, não como protagonista.
    if LOGO.exists():
        logo = Image.open(LOGO).convert("RGB")
        side = min(112, max(82, int(w * 0.105)))
        logo = logo.resize((side, side), Image.Resampling.LANCZOS).convert("RGBA")
        mask = Image.new("L", (side, side), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, side - 1, side - 1), fill=255)
        lx = w - margin - side
        ly = h - margin - side
        draw.ellipse((lx - 4, ly - 4, lx + side + 4, ly + side + 4), outline=(235, 194, 73, 220), width=3)
        overlay.paste(logo, (lx, ly), mask)

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
        "art_revision_style": "gold_keyart_editorial_v2",
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
