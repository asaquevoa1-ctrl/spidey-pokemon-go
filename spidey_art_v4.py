import io
import math
import re
from pathlib import Path
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


def _fonte(titulo, mensagem):
    all_text = f"{titulo or ''} {mensagem or ''}".upper()
    if "G47IX" in all_text:
        return "G47IX"
    if "SPS" in all_text or "SHINY PINGS" in all_text:
        return "SPS"
    if "ESA" in all_text or "AGÊNCIA ESPACIAL EUROPEIA" in all_text:
        return "POKÉMON GO / ESA"
    if "FONTE OFICIAL: POKÉMON GO" in all_text or "POKÉMON GO" in all_text:
        return "POKÉMON GO"
    return "SPIDEY"


def _limpar(text):
    text = text or ""
    text = text.replace("**", "")
    text = re.sub(r"Fonte original:\s*https?://\S+", "", text, flags=re.I)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"Detectado e classificado automaticamente pelo Spidey", "", text, flags=re.I)
    text = re.sub(r"[🕷️🔗]+", "", text)
    text = re.sub(r"Fonte oficial:[^.]+", "", text, flags=re.I)
    return re.sub(r"\s+", " ", text).strip(" •-\n")


def _headline_body(clean):
    if not clean:
        return "NOVIDADE POKÉMON GO", "Novas informações foram detectadas pelo Spidey."
    parts = re.split(r"(?<=[.!?])\s+", clean)
    headline = parts[0].strip()
    body = " ".join(parts[1:]).strip()
    if len(headline) > 96:
        headline = headline[:93].rstrip() + "..."
    if not body:
        body = "Acompanhe os detalhes e atualizações desta novidade no canal Spidey."
    if len(body) > 225:
        body = body[:222].rstrip() + "..."
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
    layer = Image.new("RGBA", scene.size, (0,0,0,0))
    d = ImageDraw.Draw(layer)
    d.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), outline=color + (alpha,), width=width)
    scene.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))
    scene.alpha_composite(layer)


def _draw_brand_mark(draw, x, y, size, accent):
    draw.rounded_rectangle((x, y, x+size, y+size), radius=size//4, fill=accent)
    cx, cy = x + size//2, y + size//2
    draw.ellipse((cx-size//5, cy-size//5, cx+size//5, cy+size//5), outline=(255,255,255), width=max(4, size//12))
    draw.line((x+size//7, cy, x+size-size//7, cy), fill=(255,255,255), width=max(4, size//11))


def _logo_oficial():
    try:
        return Image.open(Path("assets/spidey-logo-oficial.jpg")).convert("RGBA")
    except Exception:
        return None


def _aplicar_logo_oficial(scene, x, y, size):
    logo = _logo_oficial()
    if logo is None:
        return False
    logo = logo.resize((size, size), Image.Resampling.LANCZOS)
    scene.alpha_composite(logo, (x, y))
    return True


def _tema(clean):
    u = clean.upper()
    if "MÁLAGA" in u or "MALAGA" in u or "COMIC-CON" in u:
        return "malaga"
    if "ESA" in u or "ASTRONAUTA" in u or "ESPACIAL" in u:
        return "esa"
    return "padrao"


def _hero_malaga(scene, accent, navy):
    d = ImageDraw.Draw(scene)
    # sol e céu mediterrâneo
    sun = Image.new("RGBA", scene.size, (0,0,0,0))
    sd = ImageDraw.Draw(sun)
    sd.ellipse((710,210,1070,570), fill=(255,205,82,125))
    scene.alpha_composite(sun.filter(ImageFilter.GaussianBlur(34)))

    # cartão/fundo de localização estilizado
    d.rounded_rectangle((590,270,1010,930), radius=42, fill=(255,255,255,238), outline=(255,255,255), width=4)
    photo = _gradient((380,520), (64,167,231), (255,177,91))
    pd = ImageDraw.Draw(photo)
    pd.rectangle((0,330,380,520), fill=(223,183,132,255))
    # skyline mediterrâneo simples
    for x, w, h in [(15,58,130),(80,72,170),(160,62,115),(235,78,190),(320,48,145)]:
        pd.rectangle((x,330-h,x+w,330), fill=(245,237,221,255))
        pd.rectangle((x+12,330-h+28,x+22,330-h+58), fill=(71,133,177,220))
    # palmeira / costa
    pd.line((315,315,325,215), fill=(84,79,55,255), width=12)
    for dx,dy in [(-44,-20),(-10,-42),(28,-28),(50,0)]:
        pd.line((325,215,325+dx,215+dy), fill=(46,126,82,255), width=10)
    scene.alpha_composite(photo, (610,295))

    # mascote elétrico estilizado (silhueta amarela, sem parecer anúncio genérico)
    mascot = Image.new("RGBA", scene.size, (0,0,0,0))
    md = ImageDraw.Draw(mascot)
    md.ellipse((730,610,910,795), fill=(255,215,40,255), outline=(126,83,15,255), width=5)
    md.polygon([(752,635),(700,515),(770,590)], fill=(255,215,40,255))
    md.polygon([(888,635),(945,515),(875,592)], fill=(255,215,40,255))
    md.ellipse((773,665,793,687), fill=(24,28,34,255))
    md.ellipse((847,665,867,687), fill=(24,28,34,255))
    md.ellipse((770,710,808,748), fill=(235,68,68,245))
    md.ellipse((842,710,880,748), fill=(235,68,68,245))
    md.line((820,700,810,712,820,720,830,712,820,700), fill=(80,55,20,255), width=5)
    # raio decorativo
    md.polygon([(925,710),(975,660),(952,716),(996,714),(925,810),(950,742),(915,746)], fill=accent + (255,))
    scene.alpha_composite(mascot)

    d.rounded_rectangle((628,858,970,922), radius=22, fill=navy + (235,))
    d.text((668,875), "MÁLAGA • EVENTO PRESENCIAL", font=_font(22, True), fill=(255,255,255))


def _hero_esa(scene, accent, navy):
    d = ImageDraw.Draw(scene)
    # espaço / Terra
    space = Image.new("RGBA", scene.size, (0,0,0,0))
    sd = ImageDraw.Draw(space)
    sd.rectangle((560,220,1080,1020), fill=(5,14,34,235))
    for i in range(48):
        x = 580 + (i * 73) % 470
        y = 245 + (i * 137) % 700
        r = 2 + (i % 3)
        sd.ellipse((x-r,y-r,x+r,y+r), fill=(255,255,255,180))
    sd.ellipse((720,650,1110,1040), fill=(33,111,195,255), outline=(126,204,255,220), width=8)
    sd.arc((748,680,1082,1010), 195, 350, fill=(85,205,135,255), width=26)
    scene.alpha_composite(space)

    # capacete/mascote espacial amarelo estilizado
    hero = Image.new("RGBA", scene.size, (0,0,0,0))
    hd = ImageDraw.Draw(hero)
    hd.ellipse((655,330,970,650), fill=(235,244,255,245), outline=(115,160,210,255), width=10)
    hd.ellipse((700,380,925,605), fill=(20,46,86,255))
    hd.ellipse((746,432,875,570), fill=(255,215,40,255))
    hd.polygon([(765,445),(730,365),(785,425)], fill=(255,215,40,255))
    hd.polygon([(855,445),(900,365),(870,430)], fill=(255,215,40,255))
    hd.ellipse((774,478,790,495), fill=(15,18,24,255))
    hd.ellipse((835,478,851,495), fill=(15,18,24,255))
    hd.ellipse((770,515,796,539), fill=(232,78,74,245))
    hd.ellipse((830,515,856,539), fill=(232,78,74,245))
    hd.rounded_rectangle((690,620,930,890), radius=58, fill=(238,244,252,245), outline=(112,158,204,255), width=8)
    hd.rectangle((760,670,862,748), fill=(30,78,145,255))
    # brilho shiny
    _glow_circle(hero, 812, 505, 150, accent, width=9, blur=22, alpha=180)
    scene.alpha_composite(hero)
    d.rounded_rectangle((640,920,1000,984), radius=22, fill=navy + (235,))
    d.text((682,937), "ESA • PIKACHU ASTRONAUTA", font=_font(23, True), fill=(255,255,255))


def _hero_padrao(scene, accent, accent2, navy):
    d = ImageDraw.Draw(scene)
    card = Image.new("RGBA", scene.size, (0,0,0,0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle((610,300,1005,940), radius=50, fill=(11,35,72,235), outline=(255,255,255,110), width=5)
    _glow_circle(card, 805, 540, 120, accent, 14, 28)
    _glow_circle(card, 805, 540, 72, accent2, 8, 18)
    cd.polygon([(805,390),(866,510),(836,510),(884,655),(812,572),(785,572),(738,670),(765,520),(742,520)], fill=(255,225,72,240))
    scene.alpha_composite(card)
    d.rounded_rectangle((655,860,960,922), radius=22, fill=navy + (235,))
    d.text((706,878), "POKÉMON GO • NOVIDADE", font=_font(23, True), fill=(255,255,255))


def criar_card(titulo, mensagem):
    categoria = _categoria(titulo)
    p = PALETTES[categoria]
    navy, accent, accent2, glow = p["navy"], p["accent"], p["accent2"], p["glow"]

    clean = _limpar(mensagem)
    tema = _tema(clean)

    # fundo mais vivo e menos corporativo
    if tema == "malaga":
        scene = _gradient((W,H), (247,252,255), (255,225,179))
    elif tema == "esa":
        scene = _gradient((W,H), (232,242,255), (117,148,201))
    else:
        scene = _gradient((W,H), (237,248,255), (183,220,247))

    draw = ImageDraw.Draw(scene)

    # header
    draw.rounded_rectangle((34,32,1046,212), radius=40, fill=navy)
    if not _aplicar_logo_oficial(scene, 54, 50, 124):
        _draw_brand_mark(draw, 62, 62, 90, accent)
    draw.text((202,60), "SPIDEY", font=_font(60,True), fill=(255,255,255))
    draw.text((206,131), "POKÉMON GO • NOTÍCIAS • EVENTOS • COORDENADAS", font=_font(23,True), fill=(190,218,239))

    source = _fonte(titulo, mensagem)
    label = f"FONTE: {source}"
    sw = draw.textbbox((0,0), label, font=_font(18,True))[2]
    x0 = max(720, 1018 - sw - 38)
    draw.rounded_rectangle((x0,72,1018,126), radius=22, fill=(255,255,255))
    draw.text((x0+20,88), label, font=_font(18,True), fill=navy)

    headline, body = _headline_body(clean)

    draw.rounded_rectangle((48,250,356,326), radius=25, fill=accent)
    draw.text((80,266), categoria, font=_font(31,True), fill=(255,255,255))

    # headline / texto à esquerda
    hf, lines = _fit(draw, headline.upper(), 525, 4, start=62, minimum=38)
    y = 360
    for idx, line in enumerate(lines):
        color = accent if idx == 1 and len(lines) > 1 else navy
        draw.text((50,y), line, font=hf, fill=color)
        y += hf.size + 4
    draw.rounded_rectangle((52,y+10,165,y+18), radius=4, fill=accent)

    body_font = _font(30,False)
    by = y + 56
    for line in _wrap(draw, body, body_font, 500)[:5]:
        draw.text((52,by), line, font=body_font, fill=(27,56,89))
        by += 44

    # herói contextual
    if tema == "malaga":
        _hero_malaga(scene, accent, navy)
    elif tema == "esa":
        _hero_esa(scene, accent, navy)
    else:
        _hero_padrao(scene, accent, accent2, navy)

    shiny = bool(re.search(r"\b(shiny|brilhante)\b", clean, flags=re.I))
    coords = re.findall(r"[-+]?\d{1,2}\.\d{3,}\s*,\s*[-+]?\d{1,3}\.\d{3,}", clean)
    tem_gpx = "gpx" in clean.lower()

    chips = [("INFO", accent)]
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

    draw.text((54,1220), "Canal Spidey • informação útil para jogar", font=_font(22,False), fill=(69,96,122))
    draw.text((744,1210), "SEMPRE UM PASSO", font=_font(22,True), fill=accent)
    draw.text((804,1246), "À FRENTE", font=_font(33,True), fill=navy)

    out = io.BytesIO()
    scene.convert("RGB").save(out, format="PNG", optimize=True)
    out.seek(0)
    return out.getvalue()
