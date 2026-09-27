import hashlib
import html
import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent
QUEUE_DIR = ROOT / "queue"
GENERATED_DIR = ROOT / "generated"
LOGO_PATH = REPO_ROOT / "assets" / "spidey-logo-oficial.jpg"

SIZE = (1024, 1536)
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
USER_AGENT = "SpideyPokemonGO-V2-FreeRenderer/1.0"


def now():
    return datetime.now(timezone.utc).isoformat()


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def load_queue():
    files = sorted(QUEUE_DIR.glob("*.json"))
    if len(files) != 1:
        raise SystemExit(f"V2 exige exatamente 1 item; encontrados={len(files)}")
    path = files[0]
    return path, json.loads(path.read_text(encoding="utf-8"))


def save_queue(path, item):
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def get(url, timeout=60):
    r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
    r.raise_for_status()
    return r


def discover_image_url(item):
    direct = str(item.get("source_image_url") or "").strip()
    if direct:
        return direct

    page_url = str(item.get("source_url") or "").strip()
    if not page_url:
        raise RuntimeError("source_url ausente")
    r = get(page_url)
    text = r.text
    patterns = [
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
        r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image["\']',
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.I)
        if m:
            return urljoin(page_url, html.unescape(m.group(1)))
    raise RuntimeError("não foi possível localizar imagem oficial na fonte")


def download_source_image(item):
    url = discover_image_url(item)
    r = get(url, timeout=90)
    data = r.content
    if len(data) < 20_000:
        raise RuntimeError(f"imagem-fonte pequena demais: {len(data)} bytes")
    image = Image.open(io.BytesIO(data)).convert("RGB")
    if image.width < 500 or image.height < 300:
        raise RuntimeError(f"imagem-fonte com resolução insuficiente: {image.width}x{image.height}")
    print(f"V2_FREE_SOURCE url={url} size={image.width}x{image.height} bytes={len(data)}")
    return image, url


def fit_font(text, max_width, start_size, min_size=22, font_path=FONT_BOLD):
    probe = Image.new("RGB", (16, 16))
    draw = ImageDraw.Draw(probe)
    for size in range(start_size, min_size - 1, -2):
        font = ImageFont.truetype(font_path, size)
        box = draw.textbbox((0, 0), text, font=font)
        if box[2] - box[0] <= max_width:
            return font
    return ImageFont.truetype(font_path, min_size)


def centered_text(draw, y, text, font, fill, stroke_fill=None, stroke_width=0):
    box = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
    x = (SIZE[0] - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=font, fill=fill, stroke_fill=stroke_fill, stroke_width=stroke_width)


def rounded_panel(draw, xy, fill, outline, width=3, radius=26):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def build_background(source):
    # Fundo full-bleed derivado da própria mídia oficial, sem custo e sem inventar conteúdo.
    bg = ImageOps.fit(source, SIZE, method=Image.Resampling.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(24))
    bg = ImageEnhance.Color(bg).enhance(1.22)
    bg = ImageEnhance.Contrast(bg).enhance(1.10).convert("RGBA")

    # Escurece laterais e base para garantir leitura.
    shade = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    px = shade.load()
    for y in range(SIZE[1]):
        bottom = max(0.0, (y - 650) / 886)
        for x in range(SIZE[0]):
            edge = abs(x - 512) / 512
            alpha = int(35 + 115 * bottom + 55 * edge)
            px[x, y] = (2, 8, 25, min(alpha, 215))
    return Image.alpha_composite(bg, shade)


def hero_layer(source):
    # Mídia oficial ocupa a área nobre em full-bleed, sem “card dentro do card”.
    hero = ImageOps.fit(source, (1024, 820), method=Image.Resampling.LANCZOS, centering=(0.5, 0.45)).convert("RGBA")
    mask = Image.new("L", hero.size, 255)
    md = ImageDraw.Draw(mask)
    for y in range(650, 820):
        alpha = int(255 * (1 - (y - 650) / 170))
        md.line((0, y, 1024, y), fill=max(0, alpha))
    hero.putalpha(mask)
    return hero


def add_frame(draw):
    # Moldura angular azul/dourada para identidade Spidey sem poluir o herói.
    draw.line([(22, 118), (22, 1460), (118, 1514), (906, 1514), (1002, 1460), (1002, 118)], fill=(0, 170, 255, 210), width=5)
    draw.line([(31, 128), (31, 1448), (126, 1502), (898, 1502), (993, 1448), (993, 128)], fill=(255, 195, 35, 210), width=3)


def compose(item, source):
    image = build_background(source)
    image.alpha_composite(hero_layer(source), (0, 115))
    draw = ImageDraw.Draw(image, "RGBA")
    add_frame(draw)

    # Cabeçalho
    rounded_panel(draw, (42, 30, 230, 92), (8, 106, 240, 245), (55, 190, 255, 255), width=2, radius=8)
    draw.text((61, 38), "SPIDEY", font=ImageFont.truetype(FONT_BOLD, 42), fill=(255, 255, 255, 255))
    draw.text((255, 36), "POKÉMON GO", font=ImageFont.truetype(FONT_BOLD, 24), fill=(255, 255, 255, 255))
    draw.text((255, 66), "NOTÍCIAS • EVENTOS • COMUNIDADE", font=ImageFont.truetype(FONT_REG, 18), fill=(235, 242, 255, 255))
    draw.multiline_text((814, 28), "SEMPRE\nUM PASSO\nÀ FRENTE", font=ImageFont.truetype(FONT_BOLD, 20), fill=(240, 245, 255, 255), spacing=4, align="center")

    # Faixa editorial principal
    draw.rounded_rectangle((58, 745, 966, 1098), radius=46, fill=(2, 12, 38, 205), outline=(0, 176, 255, 220), width=4)
    draw.line((105, 772, 919, 772), fill=(255, 194, 35, 220), width=3)

    kicker = str(item.get("kicker") or "DIA DE INCUBAÇÃO DO").upper()
    title = str(item.get("display_title") or item.get("title") or "SANDILE").upper()
    subtitle = str(item.get("subtitle") or "Prepare-se para o Dia de chocar Sandile!")

    centered_text(draw, 800, kicker, fit_font(kicker, 880, 66, 38), (255, 211, 52, 255), (2, 29, 85, 255), 5)
    centered_text(draw, 866, title, fit_font(title, 900, 150, 78), (247, 181, 36, 255), (0, 67, 175, 255), 9)
    rounded_panel(draw, (145, 1020, 879, 1082), (2, 31, 72, 235), (0, 177, 255, 255), width=3, radius=22)
    centered_text(draw, 1031, subtitle, fit_font(subtitle, 675, 32, 22), (255, 255, 255, 255))

    rows = [
        ("▣", str(item.get("date_text") or "17 de outubro de 2026")),
        ("◷", str(item.get("time_text") or "11h às 17h • horário local")),
        ("▤", str(item.get("event_text") or "Evento oficial • Pokémon GO")),
    ]
    y = 1112
    for icon, text in rows:
        rounded_panel(draw, (155, y, 869, y + 66), (1, 22, 58, 238), (255, 207, 45, 255), width=3, radius=20)
        draw.text((190, y + 10), icon, font=ImageFont.truetype(FONT_BOLD, 38), fill=(255, 218, 62, 255))
        draw.text((270, y + 13), text, font=fit_font(text, 570, 33, 21), fill=(255, 255, 255, 255))
        y += 76

    # Logo oficial real
    if not LOGO_PATH.is_file():
        raise RuntimeError(f"logo oficial ausente: {LOGO_PATH}")
    logo = Image.open(LOGO_PATH).convert("RGB")
    logo = ImageOps.fit(logo, (154, 154), method=Image.Resampling.LANCZOS)
    mask = Image.new("L", (154, 154), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 153, 153), fill=255)
    ring = Image.new("RGBA", (174, 174), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((3, 3, 170, 170), fill=(2, 15, 40, 248), outline=(0, 194, 255, 255), width=5)
    image.alpha_composite(ring, (425, 1330))
    image.paste(logo.convert("RGBA"), (435, 1340), mask)

    footer_font = ImageFont.truetype(FONT_REG, 17)
    draw.text((48, 1482), "JOGO  •  EXPLORAÇÃO  •  COMUNIDADE", font=footer_font, fill=(235, 240, 250, 255))
    source_text = f"Fonte: {str(item.get('source_label') or 'Pokémon GO')}"
    box = draw.textbbox((0, 0), source_text, font=footer_font)
    draw.text((976 - (box[2] - box[0]), 1482), source_text, font=footer_font, fill=(245, 245, 245, 255))
    return image.convert("RGB")


def main():
    path, item = load_queue()
    status = str(item.get("status") or "")
    if status != "needs_art":
        print("V2_ART_NOOP", status)
        return 0

    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    source, source_image_url = download_source_image(item)
    final = compose(item, source)

    out_name = f"{item.get('id') or 'spidey-event'}.png"
    out_path = GENERATED_DIR / out_name
    final.save(out_path, format="PNG", optimize=True)

    data = out_path.read_bytes()
    if len(data) < 100_000:
        raise RuntimeError(f"arte final pequena demais: {len(data)} bytes")
    with Image.open(out_path) as check:
        if check.size != SIZE:
            raise RuntimeError(f"arte final não está em {SIZE[0]}x{SIZE[1]}: {check.size}")

    item.pop("image_b64_asset", None)
    item.pop("image_url", None)
    item.update({
        "status": "ready",
        "image_file": f"generated/{out_name}",
        "image_filename": out_name,
        "source_art_sha256": sha256(data),
        "source_image_url_resolved": source_image_url,
        "art_generated_at_utc": now(),
        "art_dimensions": f"{SIZE[0]}x{SIZE[1]}",
        "art_pipeline": "free_official_media_plus_deterministic_spidey_overlay_v1",
        "art_cost": "zero",
    })
    save_queue(path, item)
    print(f"V2_ART_READY {out_path} bytes={len(data)} sha256={item['source_art_sha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
