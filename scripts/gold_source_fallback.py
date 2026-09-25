import json
import re
from datetime import datetime, timezone
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

from gold_art_upgrade import (
    ASSETS,
    GOLD_REFERENCE,
    QUEUE,
    STANDARD,
    clean_title,
    clear_approval_state,
    fetch_source_image,
    font,
    overlay_brand,
    prepare_revision,
    raw_url,
    source_label,
)

ENGINE = "spidey-gold-source-v1"
MODEL = "source-media-editorial-pillow-v1"
W, H = 1024, 1536


def cover(image, width=W, height=H):
    scale = max(width / image.width, height / image.height)
    resized = image.resize(
        (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    x = max(0, (resized.width - width) // 2)
    y = max(0, (resized.height - height) // 2)
    return resized.crop((x, y, x + width, y + height))


def title_pt(item):
    raw = clean_title(item)
    raw = re.sub(r"^Dig in during\s+", "", raw, flags=re.I).strip()

    patterns = (
        (r"^(.+?)\s+Hatch Day!?$", "DIA DE INCUBAÇÃO DO {}"),
        (r"^(.+?)\s+Community Day!?$", "DIA DA COMUNIDADE: {}"),
        (r"^(.+?)\s+Raid Day!?$", "DIA DE REIDES: {}"),
        (r"^(.+?)\s+Research Day!?$", "DIA DE PESQUISA: {}"),
    )
    for pattern, fmt in patterns:
        match = re.match(pattern, raw, flags=re.I)
        if match:
            return fmt.format(match.group(1).strip().upper())

    if re.search(r"Spotlight Hour", raw, flags=re.I):
        name = re.sub(r"\s*Spotlight Hour.*$", "", raw, flags=re.I).strip()
        return f"HORA DO HOLOFOTE: {name.upper()}" if name else "HORA DO HOLOFOTE"

    # Tradução apenas textual; se o serviço falhar, preserva o título factual original.
    try:
        response = requests.get(
            "https://translate.googleapis.com/translate_a/single",
            params={"client": "gtx", "sl": "auto", "tl": "pt", "dt": "t", "q": raw},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        translated = "".join(
            part[0] for part in (payload[0] or [])
            if isinstance(part, list) and part and part[0]
        ).strip()
        if translated:
            return translated.upper()
    except Exception as exc:
        print("GOLD_SOURCE_TRANSLATION", exc)

    return raw.upper()


def wrap_lines(draw, text, fnt, max_width, max_lines=3):
    words = str(text).split()
    lines = []
    current = ""
    for word in words:
        trial = (current + " " + word).strip()
        if not current or draw.textbbox((0, 0), trial, font=fnt, stroke_width=2)[2] <= max_width:
            current = trial
            continue
        lines.append(current)
        current = word
        if len(lines) >= max_lines - 1:
            break
    if current and len(lines) < max_lines:
        lines.append(current)
    consumed = " ".join(lines)
    if len(consumed.split()) < len(words):
        last = lines[-1]
        while last and draw.textbbox((0, 0), last + "…", font=fnt, stroke_width=2)[2] > max_width:
            last = last[:-1].rstrip()
        lines[-1] = last + "…"
    return lines


def render_full_bleed(source, out, item):
    scene = cover(source).convert("RGB")
    scene = ImageEnhance.Color(scene).enhance(1.16)
    scene = ImageEnhance.Contrast(scene).enhance(1.10)
    scene = ImageEnhance.Sharpness(scene).enhance(1.08).convert("RGBA")

    # Cria profundidade sem transformar a mídia da fonte em screenshot/card encaixotado.
    blurred = cover(source).filter(ImageFilter.GaussianBlur(24)).convert("RGBA")
    blurred = ImageEnhance.Brightness(blurred.convert("RGB")).enhance(0.70).convert("RGBA")
    canvas = Image.blend(blurred, scene, 0.82)

    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)

    # Vinheta lateral.
    for x in range(150):
        alpha = int(105 * (1 - x / 150))
        sd.line((x, 0, x, H), fill=(0, 8, 24, alpha))
        sd.line((W - 1 - x, 0, W - 1 - x, H), fill=(0, 8, 24, alpha))

    # Gradiente superior para o cabeçalho oficial e inferior para a manchete.
    for y in range(0, 310):
        alpha = int(150 * (1 - y / 310))
        sd.line((0, y, W, y), fill=(0, 10, 32, alpha))
    start = 660
    for y in range(start, H):
        t = (y - start) / (H - start)
        alpha = int(20 + 220 * min(1.0, t * 1.20))
        sd.line((0, y, W, y), fill=(0, 8, 24, alpha))

    canvas = Image.alpha_composite(canvas, shade)
    draw = ImageDraw.Draw(canvas)

    official = "pokemongo.com" in str(item.get("source_url") or "").lower()
    eyebrow = "EVENTO OFICIAL • POKÉMON GO" if official else f"ATUALIZAÇÃO • {source_label(item).upper()}"
    eyebrow_font = font(24, True)
    box = draw.textbbox((0, 0), eyebrow, font=eyebrow_font)
    ew = box[2] - box[0]
    ex = 54
    ey = 690
    draw.rounded_rectangle(
        (ex, ey, min(W - 54, ex + ew + 62), ey + 58),
        radius=24,
        fill=(5, 26, 57, 218),
        outline=(47, 198, 255, 225),
        width=2,
    )
    draw.text((ex + 30, ey + 14), eyebrow, font=eyebrow_font, fill=(245, 249, 255, 255))

    title = title_pt(item)
    title_font = None
    lines = []
    for size in range(92, 54, -4):
        candidate = font(size, True)
        wrapped = wrap_lines(draw, title, candidate, 900, 3)
        total_h = len(wrapped) * int(size * 1.02)
        if total_h <= 285:
            title_font = candidate
            lines = wrapped
            break
    if title_font is None:
        title_font = font(54, True)
        lines = wrap_lines(draw, title, title_font, 900, 3)

    y = 785
    for idx, line in enumerate(lines):
        # Alterna branco/dourado para criar hierarquia sem sacrificar leitura.
        fill = (255, 211, 74, 255) if idx == 0 else (244, 249, 255, 255)
        draw.text(
            (54, y),
            line,
            font=title_font,
            fill=fill,
            stroke_width=4,
            stroke_fill=(0, 10, 28, 235),
        )
        bbox = draw.textbbox((54, y), line, font=title_font, stroke_width=4)
        y = bbox[3] + 8

    accent_y = min(1140, y + 22)
    draw.rounded_rectangle((54, accent_y, 388, accent_y + 6), radius=3, fill=(44, 194, 255, 245))
    draw.rounded_rectangle((402, accent_y, 620, accent_y + 6), radius=3, fill=(236, 193, 70, 245))

    sub = "Fonte verificada • detalhes no link da publicação"
    draw.text((54, accent_y + 25), sub, font=font(21, False), fill=(236, 242, 250, 238))

    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=95, optimize=True)
    overlay_brand(out, item)


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
