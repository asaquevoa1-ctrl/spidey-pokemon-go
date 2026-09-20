import io
import re
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350

PALETTES = {
    "EVENTO": {
        "navy": (20, 45, 84),
        "accent": (119, 66, 255),
        "accent2": (47, 151, 255),
        "soft": (239, 235, 255),
    },
    "CÓDIGO": {
        "navy": (32, 44, 72),
        "accent": (255, 186, 0),
        "accent2": (255, 116, 0),
        "soft": (255, 247, 220),
    },
    "ATUALIZAÇÃO": {
        "navy": (17, 59, 72),
        "accent": (0, 190, 171),
        "accent2": (0, 135, 165),
        "soft": (224, 249, 245),
    },
    "NOTÍCIA": {
        "navy": (19, 52, 96),
        "accent": (0, 137, 255),
        "accent2": (55, 92, 255),
        "soft": (225, 241, 255),
    },
}


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


def _gradient(top, bottom):
    img = Image.new("RGB", (W, H), top)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(1, H - 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        draw.line((0, y, W, y), fill=color)
    return img


def _wrap(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        width = draw.textbbox((0, 0), trial, font=font)[2]
        if width <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def _fit_headline(draw, text, max_width, max_lines=3):
    for size in range(58, 37, -2):
        font = _font(size, True)
        lines = _wrap(draw, text, font, max_width)
        if len(lines) <= max_lines:
            return font, lines
    font = _font(38, True)
    return font, _wrap(draw, text, font, max_width)[:max_lines]


def _categoria(titulo):
    upper = (titulo or "").upper()
    for item in ("EVENTO", "CÓDIGO", "ATUALIZAÇÃO", "NOTÍCIA"):
        if item in upper:
            return item
    return "NOTÍCIA"


def _limpar_mensagem(mensagem):
    text = mensagem or ""
    text = re.sub(r"https?://\S+", "", text)
    text = text.replace("**", "")
    text = re.sub(r"[🕷️🔗]+", "", text)
    text = re.sub(r"Detectado e classificado automaticamente pelo Spidey", "", text, flags=re.I)
    text = re.sub(r"Fonte original:\s*", "", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip(" •-\n")
    return text


def _extrair_headline(text):
    if not text:
        return "NOVIDADE POKÉMON GO"
    parts = re.split(r"(?<=[.!?])\s+", text)
    candidate = parts[0].strip()
    if len(candidate) < 18 and len(parts) > 1:
        candidate = f"{candidate} {parts[1]}".strip()
    if len(candidate) > 105:
        candidate = candidate[:102].rstrip() + "..."
    return candidate


def _draw_news_icon(draw, box, accent, navy, categoria):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=42, fill=(255, 255, 255), outline=accent, width=4)
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2

    if categoria == "EVENTO":
        draw.rounded_rectangle((cx - 72, cy - 58, cx + 72, cy + 68), radius=18, outline=navy, width=10)
        draw.rectangle((cx - 72, cy - 30, cx + 72, cy - 10), fill=accent)
        for dx in (-42, 0, 42):
            for dy in (14, 46):
                draw.ellipse((cx + dx - 7, cy + dy - 7, cx + dx + 7, cy + dy + 7), fill=navy)
    elif categoria == "CÓDIGO":
        draw.rounded_rectangle((cx - 76, cy - 52, cx + 76, cy + 52), radius=18, outline=navy, width=10)
        draw.line((cx, cy - 50, cx, cy + 50), fill=accent, width=8)
        draw.arc((cx - 52, cy - 82, cx, cy - 15), 185, 350, fill=accent, width=8)
        draw.arc((cx, cy - 82, cx + 52, cy - 15), 190, 355, fill=accent, width=8)
    elif categoria == "ATUALIZAÇÃO":
        draw.arc((cx - 68, cy - 68, cx + 68, cy + 68), 35, 205, fill=accent, width=14)
        draw.arc((cx - 68, cy - 68, cx + 68, cy + 68), 215, 385, fill=navy, width=14)
        draw.polygon([(cx + 62, cy - 48), (cx + 90, cy - 16), (cx + 46, cy - 9)], fill=accent)
        draw.polygon([(cx - 62, cy + 48), (cx - 90, cy + 16), (cx - 46, cy + 9)], fill=navy)
    else:
        draw.rounded_rectangle((cx - 78, cy - 60, cx + 78, cy + 60), radius=12, outline=navy, width=9)
        draw.rectangle((cx - 55, cy - 38, cx - 8, cy + 26), fill=accent)
        for yy in (-34, -10, 14, 38):
            draw.line((cx + 12, cy + yy, cx + 56, cy + yy), fill=navy, width=7)
        draw.line((cx - 55, cy + 42, cx + 56, cy + 42), fill=navy, width=7)


def criar_card(titulo, mensagem):
    categoria = _categoria(titulo)
    p = PALETTES[categoria]
    navy, accent, accent2, soft = p["navy"], p["accent"], p["accent2"], p["soft"]

    img = _gradient((239, 248, 255), (207, 232, 251))
    draw = ImageDraw.Draw(img)

    # fundo: luz, mapa e cidade abstrata
    draw.ellipse((710, -170, 1240, 370), fill=(255, 255, 255))
    draw.ellipse((815, -90, 1130, 225), fill=(247, 252, 255))
    for x in range(-120, 1180, 160):
        draw.line((x, 420, x + 420, 40), fill=(213, 231, 245), width=5)
    for y in (255, 315, 375):
        draw.line((0, y, W, y + 70), fill=(221, 237, 248), width=4)

    skyline_y = 520
    for i, x in enumerate(range(-20, W + 40, 72)):
        bh = 70 + (i % 6) * 24
        draw.rounded_rectangle((x, skyline_y - bh, x + 48, skyline_y), radius=6, fill=(171, 203, 227))
        for wy in range(skyline_y - bh + 15, skyline_y - 10, 22):
            draw.rectangle((x + 11, wy, x + 19, wy + 7), fill=(226, 240, 250))
            draw.rectangle((x + 29, wy, x + 37, wy + 7), fill=(226, 240, 250))

    # cabeçalho premium
    draw.rounded_rectangle((42, 38, 1038, 224), radius=38, fill=navy)
    draw.rounded_rectangle((70, 70, 150, 152), radius=24, fill=accent)
    draw.line((90, 111, 132, 111), fill=(255, 255, 255), width=9)
    draw.ellipse((99, 90, 123, 114), outline=(255, 255, 255), width=6)

    draw.text((178, 67), "SPIDEY", font=_font(57, True), fill=(255, 255, 255))
    draw.text((181, 135), "POKÉMON GO • NOTÍCIAS • EVENTOS • COORDENADAS", font=_font(24, True), fill=(190, 217, 238))

    source = "G47IX" if "G47IX" in (titulo or "").upper() else "FONTE"
    chip_w = 180
    draw.rounded_rectangle((1038 - chip_w - 24, 76, 1014, 132), radius=20, fill=(255, 255, 255))
    draw.text((1038 - chip_w, 91), f"FONTE: {source}", font=_font(20, True), fill=navy)

    # categoria
    draw.rounded_rectangle((62, 264, 382, 338), radius=22, fill=accent)
    draw.text((90, 280), categoria, font=_font(32, True), fill=(255, 255, 255))

    clean = _limpar_mensagem(mensagem)
    headline = _extrair_headline(clean)

    # headline real, não genérica
    hf, hlines = _fit_headline(draw, headline.upper(), 900, 3)
    hy = 365
    for line in hlines:
        draw.text((62, hy), line, font=hf, fill=navy)
        hy += hf.size + 7

    # card principal
    panel_top = max(520, hy + 18)
    draw.rounded_rectangle((54, panel_top, 1026, 1038), radius=36, fill=(255, 255, 255), outline=(177, 205, 226), width=3)
    draw.rounded_rectangle((76, panel_top + 32, 94, 1000), radius=10, fill=accent2)

    # ícone contextual à direita
    _draw_news_icon(draw, (744, panel_top + 46, 990, panel_top + 292), accent, navy, categoria)

    # corpo sem repetir headline inteira
    body = clean
    if body.lower().startswith(headline.rstrip("...").lower()[:40]):
        body = body[len(headline.rstrip("...")):].lstrip(" .:-")
    if not body:
        body = "Informação detectada pelo Spidey. Consulte a fonte original para os detalhes completos."
    if len(body) > 430:
        body = body[:427].rstrip() + "..."

    body_font = _font(34, False)
    lines = _wrap(draw, body, body_font, 610)
    y = panel_top + 58
    for line in lines[:8]:
        draw.text((126, y), line, font=body_font, fill=(31, 55, 79))
        y += 49

    shiny = bool(re.search(r"\b(shiny|brilhante)\b", clean, flags=re.I))
    coords = re.findall(r"[-+]?\d{1,2}\.\d{3,}\s*,\s*[-+]?\d{1,3}\.\d{3,}", clean)
    tem_gpx = "gpx" in clean.lower()

    # chips úteis só aparecem quando são verdadeiros
    chips = []
    if shiny:
        chips.append(("✦ SHINY DISPONÍVEL", accent))
    if coords:
        chips.append((f"⌖ {len(coords)} COORDENADA(S)", accent2))
    if tem_gpx:
        chips.append(("GPX DISPONÍVEL", (22, 165, 94)))

    chip_y = 926
    chip_x = 126
    for label, color in chips[:3]:
        tw = draw.textbbox((0, 0), label, font=_font(23, True))[2]
        width = tw + 42
        if chip_x + width > 980:
            break
        draw.rounded_rectangle((chip_x, chip_y, chip_x + width, chip_y + 54), radius=18, fill=soft, outline=color, width=3)
        draw.text((chip_x + 21, chip_y + 14), label, font=_font(23, True), fill=navy)
        chip_x += width + 14

    # barra de serviço
    draw.rounded_rectangle((54, 1070, 1026, 1180), radius=30, fill=navy)
    items = ["INFO", "FONTE"]
    if coords:
        items.append("COORDENADAS")
    if tem_gpx:
        items.append("GPX")
    if shiny:
        items.append("SHINY")
    service = "  •  ".join(items)
    draw.text((92, 1105), service, font=_font(29, True), fill=(255, 255, 255))

    # rodapé limpo
    draw.text((62, 1214), f"Fonte: {source}", font=_font(27, True), fill=navy)
    draw.text((62, 1255), "Canal Spidey • resumo visual automático", font=_font(23, False), fill=(74, 101, 126))
    draw.text((757, 1218), "SEMPRE UM PASSO", font=_font(23, True), fill=accent)
    draw.text((813, 1253), "À FRENTE", font=_font(31, True), fill=navy)

    out = io.BytesIO()
    img.save(out, format="PNG", optimize=True)
    out.seek(0)
    return out.getvalue()
