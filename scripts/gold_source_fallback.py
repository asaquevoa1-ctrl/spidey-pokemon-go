import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

from gold_art_upgrade import (
    ASSETS,
    LOGO,
    QUEUE,
    clear_approval_state,
    fetch_source_image,
    font,
    prepare_revision,
    raw_url,
    source_label,
)

# Este renderer NÃO é Premium. Ele existe apenas para preservar uma referência
# visual/factual quando ainda não há arte spidey-premium-v1 aprovada.
ENGINE = "spidey-source-preview-v1"
MODEL = "source-media-preview-pillow-v1"
TECHNICAL_STANDARD = "spidey-technical-fallback-v1"
W, H = 1024, 1536
TARGET_RATIO = W / H


def cover(image, width=W, height=H):
    scale = max(width / image.width, height / image.height)
    resized = image.resize(
        (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    x = max(0, (resized.width - width) // 2)
    y = max(0, (resized.height - height) // 2)
    return resized.crop((x, y, x + width, y + height))


def contain(image, max_width, max_height):
    scale = min(max_width / image.width, max_height / image.height)
    return image.resize(
        (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
        Image.Resampling.LANCZOS,
    )


def source_canvas(source):
    ratio = source.width / source.height
    near_vertical = abs(ratio - TARGET_RATIO) <= 0.16

    if near_vertical:
        scene = cover(source).convert("RGB")
    else:
        background = cover(source).filter(ImageFilter.GaussianBlur(30)).convert("RGB")
        background = ImageEnhance.Brightness(background).enhance(0.58)
        background = ImageEnhance.Color(background).enhance(1.08)
        scene = background.convert("RGBA")

        foreground = contain(source, int(W * 0.96), int(H * 0.88)).convert("RGBA")
        x = (W - foreground.width) // 2
        y = (H - foreground.height) // 2
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        shadow_patch = Image.new("RGBA", (foreground.width, foreground.height), (0, 0, 0, 160))
        shadow.paste(shadow_patch, (x, y + 16))
        shadow = shadow.filter(ImageFilter.GaussianBlur(28))
        scene = Image.alpha_composite(scene, shadow)
        scene.alpha_composite(foreground, (x, y))
        scene = scene.convert("RGB")

    scene = ImageEnhance.Color(scene).enhance(1.10)
    scene = ImageEnhance.Contrast(scene).enhance(1.06)
    scene = ImageEnhance.Sharpness(scene).enhance(1.05)
    return scene.convert("RGBA")


def overlay_source_signature(canvas, item):
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    top_h = 138
    for y in range(top_h):
        alpha = int(120 * (1 - y / top_h))
        draw.line((0, y, W, y), fill=(1, 8, 23, alpha))

    bottom_h = 170
    for y in range(H - bottom_h, H):
        t = (y - (H - bottom_h)) / bottom_h
        draw.line((0, y, W, y), fill=(1, 8, 23, int(25 + 155 * t)))

    margin = 42
    draw.text((margin, 30), "SPIDEY  /  POKÉMON GO", font=font(23, True), fill=(250, 252, 255, 245))
    draw.text((margin, 67), "PRÉVIA TÉCNICA • NÃO PREMIUM", font=font(16, False), fill=(192, 219, 245, 225))
    draw.rectangle((margin, 101, margin + 150, 105), fill=(235, 194, 73, 235))
    draw.text((margin, H - 58), f"Fonte: {source_label(item)}", font=font(16, False), fill=(224, 235, 247, 235))

    if LOGO.exists():
        logo = Image.open(LOGO).convert("RGB")
        side = 92
        logo = logo.resize((side, side), Image.Resampling.LANCZOS).convert("RGBA")
        mask = Image.new("L", (side, side), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, side - 1, side - 1), fill=255)
        lx = W - margin - side
        ly = H - margin - side
        draw.ellipse((lx - 3, ly - 3, lx + side + 3, ly + side + 3), outline=(235, 194, 73, 210), width=2)
        overlay.paste(logo, (lx, ly), mask)

    return Image.alpha_composite(canvas, overlay)


def render_preview(source, out, item):
    canvas = source_canvas(source)
    canvas = overlay_source_signature(canvas, item)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=95, optimize=True)


def eligible(item):
    return str(item.get("status") or "") == "awaiting_gold_art"


def generate(path, item):
    source_url = str(item.get("_source_image") or "").strip()
    if not source_url.startswith("http"):
        raise RuntimeError("_source_image ausente ou inválida")

    revision, reason = prepare_revision(item)
    source = fetch_source_image(source_url)
    ASSETS.mkdir(parents=True, exist_ok=True)
    out = ASSETS / f"{path.stem}-source-preview-r{revision}.jpg"
    render_preview(source, out, item)

    clear_approval_state(item)
    item.update({
        "image_url": raw_url(out),
        "status": "blocked_art_standard",
        "art_revision": revision,
        "art_revision_reason": reason,
        "needs_art_revision": True,
        "art_ready_for_review": False,
        "art_standard_version": TECHNICAL_STANDARD,
        "art_generator_version": ENGINE,
        "art_generation_model": MODEL,
        "gold_standard_visual": False,
        "brand_logo_overlay": True,
        "art_revision_style": "source_preview_only",
        "technical_fallback": True,
        "art_block_reason": "prévia factual gerada; ainda falta arte spidey-premium-v1 real",
        "technical_preview_generated_at_utc": datetime.now(timezone.utc).isoformat(),
    })
    item.pop("gold_art_error", None)
    item.pop("gold_art_retry_at_utc", None)
    item.pop("force_gold_regeneration", None)
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("SOURCE_PREVIEW_ONLY", path.name, f"R{revision}", out.as_posix())


def main():
    QUEUE.mkdir(parents=True, exist_ok=True)
    done = 0
    failed = 0
    for path in sorted(QUEUE.glob("*.json")):
        try:
            item = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print("SOURCE_PREVIEW_JSON_ERROR", path.name, exc)
            continue
        if not eligible(item):
            continue
        try:
            generate(path, item)
            done += 1
        except Exception as exc:
            item["status"] = "blocked_art_standard"
            item["art_ready_for_review"] = False
            item["needs_art_revision"] = True
            item["technical_preview_error"] = str(exc)[:800]
            clear_approval_state(item)
            path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("SOURCE_PREVIEW_WAIT", path.name, exc)
            failed += 1

    print(f"Preview técnico: {done} gerada(s), {failed} com erro. Nenhuma marcada como Premium.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
