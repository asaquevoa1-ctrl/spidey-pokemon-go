import base64
import hashlib
import io
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent
QUEUE_DIR = ROOT / "queue"
GENERATED_DIR = ROOT / "generated"
LOGO_PATH = REPO_ROOT / "assets" / "spidey-logo-oficial.jpg"

OPENAI_API = "https://api.openai.com/v1/images/generations"
MODEL = os.getenv("SPIDEY_IMAGE_MODEL", "gpt-image-2.5-sunburst-2026-09-08").strip()
QUALITY = os.getenv("SPIDEY_IMAGE_QUALITY", "high").strip()
SIZE = "1024x1536"

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


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


def fit_font(text, max_width, start_size, min_size=24, font_path=FONT_BOLD):
    size = start_size
    probe = Image.new("RGB", (16, 16))
    draw = ImageDraw.Draw(probe)
    while size >= min_size:
        font = ImageFont.truetype(font_path, size)
        box = draw.textbbox((0, 0), text, font=font, stroke_width=0)
        if box[2] - box[0] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(font_path, min_size)


def centered_text(draw, y, text, font, fill, stroke_fill=None, stroke_width=0):
    box = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
    x = (1024 - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=font, fill=fill, stroke_fill=stroke_fill, stroke_width=stroke_width)


def rounded_panel(draw, xy, fill, outline, width=3, radius=28):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def generate_background(item):
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise SystemExit("OPENAI_API_KEY ausente")

    scene = str(item.get("scene_prompt") or "").strip()
    if not scene:
        scene = (
            "Premium cinematic vertical promotional scene for a monster-catching mobile game event. "
            "Sandile, the small tan-and-black crocodile-like Pokémon, is the heroic main subject, "
            "excited beside a cream egg with large green spots that is beginning to hatch. "
            "Golden-hour desert canyon and ancient stone ruins, dramatic warm sunset, glowing sand particles, "
            "subtle futuristic blue PokéStop-like towers in the distance, rich depth, dynamic low camera, "
            "high-end game key art, saturated but realistic lighting, crisp character detail, energetic and joyful. "
            "Keep the central lower third usable for editorial typography. "
            "NO words, NO letters, NO logos, NO watermarks, NO interface panels, NO branding."
        )

    payload = {
        "model": MODEL,
        "prompt": scene,
        "size": SIZE,
        "quality": QUALITY,
        "background": "opaque",
        "output_format": "png",
        "response_format": "b64_json",
        "n": 1,
    }
    response = requests.post(
        OPENAI_API,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json=payload,
        timeout=300,
    )
    if not response.ok:
        body = response.text[:1200]
        raise RuntimeError(f"OpenAI image generation falhou HTTP {response.status_code}: {body}")
    body = response.json()
    encoded = ((body.get("data") or [{}])[0]).get("b64_json")
    if not encoded:
        raise RuntimeError("OpenAI não retornou b64_json")
    data = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(data)).convert("RGB")
    if image.size != (1024, 1536):
        image = ImageOps.fit(image, (1024, 1536), method=Image.Resampling.LANCZOS)
    return image


def add_gradient(image):
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    px = overlay.load()
    for y in range(1536):
        alpha = 0 if y < 700 else int(40 + 185 * min(1.0, (y - 700) / 650))
        for x in range(1024):
            px[x, y] = (2, 11, 30, alpha)
    return Image.alpha_composite(image.convert("RGBA"), overlay)


def compose(item, background):
    image = add_gradient(background)
    draw = ImageDraw.Draw(image, "RGBA")

    rounded_panel(draw, (42, 30, 230, 92), (8, 106, 240, 245), (55, 190, 255, 255), width=2, radius=8)
    draw.text((61, 38), "SPIDEY", font=ImageFont.truetype(FONT_BOLD, 42), fill=(255, 255, 255, 255))
    draw.text((255, 36), "POKÉMON GO", font=ImageFont.truetype(FONT_BOLD, 24), fill=(255, 255, 255, 255))
    draw.text((255, 66), "NOTÍCIAS • EVENTOS • COMUNIDADE", font=ImageFont.truetype(FONT_REG, 18), fill=(235, 242, 255, 255))
    draw.multiline_text((805, 28), "SEMPRE\nUM PASSO\nÀ FRENTE", font=ImageFont.truetype(FONT_BOLD, 20), fill=(240, 245, 255, 255), spacing=4, align="center")

    kicker = str(item.get("kicker") or "DIA DE INCUBAÇÃO DO").upper()
    title = str(item.get("display_title") or "SANDILE").upper()
    subtitle = str(item.get("subtitle") or "Prepare-se para o Dia de chocar Sandile!")

    centered_text(draw, 820, kicker, fit_font(kicker, 900, 70, 42), (255, 205, 45, 255), (5, 50, 115, 255), 6)
    centered_text(draw, 885, title, fit_font(title, 910, 162, 84), (246, 179, 38, 255), (7, 55, 145, 255), 10)

    rounded_panel(draw, (145, 1050, 879, 1114), (3, 30, 70, 225), (28, 179, 255, 255), width=3, radius=24)
    centered_text(draw, 1060, subtitle, fit_font(subtitle, 675, 34, 24), (255, 255, 255, 255))

    rows = [
        ("▣", str(item.get("date_text") or "17 de outubro de 2026")),
        ("◷", str(item.get("time_text") or "11h às 17h • horário local")),
        ("▤", str(item.get("event_text") or "Evento oficial • Pokémon GO")),
    ]
    y = 1138
    for icon, text in rows:
        rounded_panel(draw, (170, y, 854, y + 62), (2, 24, 60, 232), (255, 210, 55, 255), width=3, radius=20)
        draw.text((205, y + 8), icon, font=ImageFont.truetype(FONT_BOLD, 38), fill=(255, 217, 55, 255))
        draw.text((282, y + 11), text, font=fit_font(text, 560, 34, 22), fill=(255, 255, 255, 255))
        y += 72

    if not LOGO_PATH.is_file():
        raise RuntimeError(f"logo oficial ausente: {LOGO_PATH}")
    logo = Image.open(LOGO_PATH).convert("RGB")
    logo = ImageOps.fit(logo, (168, 168), method=Image.Resampling.LANCZOS)
    mask = Image.new("L", (168, 168), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 167, 167), fill=255)
    ring = Image.new("RGBA", (188, 188), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((3, 3, 184, 184), fill=(2, 15, 40, 245), outline=(0, 195, 255, 255), width=5)
    image.alpha_composite(ring, (418, 1330))
    image.paste(logo.convert("RGBA"), (428, 1340), mask)

    footer_font = ImageFont.truetype(FONT_REG, 18)
    draw.text((48, 1485), "JOGO  •  EXPLORAÇÃO  •  COMUNIDADE", font=footer_font, fill=(235, 240, 250, 255))
    source_text = f"Fonte: {str(item.get('source_label') or 'PokeMiners')}"
    box = draw.textbbox((0, 0), source_text, font=footer_font)
    draw.text((976 - (box[2] - box[0]), 1485), source_text, font=footer_font, fill=(245, 245, 245, 255))
    return image.convert("RGB")


def main():
    path, item = load_queue()
    status = str(item.get("status") or "")
    if status != "needs_art":
        print("V2_ART_NOOP", status)
        return 0

    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    final = compose(item, generate_background(item))

    out_name = f"{item.get('id') or 'spidey-event'}.png"
    out_path = GENERATED_DIR / out_name
    final.save(out_path, format="PNG", optimize=True)

    data = out_path.read_bytes()
    if len(data) < 100_000:
        raise RuntimeError(f"arte final pequena demais: {len(data)} bytes")
    if Image.open(out_path).size != (1024, 1536):
        raise RuntimeError("arte final não está em 1024x1536")

    item.pop("image_b64_asset", None)
    item.pop("image_url", None)
    item.update({
        "status": "ready",
        "image_file": f"generated/{out_name}",
        "image_filename": out_name,
        "source_art_sha256": sha256(data),
        "art_generated_at_utc": now(),
        "art_model": MODEL,
        "art_quality": QUALITY,
        "art_dimensions": "1024x1536",
        "art_pipeline": "openai_scene_plus_deterministic_spidey_overlay_v1",
    })
    save_queue(path, item)
    print(f"V2_ART_READY {out_path} bytes={len(data)} sha256={item['source_art_sha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
