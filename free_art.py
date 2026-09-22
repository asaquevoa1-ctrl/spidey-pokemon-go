import io
import os
import re
import textwrap

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W, H = 1080, 1350


def _font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def _cover(img, size):
    return ImageOps.fit(img.convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def _rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def _coord_text(coordenadas):
    if not coordenadas:
        return ""
    lat, lon = coordenadas[0]
    def fmt(v):
        return f"{float(v):.7f}".rstrip("0").rstrip(".")
    return f"{fmt(lat)},{fmt(lon)}"


def _linha_contexto(mensagem):
    linhas = [re.sub(r"\s+", " ", l).strip(" #>*") for l in (mensagem or "").splitlines()]
    linhas = [l for l in linhas if l and not l.startswith("Evento detectado automaticamente") and "Fonte operacional" not in l]
    for linha in linhas:
        low = linha.lower()
        if any(x in low for x in ("segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo", "september", "october", "local time", "horário local", "18:", "19:", "20:")):
            return linha[:92]
    return (linhas[1] if len(linhas) > 1 else "")[:92]


def criar_card_gratis(titulo, mensagem, fonte_imagem_bytes, coordenadas=None):
    src = Image.open(io.BytesIO(fonte_imagem_bytes)).convert("RGB")

    # Fundo baseado na própria arte-fonte, desfocado, para manter conexão visual com o evento.
    bg = _cover(src, (W, H)).filter(ImageFilter.GaussianBlur(26))
    overlay = Image.new("RGBA", (W, H), (4, 13, 31, 176))
    canvas = Image.alpha_composite(bg.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(canvas)

    # Glow discreto Spidey (sem depender de IA/API).
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-220, -120, 420, 520), fill=(0, 132, 255, 66))
    gd.ellipse((700, -80, 1320, 500), fill=(255, 40, 78, 58))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)

    # Marca.
    draw.text((72, 54), "SPIDEY", font=_font(70, True), fill=(255, 255, 255, 255))
    draw.rounded_rectangle((72, 139, 300, 150), 6, fill=(235, 48, 76, 255))
    draw.rounded_rectangle((306, 139, 500, 150), 6, fill=(42, 151, 255, 255))

    # Título limpo, sem prefixos técnicos.
    clean_title = re.sub(r"^[^•]+•\s*", "", titulo or "").strip()
    clean_title = clean_title.replace("📍", "").strip()
    title_font = _font(48, True)
    max_chars = 34
    title_lines = textwrap.wrap(clean_title, width=max_chars)[:2] or ["Evento Pokémon GO"]
    y = 178
    for line in title_lines:
        draw.text((72, y), line, font=title_font, fill=(255, 255, 255, 255))
        y += 58

    contexto = _linha_contexto(mensagem)
    if contexto:
        draw.text((74, y + 6), contexto, font=_font(27, False), fill=(215, 224, 239, 255))

    # Hero da fonte: preserva a arte original e a deixa protagonista.
    hero_x, hero_y, hero_w, hero_h = 62, 350, 956, 760
    hero = _cover(src, (hero_w, hero_h))
    mask = _rounded_mask((hero_w, hero_h), 34)

    shadow = Image.new("RGBA", (hero_w + 60, hero_h + 60), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((30, 24, hero_w + 30, hero_h + 24), 38, fill=(0, 0, 0, 150))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(shadow, (hero_x - 30, hero_y - 15))
    canvas.paste(hero, (hero_x, hero_y), mask)

    draw = ImageDraw.Draw(canvas)
    # Rodapé editorial mínimo: evita cara de infográfico corporativo.
    draw.text((72, 1152), "Fonte: SPS  •  Visual Spidey", font=_font(25, False), fill=(186, 201, 222, 255))

    coord = _coord_text(coordenadas or [])
    if coord:
        draw.rounded_rectangle((72, 1202, 1008, 1304), 28, fill=(8, 18, 38, 226), outline=(70, 152, 255, 180), width=2)
        draw.text((102, 1221), coord, font=_font(34, True), fill=(255, 255, 255, 255))
        label = "É só copiar"
        bbox = draw.textbbox((0, 0), label, font=_font(24, True))
        draw.text((970 - (bbox[2]-bbox[0]), 1257), label, font=_font(24, True), fill=(104, 190, 255, 255))
    else:
        draw.rounded_rectangle((72, 1202, 1008, 1304), 28, fill=(8, 18, 38, 210))
        draw.text((102, 1232), "Conteúdo pronto para aprovação", font=_font(30, True), fill=(238, 244, 252, 255))

    out = io.BytesIO()
    canvas.convert("RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()
