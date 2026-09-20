import io
import math
import re
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1350

PALETTES = {
    "EVENTO": {"navy": (9, 39, 84), "accent": (120, 72, 255), "accent2": (31, 148, 255), "glow": (174, 122, 255)},
    "CÓDIGO": {"navy": (27, 42, 74), "accent": (255, 185, 0), "accent2": (255, 117, 28), "glow": (255, 214, 106)},
    "ATUALIZAÇÃO": {"navy": (10, 53, 72), "accent": (0, 192, 173), "accent2": (24, 143, 196), "glow": (79, 233, 218)},
    "NOTÍCIA": {"navy": (8, 39, 83), "accent": (0, 134, 255), "accent2": (83, 78, 255), "glow": (86, 186, 255)},
}


def _font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def _wrap(draw, text, font, max_width):
    words = text.split()
    lines, current = [], ""
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


def _fit(draw, text, max_width, max_lines, start=66, minimum=38):
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


def _limpar(text):
    text = text or ""
    text = text.replace("**", "")
    text = re.sub(r"Fonte original:\s*https?://\S+", "", text, flags=re.I)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"Detectado e classificado automaticamente pelo Spidey", "", text, flags=re.I)
    text = re.sub(r"[🕷️🔗]+", "", text)
    return re.sub(r"\s+", " ", text).strip(" •-\n")


def _headline_body(clean):
    if not clean:
        return "NOVIDADE POKÉMON GO", "Novas informações foram detectadas pelo Spidey."
    parts = re.split(r"(?<=[.!?])\s+", clean)
    headline = parts[0].strip()
    body = " ".join(parts[1:]).strip()
    if len(headline) > 90:
        headline = headline[:87].rstrip() + "..."
    if not body:
        body = "Acompanhe os detalhes e atualizações desta novidade no canal Spidey."
    if len(body) > 260:
        body = body[:257].rstrip() + "..."
    return headline, body


def _gradient(size, top, bottom):
    img = Image.new("RGBA", size, top + (255,))
    d = ImageDraw.Draw(img)
    for y in range(size[1]):
        t = y / max(1, size[1] - 1)
        c = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3)) + (255,)
        d.line((0, y, size[0], y), fill=c)
    return img


def _glow_circle(scene, cx, cy, radius, color, width=10, blur=20, alpha=230):
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), outline=color + (alpha,), width=width)
    scene.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))
    scene.alpha_composite(layer)


def _draw_brand_mark(draw, x, y, size, accent):
    draw.rounded_rectangle((x, y, x+size, y+size), radius=size//4, fill=accent)
    cx, cy = x + size//2, y + size//2
    draw.ellipse((cx-size//5, cy-size//5, cx+size//5, cy+size//5), outline=(255,255,255), width=max(4, size//12))
    draw.line((x+size//7, cy, x+size-size//7, cy), fill=(255,255,255), width=max(4, size//11))


def _phone_layer(w, h, navy, accent, accent2, glow):
    pad = 90
    canvas = Image.new("RGBA", (w + pad*2, h + pad*2), (0,0,0,0))
    d = ImageDraw.Draw(canvas)
    x, y = pad, pad

    shadow = Image.new("RGBA", canvas.size, (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x+20, y+28, x+w+20, y+h+28), radius=58, fill=(0,0,0,115))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(28)))

    d.rounded_rectangle((x, y, x+w, y+h), radius=58, fill=(18,24,37), outline=(108,126,148), width=5)
    d.rounded_rectangle((x+16, y+20, x+w-16, y+h-20), radius=48, fill=(8,53,101))

    screen = _gradient((w-32, h-40), (29,111,184), (4,39,84))
    canvas.alpha_composite(screen, (x+16, y+20))

    # horizon / map feeling
    for i in range(7):
        yy = y + h - 175 + i*19
        d.line((x+35, yy, x+w-35, yy-42), fill=(64,132,177,90), width=3)
    for xx in (x+70, x+145, x+230, x+315):
        d.line((xx, y+h-230, xx+30, y+h-40), fill=(53,108,154,70), width=3)

    c1 = (x+w//2, y+225)
    c2 = (x+w//2, y+470)
    _glow_circle(canvas, *c1, 108, accent, 12, 24)
    _glow_circle(canvas, *c1, 74, glow, 8, 15)
    _glow_circle(canvas, *c2, 98, accent2, 12, 24)
    _glow_circle(canvas, *c2, 61, glow, 7, 14)

    for i in range(16):
        a = i * (math.pi * 2 / 16)
        for c, r, col in ((c1, 137, glow), (c2, 124, accent)):
            px = int(c[0] + math.cos(a) * r)
            py = int(c[1] + math.sin(a) * r)
            s = 3 + (i % 3)
            d.ellipse((px-s, py-s, px+s, py+s), fill=col + (200,))

    # clock motif
    d.line((c2[0], c2[1], c2[0]+44, c2[1]-32), fill=(255,255,255), width=7)
    d.line((c2[0], c2[1], c2[0]-5, c2[1]-54), fill=(255,255,255), width=7)
    d.ellipse((c2[0]-9, c2[1]-9, c2[0]+9, c2[1]+9), fill=(255,255,255))

    # notch + small marker
    d.rounded_rectangle((x+w//2-68, y+32, x+w//2+68, y+59), radius=14, fill=(3,9,18))
    mx, my = x+w-62, y+h-68
    d.ellipse((mx-23,my-23,mx+23,my+23), fill=accent)
    d.ellipse((mx-7,my-7,mx+7,my+7), fill=(255,255,255))

    return canvas


def criar_card(titulo, mensagem):
    categoria = _categoria(titulo)
    p = PALETTES[categoria]
    navy, accent, accent2, glow = p["navy"], p["accent"], p["accent2"], p["glow"]

    scene = _gradient((W,H), (247,252,255), (211,236,253))
    draw = ImageDraw.Draw(scene)

    # atmospheric background
    sky_glow = Image.new("RGBA", scene.size, (0,0,0,0))
    sd = ImageDraw.Draw(sky_glow)
    sd.ellipse((650,-210,1250,390), fill=(255,255,255,210))
    sd.ellipse((-220,880,460,1500), fill=(236,248,255,230))
    scene.alpha_composite(sky_glow.filter(ImageFilter.GaussianBlur(18)))

    # mountain silhouettes
    mountain = Image.new("RGBA", scene.size, (0,0,0,0))
    md = ImageDraw.Draw(mountain)
    md.polygon([(420,500),(610,315),(710,430),(825,270),(1010,500)], fill=(170,205,229,95))
    md.polygon([(525,530),(720,390),(810,480),(950,365),(1110,540)], fill=(141,188,220,70))
    scene.alpha_composite(mountain.filter(ImageFilter.GaussianBlur(2)))

    # header
    draw.rounded_rectangle((34,32,1046,212), radius=40, fill=navy)
    _draw_brand_mark(draw, 62, 62, 90, accent)
    draw.text((180,60), "SPIDEY", font=_font(60,True), fill=(255,255,255))
    draw.text((184,131), "POKÉMON GO • NOTÍCIAS • EVENTOS • COORDENADAS", font=_font(23,True), fill=(190,218,239))

    source = "G47IX" if "G47IX" in (titulo or "").upper() else "FONTE"
    draw.rounded_rectangle((829,72,1012,126), radius=22, fill=(255,255,255))
    draw.text((852,88), f"FONTE: {source}", font=_font(19,True), fill=navy)

    clean = _limpar(mensagem)
    headline, body = _headline_body(clean)

    draw.rounded_rectangle((48,250,356,326), radius=25, fill=accent)
    draw.text((80,266), categoria, font=_font(31,True), fill=(255,255,255))

    # headline left, with second line accented when possible
    hf, lines = _fit(draw, headline.upper(), 535, 4, start=65, minimum=40)
    y = 360
    for idx, line in enumerate(lines):
        color = accent if idx == 1 and len(lines) > 1 else navy
        draw.text((50,y), line, font=hf, fill=color)
        y += hf.size + 4
    draw.rounded_rectangle((52,y+10,165,y+18), radius=4, fill=accent)

    # body
    body_font = _font(33,False)
    by = y + 58
    for line in _wrap(draw, body, body_font, 500)[:6]:
        draw.text((52,by), line, font=body_font, fill=(27,56,89))
        by += 48

    # phone with perspective-like rotation
    phone = _phone_layer(390,700,navy,accent,accent2,glow)
    phone = phone.rotate(-4, resample=Image.Resampling.BICUBIC, expand=True)
    scene.alpha_composite(phone, (570,280))

    # subtle title callout near phone base
    draw.rounded_rectangle((610,910,1008,992), radius=24, fill=(255,255,255,225), outline=accent, width=3)
    draw.text((642,930), "EFEITOS DE AVENTURA", font=_font(25,True), fill=navy)
    draw.text((642,961), "visual dinâmico • atualização rápida", font=_font(18,False), fill=(74,101,126))

    shiny = bool(re.search(r"\b(shiny|brilhante)\b", clean, flags=re.I))
    coords = re.findall(r"[-+]?\d{1,2}\.\d{3,}\s*,\s*[-+]?\d{1,3}\.\d{3,}", clean)
    tem_gpx = "gpx" in clean.lower()

    chips = [("INFO", accent), ("FONTE", accent2)]
    if shiny:
        chips.append(("SHINY", (123,86,255)))
    if coords:
        chips.append(("COORDENADAS", (0,165,130)))
    if tem_gpx:
        chips.append(("GPX", (22,165,94)))

    draw.rounded_rectangle((34,1066,1046,1184), radius=34, fill=navy)
    x = 72
    for label,c in chips:
        f = _font(27,True)
        tw = draw.textbbox((0,0),label,font=f)[2]
        bw = tw + 54
        if x+bw > 1008:
            break
        draw.rounded_rectangle((x,1094,x+bw,1156), radius=22, fill=c)
        draw.text((x+27,1110),label,font=f,fill=(255,255,255))
        x += bw + 16

    # clean footer, no duplicate source
    draw.text((54,1220), "Canal Spidey • resumo visual automático", font=_font(22,False), fill=(69,96,122))
    draw.text((744,1210), "SEMPRE UM PASSO", font=_font(22,True), fill=accent)
    draw.text((804,1246), "À FRENTE", font=_font(33,True), fill=navy)

    out = io.BytesIO()
    scene.convert("RGB").save(out, format="PNG", optimize=True)
    out.seek(0)
    return out.getvalue()
