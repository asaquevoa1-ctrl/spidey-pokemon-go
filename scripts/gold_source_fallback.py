import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

from gold_art_upgrade import (
    ASSETS,
    GOLD_REFERENCE,
    LOGO,
    QUEUE,
    STANDARD,
    clear_approval_state,
    fetch_source_image,
    font,
    prepare_revision,
    raw_url,
    source_label,
)

ENGINE = "spidey-gold-source-v1"
MODEL = "source-media-editorial-pillow-v2"
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
    """Preserva a mídia factual sempre que um crop 2:3 cortaria informação demais."""
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

        # Sombra difusa sem caixa, borda ou moldura: a mídia continua sendo a própria cena.
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
    """Assinatura mínima para mídia factual: sem manchete duplicada, pill ou card."""
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
    draw.text((margin, 67), "MÍDIA FACTUAL • FONTE PRESERVADA", font=font(16, False), fill=(192, 219, 245, 225))
    draw.rectangle((margin, 101, margin + 150, 105), fill=(235, 194, 73, 235))

    source = f"Fonte: {source_label(item)}"
    draw.text((margin, H - 58), source, font=font(16, False), fill=(224, 235, 247, 235))

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


def render_full_bleed(source, out, item):
    canvas = source_canvas(source)
    canvas = overlay_source_signature(canvas, item)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=95, optimize=True)


def eligible(item):
    if str(item.get("status") or "") != "awaiting_gold_art":
        return False
    error = str(item.get("gold_art_error") or "")
    return "OPENAI_API_KEY ausente" in error


def generate(path, item):
    source_url = str(item.get("_source_image") or "").strip()
    if not source_url.startswith("http"):
        raise RuntimeError("_source_image ausente ou inválida")

    revision, reason = prepare_revision(item)
    source = fetch_source_image(source_url)
    ASSETS.mkdir(parents=True, exist_ok=True)
    out = ASSETS / f"{path.stem}-gold-source-r{revision}.jpg"
    render_full_bleed(source, out, item)

    clear_approval_state(item)
    item.update({
        "image_url": raw_url(out),
        "status": "pending",
        "art_revision": revision,
        "art_revision_reason": reason,
        "needs_art_revision": False,
        "art_ready_for_review": True,
        "art_standard_version": STANDARD,
        "art_generator_version": ENGINE,
        "art_generation_model": MODEL,
        "visual_reference_set": GOLD_REFERENCE,
        "gold_standard_visual": True,
        "brand_logo_overlay": True,
        "art_revision_style": "gold_source_full_bleed",
        "gold_source_fallback": True,
        "gold_fallback_reason": "OPENAI_API_KEY ausente",
        "gold_generated_at_utc": datetime.now(timezone.utc).isoformat(),
    })
    item.pop("gold_art_error", None)
    item.pop("gold_art_retry_at_utc", None)
    item.pop("force_gold_regeneration", None)
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("GOLD_SOURCE_READY", path.name, f"R{revision}", out.as_posix())


def main():
    QUEUE.mkdir(parents=True, exist_ok=True)
    done = 0
    failed = 0
    for path in sorted(QUEUE.glob("*.json")):
        try:
            item = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print("GOLD_SOURCE_JSON_ERROR", path.name, exc)
            continue
        if not eligible(item):
            continue
        try:
            generate(path, item)
            done += 1
        except Exception as exc:
            item["status"] = "awaiting_gold_art"
            item["art_ready_for_review"] = False
            item["gold_source_fallback_error"] = str(exc)[:800]
            item["gold_source_retry_at_utc"] = datetime.now(timezone.utc).isoformat()
            clear_approval_state(item)
            path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("GOLD_SOURCE_WAIT", path.name, exc)
            failed += 1

    print(f"Fallback Gold: {done} pronta(s), {failed} aguardando nova tentativa.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
