import base64
import io
import os
import re

import requests
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
OPENAI_IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-2.5-flare")
OPENAI_IMAGE_QUALITY = os.getenv("OPENAI_IMAGE_QUALITY", "medium")


def _font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def _wrap(draw, text, font, max_width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def _clean(text):
    text = text or ""
    text = text.replace("**", "")
    text = re.sub(r"Fonte original:\s*https?://\S+", "", text, flags=re.I)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"Detectado e classificado automaticamente pelo Spidey", "", text, flags=re.I)
    text = re.sub(r"[🕷️🔗]+", "", text)
    return re.sub(r"\s+", " ", text).strip(" •-\n")


def _headline_body(text):
    if not text:
        return "NOVIDADE POKÉMON GO", "Nova informação detectada pelo Spidey."
    parts = re.split(r"(?<=[.!?])\s+", text)
    headline = parts[0].strip()
    body = " ".join(parts[1:]).strip()
    if len(headline) > 82:
        headline = headline[:79].rstrip() + "..."
    if not body:
        body = "Confira os detalhes completos e acompanhe as próximas atualizações no canal Spidey."
    if len(body) > 240:
        body = body[:237].rstrip() + "..."
    return headline, body


def _source(titulo):
    return "G47IX" if "G47IX" in (titulo or "").upper() else "FONTE"


def _category(titulo):
    upper = (titulo or "").upper()
    for item in ("EVENTO", "CÓDIGO", "ATUALIZAÇÃO", "NOTÍCIA"):
        if item in upper:
            return item
    return "NOTÍCIA"


def _fit_headline(draw, text, max_width=555, max_lines=4):
    for size in range(66, 39, -2):
        font = _font(size, True)
        lines = _wrap(draw, text, font, max_width)
        if len(lines) <= max_lines:
            return font, lines
    font = _font(40, True)
    return font, _wrap(draw, text, font, max_width)[:max_lines]


def _cover_crop(img):
    src_ratio = img.width / img.height
    target_ratio = W / H
    if src_ratio > target_ratio:
        new_w = int(img.height * target_ratio)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    else:
        new_h = int(img.width / target_ratio)
        top = (img.height - new_h) // 2
        img = img.crop((0, top, img.width, top + new_h))
    return img.resize((W, H), Image.Resampling.LANCZOS).convert("RGBA")


def _generate_background(clean, categoria):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY não configurada")

    shiny = bool(re.search(r"\b(shiny|brilhante)\b", clean, flags=re.I))
    shiny_instruction = (
        "If the news highlights a shiny Pokémon, show the shiny form prominently. "
        if shiny else ""
    )

    prompt = f"""
Create a premium vertical social-media key visual for a Pokémon GO fan-news channel.
News topic: {clean[:900]}
Category: {categoria}.
Style: high-end mobile gaming campaign, bright daylight, realistic cinematic rendering,
clean blue/cyan energy, depth, polished materials, dynamic smartphone/game-world composition,
strong focal subject, premium commercial lighting, visually rich but not cluttered.
{shiny_instruction}
Do NOT render any text, captions, logos, watermarks, source names, hashtags or UI words.
Leave a clean lighter area on the LEFT for headline and summary overlays.
Keep the strongest visual subject on the RIGHT half.
The final composition must work after cropping to a 4:5 portrait poster.
""".strip()

    response = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENAI_IMAGE_MODEL,
            "prompt": prompt,
            "size": "1024x1536",
            "quality": OPENAI_IMAGE_QUALITY,
            "output_format": "png",
        },
        timeout=180,
    )
    response.raise_for_status()
    payload = response.json()
    data = payload.get("data") or []
    if not data or not data[0].get("b64_json"):
        raise RuntimeError("API de imagem não retornou b64_json")
    raw = base64.b64decode(data[0]["b64_json"])
    return Image.open(io.BytesIO(raw)).convert("RGBA")


def criar_card_premium(titulo, mensagem):
    clean = _clean(mensagem)
    categoria = _category(titulo)
    source = _source(titulo)
    headline, body = _headline_body(clean)

    bg = _cover_crop(_generate_background(clean, categoria))

    # readability veil over the left side
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for x in range(0, 690):
        t = x / 690
        alpha = int(238 * (1 - t) + 35 * t)
        vd.line((x, 0, x, H), fill=(245, 251, 255, alpha))
    bg.alpha_composite(veil)

    draw = ImageDraw.Draw(bg)
    navy = (9, 39, 80)
    blue = (10, 132, 255)
    pale = (194, 224, 247)

    # Header
    draw.rounded_rectangle((36, 34, 1044, 204), radius=40, fill=navy)
    draw.rounded_rectangle((61, 61, 151, 151), radius=28, fill=blue)
    draw.ellipse((88, 88, 124, 124), outline=(255, 255, 255), width=7)
    draw.line((75, 106, 138, 106), fill=(255, 255, 255), width=8)
    draw.text((177, 62), "SPIDEY", font=_font(59, True), fill=(255, 255, 255))
    draw.text((180, 132), "POKÉMON GO • NOTÍCIAS • EVENTOS • COORDENADAS", font=_font(23, True), fill=pale)
    draw.rounded_rectangle((824, 72, 1011, 127), radius=22, fill=(255, 255, 255))
    draw.text((848, 88), f"FONTE: {source}", font=_font(19, True), fill=navy)

    # Category
    draw.rounded_rectangle((52, 246, 370, 324), radius=25, fill=blue)
    draw.text((87, 263), categoria, font=_font(32, True), fill=(255, 255, 255))

    # Headline
    hf, hlines = _fit_headline(draw, headline.upper())
    y = 360
    for i, line in enumerate(hlines):
        color = blue if i == 1 and len(hlines) > 1 else navy
        draw.text((54, y), line, font=hf, fill=color)
        y += hf.size + 5
    draw.rounded_rectangle((54, y + 10, 164, y + 18), radius=4, fill=blue)

    # Body
    bf = _font(33, False)
    by = y + 58
    for line in _wrap(draw, body, bf, 515)[:5]:
        draw.text((54, by), line, font=bf, fill=(25, 55, 88))
        by += 47

    # Data chips only when true
    coords = re.findall(r"[-+]?\d{1,2}\.\d{3,}\s*,\s*[-+]?\d{1,3}\.\d{3,}", clean)
    shiny = bool(re.search(r"\b(shiny|brilhante)\b", clean, flags=re.I))
    gpx = "gpx" in clean.lower()
    chips = []
    if shiny:
        chips.append("SHINY")
    if coords:
        chips.append("COORDENADAS")
    if gpx:
        chips.append("GPX")

    if chips:
        x = 55
        cy = 930
        for label in chips:
            tw = draw.textbbox((0, 0), label, font=_font(24, True))[2]
            bw = tw + 48
            draw.rounded_rectangle((x, cy, x + bw, cy + 58), radius=20, fill=(255, 255, 255, 236), outline=blue, width=3)
            draw.text((x + 24, cy + 15), label, font=_font(24, True), fill=navy)
            x += bw + 14

    # Footer
    footer = Image.new("RGBA", (W, 175), (5, 33, 72, 238))
    bg.alpha_composite(footer, (0, H - 175))
    draw = ImageDraw.Draw(bg)
    draw.text((54, H - 137), f"Fonte: {source}", font=_font(27, True), fill=(255, 255, 255))
    draw.text((54, H - 95), "Canal Spidey • resumo visual automático", font=_font(22, False), fill=(190, 218, 240))
    draw.text((748, H - 136), "SEMPRE UM PASSO", font=_font(22, True), fill=(58, 168, 255))
    draw.text((807, H - 100), "À FRENTE", font=_font(32, True), fill=(255, 255, 255))

    out = io.BytesIO()
    bg.convert("RGB").save(out, format="PNG", optimize=True)
    out.seek(0)
    return out.getvalue()
