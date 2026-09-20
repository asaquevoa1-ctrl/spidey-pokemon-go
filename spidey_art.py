import io
import re
import textwrap
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350

PALETTES = {
    "EVENTO": ((18, 42, 82), (120, 71, 255), (30, 144, 255)),
    "CÓDIGO": ((40, 46, 68), (255, 195, 0), (255, 122, 0)),
    "ATUALIZAÇÃO": ((18, 52, 66), (0, 196, 180), (42, 157, 143)),
    "NOTÍCIA": ((20, 48, 88), (0, 132, 255), (55, 96, 255)),
}


def _font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for path in paths:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def _wrap(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if draw.textbbox((0, 0), test, font=font)[2] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def _gradient(top, bottom):
    img = Image.new("RGB", (W, H), top)
    px = img.load()
    for y in range(H):
        t = y / max(1, H - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(W):
            px[x, y] = (r, g, b)
    return img


def criar_card(titulo, mensagem):
    upper = (titulo or "").upper()
    categoria = "NOTÍCIA"
    for candidate in ("EVENTO", "CÓDIGO", "ATUALIZAÇÃO", "NOTÍCIA"):
        if candidate in upper:
            categoria = candidate
            break

    dark, accent1, accent2 = PALETTES[categoria]
    img = _gradient((232, 244, 255), (198, 226, 252))
    draw = ImageDraw.Draw(img)

    # céu / brilho
    draw.ellipse((700, -160, 1250, 390), fill=(255, 255, 255))
    draw.ellipse((760, -80, 1160, 320), fill=(245, 251, 255))

    # skyline abstrato
    base_y = 420
    for i, x in enumerate(range(0, W, 75)):
        height = 90 + (i % 5) * 28
        draw.rounded_rectangle((x, base_y - height, x + 52, base_y), radius=8, fill=(165, 197, 222))
        for wy in range(base_y - height + 16, base_y - 12, 24):
            draw.rectangle((x + 12, wy, x + 22, wy + 9), fill=(223, 239, 250))
            draw.rectangle((x + 31, wy, x + 41, wy + 9), fill=(223, 239, 250))

    # cabeçalho escuro
    draw.rounded_rectangle((38, 38, W - 38, 210), radius=34, fill=dark)
    draw.ellipse((72, 78, 154, 160), fill=accent1)
    draw.ellipse((91, 97, 135, 141), fill=(245, 250, 255))
    draw.line((73, 119, 153, 119), fill=(245, 250, 255), width=10)

    draw.text((182, 67), "SPIDEY", font=_font(58, True), fill=(255, 255, 255))
    draw.text((185, 132), "POKÉMON GO • NOTÍCIAS • EVENTOS • COORDENADAS", font=_font(24, True), fill=(188, 214, 236))

    # selo categoria
    draw.rounded_rectangle((62, 246, 405, 324), radius=22, fill=accent1)
    draw.text((88, 263), categoria, font=_font(34, True), fill=(255, 255, 255))

    # título principal
    title_text = "NOVIDADE DETECTADA"
    if "G47IX" in upper:
        title_text = "NOVIDADE DO G47IX"
    draw.text((62, 354), title_text, font=_font(62, True), fill=dark)

    # painel principal
    draw.rounded_rectangle((54, 462, W - 54, 1015), radius=34, fill=(255, 255, 255), outline=(176, 204, 226), width=3)

    # detalhe visual lateral
    draw.rounded_rectangle((72, 493, 94, 969), radius=11, fill=accent2)
    draw.ellipse((790, 505, 1002, 717), fill=accent1)
    draw.ellipse((842, 557, 950, 665), fill=(255, 255, 255))
    draw.line((793, 610, 999, 610), fill=(255, 255, 255), width=18)

    clean = re.sub(r"https?://\S+", "", mensagem or "")
    clean = clean.replace("**", "").replace("🕷️", "").strip()
    clean = re.sub(r"\s+", " ", clean)
    if len(clean) > 470:
        clean = clean[:467].rstrip() + "..."

    body_font = _font(36, False)
    lines = _wrap(draw, clean, body_font, 650)
    y = 530
    for line in lines[:9]:
        draw.text((125, y), line, font=body_font, fill=(31, 53, 74))
        y += 50

    shiny = "SHINY" in clean.upper() or "BRILHANTE" in clean.upper()
    if shiny:
        draw.rounded_rectangle((690, 760, 986, 834), radius=22, fill=(248, 245, 255), outline=accent1, width=3)
        draw.text((716, 780), "✦ SHINY DISPONÍVEL", font=_font(28, True), fill=dark)

    # faixa utilidades
    draw.rounded_rectangle((54, 1048, W - 54, 1168), radius=30, fill=dark)
    utility = "INFO • FONTE • COORDENADAS • GPX"
    draw.text((98, 1084), utility, font=_font(31, True), fill=(255, 255, 255))

    # rodapé
    draw.text((62, 1206), "Fonte: G47IX", font=_font(27, True), fill=dark)
    draw.text((62, 1250), "Arte automática de segurança • Canal Spidey", font=_font(23, False), fill=(70, 96, 120))
    draw.text((760, 1225), "SEMPRE UM PASSO", font=_font(24, True), fill=accent1)
    draw.text((795, 1260), "À FRENTE", font=_font(31, True), fill=dark)

    out = io.BytesIO()
    img.save(out, format="PNG", optimize=True)
    out.seek(0)
    return out.getvalue()
