import io
import math
import re
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1350

PALETTES = {
    "EVENTO": {
        "navy": (14, 41, 84),
        "accent": (113, 74, 255),
        "accent2": (31, 139, 255),
        "glow": (170, 120, 255),
    },
    "CÓDIGO": {
        "navy": (28, 42, 74),
        "accent": (255, 184, 0),
        "accent2": (255, 117, 28),
        "glow": (255, 211, 95),
    },
    "ATUALIZAÇÃO": {
        "navy": (11, 49, 68),
        "accent": (0, 192, 173),
        "accent2": (28, 144, 191),
        "glow": (82, 235, 216),
    },
    "NOTÍCIA": {
        "navy": (12, 43, 84),
        "accent": (12, 128, 255),
        "accent2": (69, 86, 255),
        "glow": (71, 176, 255),
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


def _fit(draw, text, max_width, max_lines, start=64, minimum=38):
    for size in range(start, minimum - 1, -2):
        font = _font(size, True)
        lines = _wrap(draw, text, font, max_width)
        if len(lines) <= max_lines:
            return font, lines
    font = _font(minimum, True)
    return font, _wrap(draw, text, font, max_width)[:max_lines]


def _categoria(titulo):
    upper = (titulo or "").upper()
    for item in ("EVENTO", "CÓDIGO", "ATUALIZAÇÃO", "NOTÍCIA"):
        if item in upper:
            return item
    return "NOTÍCIA"


def _limpar_mensagem(mensagem):
    text = mensagem or ""
    text = text.replace("**", "")
    text = re.sub(r"Detectado e classificado automaticamente pelo Spidey", "", text, flags=re.I)
    text = re.sub(r"Fonte original:\s*https?://\S+", "", text, flags=re.I)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[🕷️🔗]+", "", text)
    text = re.sub(r"\s+", " ", text).strip(" •-\n")
    return text


def _headline_body(clean):
    if not clean:
        return "NOVIDADE POKÉMON GO", "Novas informações foram detectadas pelo Spidey."
    parts = re.split(r"(?<=[.!?])\s+", clean)
    headline = parts[0].strip()
    if len(headline) > 88:
        headline = headline[:85].rstrip() + "..."
    body = " ".join(parts[1:]).strip()
    if not body:
        body = "Acompanhe os detalhes e atualizações desta novidade no canal Spidey."
    if len(body) > 280:
        body = body[:277].rstrip() + "..."
    return headline, body


def _gradient_bg(top, bottom):
    img = Image.new("RGB", (W, H), top)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(1, H - 1)
        c = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        draw.line((0, y, W, y), fill=c)
    return img


def _glow_ring(base, center, radius, color, width=10, blur=24, alpha=220):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    box = (cx - radius, cy - radius, cx + radius, cy + radius)
    d.ellipse(box, outline=(*color, alpha), width=width)
    blurred = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(blurred)
    base.alpha_composite(layer)


def _sparkles(base, center, radius, color):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    for i in range(18):
        a = i * (math.pi * 2 / 18.0)
        r = radius * (0.72 + (i % 4) * 0.08)
        x = int(cx + math.cos(a) * r)
        y = int(cy + math.sin(a) * r)
        s = 3 + (i % 3)
        d.ellipse((x - s, y - s, x + s, y + s), fill=(*color, 215))
    base.alpha_composite(layer)


def _draw_phone(scene, x, y, w, h, navy, accent, accent2, glow):
    # shadow
    shadow = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x + 14, y + 18, x + w + 14, y + h + 18), radius=56, fill=(0, 0, 0, 105))
    scene.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(22)))

    d = ImageDraw.Draw(scene)
    d.rounded_rectangle((x, y, x + w, y + h), radius=58, fill=(17, 24, 39), outline=(86, 113, 145), width=5)
    d.rounded_rectangle((x + 17, y + 22, x + w - 17, y + h - 22), radius=48, fill=(12, 49, 94))

    # screen gradient
    screen = Image.new("RGBA", (w - 34, h - 44), (0, 0, 0, 0))
    sd = ImageDraw.Draw(screen)
    for yy in range(screen.height):
        t = yy / max(1, screen.height - 1)
        c = (
            int(20 * (1 - t) + 4 * t),
            int(82 * (1 - t) + 37 * t),
            int(145 * (1 - t) + 80 * t),
            255,
        )
        sd.line((0, yy, screen.width, yy), fill=c)
    scene.alpha_composite(screen, (x + 17, y + 22))

    # dynamic adventure-effect rings
    c1 = (x + w // 2, y + 235)
    c2 = (x + w // 2, y + 485)
    _glow_ring(scene, c1, 105, accent, width=12, blur=28)
    _glow_ring(scene, c1, 72, glow, width=8, blur=18)
    _glow_ring(scene, c2, 96, accent2, width=12, blur=28)
    _glow_ring(scene, c2, 58, glow, width=7, blur=16)
    _sparkles(scene, c1, 135, glow)
    _sparkles(scene, c2, 125, accent)

    # clock hand motif
    d.line((c2[0], c2[1], c2[0] + 45, c2[1] - 32), fill=(255, 255, 255), width=7)
    d.line((c2[0], c2[1], c2[0] - 6, c2[1] - 54), fill=(255, 255, 255), width=7)
    d.ellipse((c2[0] - 10, c2[1] - 10, c2[0] + 10, c2[1] + 10), fill=(255, 255, 255))

    # notch
    d.rounded_rectangle((x + w // 2 - 72, y + 36, x + w // 2 + 72, y + 62), radius=13, fill=(3, 10, 20))

    # little map marker lower right
    mx, my = x + w - 70, y + h - 76
    d.ellipse((mx - 24, my - 24, mx + 24, my + 24), fill=accent)
    d.ellipse((mx - 8, my - 8, mx + 8, my + 8), fill=(255, 255, 255))


def criar_card(titulo, mensagem):
    categoria = _categoria(titulo)
    p = PALETTES[categoria]
    navy, accent, accent2, glow = p["navy"], p["accent"], p["accent2"], p["glow"]

    base = _gradient_bg((248, 252, 255), (218, 239, 255)).convert("RGBA")
    draw = ImageDraw.Draw(base)

    # premium abstract background
    draw.ellipse((680, -180, 1230, 370), fill=(255, 255, 255, 245))
    draw.ellipse((-130, 920, 420, 1460), fill=(235, 247, 255, 230))
    for k in range(-200, 1300, 170):
        draw.line((k, 0, k + 520, 520), fill=(205, 227, 245, 150), width=3)
    for y in (260, 340, 420):
        draw.arc((-180, y - 160, 1280, y + 520), 198, 342, fill=(213, 233, 248, 165), width=3)

    # header
    draw.rounded_rectangle((38, 34, 1042, 210), radius=38, fill=navy)
    draw.rounded_rectangle((63, 62, 151, 150), radius=28, fill=accent)
    draw.ellipse((88, 88, 126, 126), outline=(255, 255, 255), width=7)
    draw.line((74, 107, 140, 107), fill=(255, 255, 255), width=8)
    draw.text((178, 63), "SPIDEY", font=_font(59, True), fill=(255, 255, 255))
    draw.text((181, 132), "POKÉMON GO • NOTÍCIAS • EVENTOS • COORDENADAS", font=_font(23, True), fill=(190, 216, 238))

    source = "G47IX" if "G47IX" in (titulo or "").upper() else "FONTE"
    draw.rounded_rectangle((825, 72, 1008, 126), radius=22, fill=(255, 255, 255))
    draw.text((850, 88), f"FONTE: {source}", font=_font(19, True), fill=navy)

    # content
    clean = _limpar_mensagem(mensagem)
    headline, body = _headline_body(clean)

    draw.rounded_rectangle((54, 246, 372, 323), radius=25, fill=accent)
    draw.text((87, 263), categoria, font=_font(32, True), fill=(255, 255, 255))

    hf, hlines = _fit(draw, headline.upper(), 570, 4, start=66, minimum=42)
    hy = 358
    for i, line in enumerate(hlines):
        fill = navy if i == 0 else (accent if i == 1 and len(hlines) > 1 else navy)
        draw.text((56, hy), line, font=hf, fill=fill)
        hy += hf.size + 4

    # accent underline
    draw.rounded_rectangle((56, hy + 8, 160, hy + 16), radius=4, fill=accent)

    bf = _font(34, False)
    by = hy + 54
    for line in _wrap(draw, body, bf, 510)[:6]:
        draw.text((56, by), line, font=bf, fill=(25, 56, 92))
        by += 49

    # phone + effects scene
    _draw_phone(base, 625, 322, 385, 690, navy, accent, accent2, glow)

    # subtle ground / city shapes
    for i, x in enumerate(range(560, 1080, 65)):
        h = 48 + (i % 5) * 18
        draw.rounded_rectangle((x, 980 - h, x + 42, 980), radius=6, fill=(149, 184, 211, 95))

    # truth chips
    shiny = bool(re.search(r"\b(shiny|brilhante)\b", clean, flags=re.I))
    coords = re.findall(r"[-+]?\d{1,2}\.\d{3,}\s*,\s*[-+]?\d{1,3}\.\d{3,}", clean)
    tem_gpx = "gpx" in clean.lower()

    chips = [("INFO", accent), ("FONTE", accent2)]
    if shiny:
        chips.append(("SHINY", (125, 88, 255)))
    if coords:
        chips.append(("COORDENADAS", (0, 165, 130)))
    if tem_gpx:
        chips.append(("GPX", (22, 165, 94)))

    draw.rounded_rectangle((40, 1065, 1040, 1182), radius=34, fill=navy)
    x = 78
    for label, c in chips:
        tw = draw.textbbox((0, 0), label, font=_font(27, True))[2]
        bw = tw + 54
        if x + bw > 1004:
            break
        draw.rounded_rectangle((x, 1093, x + bw, 1154), radius=22, fill=(*c, 255))
        draw.text((x + 27, 1110), label, font=_font(27, True), fill=(255, 255, 255))
        x += bw + 16

    # footer
    draw.text((58, 1211), f"Fonte: {source}", font=_font(27, True), fill=navy)
    draw.text((58, 1253), "Canal Spidey • resumo visual automático", font=_font(22, False), fill=(74, 101, 126))
    draw.text((748, 1212), "SEMPRE UM PASSO", font=_font(22, True), fill=accent)
    draw.text((807, 1247), "À FRENTE", font=_font(32, True), fill=navy)

    out = io.BytesIO()
    base.convert("RGB").save(out, format="PNG", optimize=True)
    out.seek(0)
    return out.getvalue()
