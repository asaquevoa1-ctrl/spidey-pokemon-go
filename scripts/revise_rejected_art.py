import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

from auto_curate_pending import (
    ASSETS,
    CURATED,
    H,
    STANDARD,
    W,
    contain,
    cover,
    ft,
    headline,
    kind,
    load_image,
    raw,
    wrap,
)

GENERATOR_VERSION = "premium-revision-v2"


def source_label(item):
    return {
        "OFICIAL": "Pokémon GO oficial",
        "G47IX": "G47IX",
        "POKEMINERS": "PokeMiners",
        "SPS": "SPS",
    }.get(kind(item), kind(item))


def style_name(revision):
    return ("cinematic", "editorial_split", "poster_focus")[revision % 3]


def resolve_source_url(item):
    """Evita revisar uma arte Spidey usando outra arte Spidey como fonte."""
    source_url = str(item.get("_source_image") or "").strip()
    if not source_url:
        raise RuntimeError("_source_image ausente; revisão precisa da mídia factual da fonte")

    parsed = urlparse(source_url)
    path = parsed.path or ""
    marker = "/assets/generated/"
    if marker not in path:
        return source_url

    filename = Path(path).name
    stem = Path(filename).stem
    stem = re.sub(r"-r\d+$", "", stem)
    candidate = CURATED / f"{stem}.json"
    if not candidate.exists():
        return source_url

    try:
        data = json.loads(candidate.read_text(encoding="utf-8"))
    except Exception:
        return source_url

    original = str(data.get("_source_image") or "").strip()
    if original and original != source_url:
        return original
    return source_url


def paste_rounded(canvas, image, box, radius=30):
    x1, y1, x2, y2 = box
    width = max(1, x2 - x1)
    height = max(1, y2 - y1)
    fitted = contain(image, width, height).convert("RGBA")
    x = x1 + (width - fitted.width) // 2
    y = y1 + (height - fitted.height) // 2

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x - 12, y - 12, x + fitted.width + 12, y + fitted.height + 12), radius=radius + 4, fill=(0, 0, 0, 150))
    canvas.alpha_composite(shadow)

    mask = Image.new("L", fitted.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, fitted.width - 1, fitted.height - 1), radius=radius, fill=255)
    canvas.paste(fitted, (x, y), mask)
    return x, y, fitted.width, fitted.height


def add_vertical_gradient(canvas, top, bottom, start_alpha=0, end_alpha=245):
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    span = max(1, bottom - top)
    for y in range(max(0, top), min(H, bottom)):
        t = (y - top) / span
        alpha = int(start_alpha + (end_alpha - start_alpha) * t)
        draw.line((0, y, W, y), fill=(1, 10, 28, alpha))
    canvas.alpha_composite(overlay)


def add_brand(canvas, item):
    draw = ImageDraw.Draw(canvas)
    logo_path = Path("assets/spidey-logo-oficial.jpg")
    if not logo_path.exists():
        raise RuntimeError("logo oficial ausente")
    logo = Image.open(logo_path).convert("RGB").resize((88, 88), Image.Resampling.LANCZOS).convert("RGBA")
    mask = Image.new("L", (88, 88), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 87, 87), fill=255)
    canvas.paste(logo, (50, 42), mask)

    draw.text((154, 48), "SPIDEY", font=ft(32, True), fill=(247, 251, 255))
    draw.text((155, 86), "POKÉMON GO", font=ft(18, True), fill=(78, 207, 255))

    label = f"FONTE • {source_label(item).upper()}"
    font = ft(18, True)
    width = draw.textbbox((0, 0), label, font=font)[2] + 40
    x1 = W - width - 46
    draw.rounded_rectangle((x1, 52, W - 46, 102), radius=24, fill=(2, 18, 43, 220), outline=(86, 211, 255, 210), width=2)
    draw.text((x1 + 20, 67), label, font=font, fill=(228, 244, 255))


def add_web_motif(canvas):
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    anchor = (W - 22, 24)
    for target in ((640, 24), (720, 150), (810, 260), (930, 350), (W - 22, 420)):
        draw.line((anchor[0], anchor[1], target[0], target[1]), fill=(85, 205, 255, 48), width=2)
    for inset in (50, 105, 165, 230):
        box = (W - 2 * inset - 22, 24 - inset, W - 22 + inset, 24 + 2 * inset)
        draw.arc(box, 90, 205, fill=(232, 193, 82, 45), width=2)
    canvas.alpha_composite(overlay)


def draw_headline(canvas, item, message, y, max_width, font_size=54, max_lines=4, x=60):
    draw = ImageDraw.Draw(canvas)
    text = headline(message, str(item.get("titulo") or "Pokémon GO")).upper()
    font = ft(font_size, True)
    lines = wrap(draw, text, font, max_width, max_lines)
    for line in lines:
        draw.text((x + 3, y + 3), line, font=font, fill=(0, 0, 0, 170))
        draw.text((x, y), line, font=font, fill=(248, 251, 255))
        y += font_size + 10
    return y


def render_cinematic(item, source, out, message):
    bg = cover(source).filter(ImageFilter.GaussianBlur(24))
    bg = ImageEnhance.Brightness(bg).enhance(0.34).convert("RGBA")
    canvas = bg.copy()
    add_web_motif(canvas)
    add_brand(canvas, item)

    paste_rounded(canvas, source, (44, 155, W - 44, 915), radius=34)
    add_vertical_gradient(canvas, 820, H, 35, 250)

    draw = ImageDraw.Draw(canvas)
    draw.rectangle((48, 930, 170, 938), fill=(73, 207, 255, 235))
    draw.rectangle((170, 930, 242, 938), fill=(232, 190, 75, 235))
    draw.text((52, 953), "DESTAQUE SPIDEY", font=ft(19, True), fill=(88, 213, 255))
    draw_headline(canvas, item, message, 994, W - 104, font_size=50, max_lines=4, x=52)
    draw.text((52, H - 54), f"Fonte verificada: {source_label(item)}", font=ft(20, True), fill=(197, 226, 244))

    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=95, optimize=True)


def render_editorial_split(item, source, out, message):
    bg = cover(source).filter(ImageFilter.GaussianBlur(30))
    bg = ImageEnhance.Brightness(bg).enhance(0.22).convert("RGBA")
    canvas = bg.copy()

    dark = Image.new("RGBA", canvas.size, (1, 12, 30, 180))
    canvas.alpha_composite(dark)
    add_web_motif(canvas)

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((38, 38, 292, 920), radius=34, fill=(1, 17, 42, 235), outline=(71, 205, 255, 180), width=2)
    draw.rectangle((38, 156, 46, 690), fill=(74, 208, 255, 240))

    logo_path = Path("assets/spidey-logo-oficial.jpg")
    if not logo_path.exists():
        raise RuntimeError("logo oficial ausente")
    logo = Image.open(logo_path).convert("RGB").resize((112, 112), Image.Resampling.LANCZOS).convert("RGBA")
    mask = Image.new("L", (112, 112), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 111, 111), fill=255)
    canvas.paste(logo, (82, 72), mask)

    draw.text((78, 222), "SPIDEY", font=ft(34, True), fill="white")
    draw.text((78, 264), "POKÉMON GO", font=ft(18, True), fill=(82, 210, 255))
    draw.text((78, 330), "FONTE", font=ft(17, True), fill=(231, 192, 85))
    label_lines = wrap(draw, source_label(item).upper(), ft(22, True), 170, 4)
    yy = 360
    for line in label_lines:
        draw.text((78, yy), line, font=ft(22, True), fill=(226, 239, 249))
        yy += 30

    paste_rounded(canvas, source, (320, 58, W - 40, 920), radius=30)
    add_vertical_gradient(canvas, 820, H, 50, 250)

    draw = ImageDraw.Draw(canvas)
    draw.text((48, 948), "AGORA NO SPIDEY", font=ft(19, True), fill=(79, 210, 255))
    draw_headline(canvas, item, message, 990, W - 96, font_size=48, max_lines=4, x=48)
    draw.text((48, H - 52), "Informação factual • decisão editorial humana", font=ft(18, True), fill=(194, 222, 239))

    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=95, optimize=True)


def render_poster_focus(item, source, out, message):
    bg = cover(source).filter(ImageFilter.GaussianBlur(16))
    bg = ImageEnhance.Brightness(bg).enhance(0.40).convert("RGBA")
    canvas = bg.copy()
    add_brand(canvas, item)

    hero = contain(source, 960, 850).convert("RGBA")
    hx = (W - hero.width) // 2
    hy = 150 + max(0, (820 - hero.height) // 2)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((hx - 16, hy - 16, hx + hero.width + 16, hy + hero.height + 16), radius=36, fill=(0, 0, 0, 170))
    canvas.alpha_composite(shadow)
    mask = Image.new("L", hero.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, hero.width - 1, hero.height - 1), radius=30, fill=255)
    canvas.paste(hero, (hx, hy), mask)

    add_vertical_gradient(canvas, 880, H, 25, 250)
    draw = ImageDraw.Draw(canvas)
    draw.polygon([(40, 938), (310, 938), (270, 970), (40, 970)], fill=(72, 207, 255, 235))
    draw.text((58, 944), "SPIDEY PREMIUM", font=ft(17, True), fill=(2, 18, 40))
    draw_headline(canvas, item, message, 995, W - 110, font_size=50, max_lines=4, x=55)
    draw.text((55, H - 54), f"Fonte: {source_label(item)}", font=ft(20, True), fill=(201, 228, 245))

    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=95, optimize=True)


def render_revision(item, source, out, message, revision):
    style = style_name(revision)
    if style == "editorial_split":
        render_editorial_split(item, source, out, message)
    elif style == "poster_focus":
        render_poster_focus(item, source, out, message)
    else:
        render_cinematic(item, source, out, message)
    return style


def next_revision(item):
    try:
        current = int(item.get("art_revision") or 1)
    except (TypeError, ValueError):
        current = 1
    return max(2, current + 1)


def clear_revision_state(item):
    for key in (
        "discord_approval_id",
        "discord_reactions_ready",
        "sent_at_utc",
        "approval_reconciled",
        "decision_at_utc",
        "discord_reactions",
        "discord_public_id",
        "published_at_utc",
        "publication_reconciled",
        "approval_binding_version",
        "approved_revision",
        "approved_image_url",
        "approved_discord_approval_id",
        "approved_art_sha256",
        "approved_at_utc",
        "approval_binding_error",
        "published_revision",
        "published_image_url",
        "published_approval_id",
        "published_art_sha256",
        "publication_block_reason",
        "publication_blocked_at_utc",
    ):
        item.pop(key, None)


def revise(path, item):
    source_url = resolve_source_url(item)
    source = load_image(source_url)
    revision = next_revision(item)
    asset = ASSETS / f"{path.stem}-r{revision}.jpg"
    style = render_revision(item, source, asset, item.get("mensagem") or "", revision)

    history = item.setdefault("art_revision_history", [])
    history.append({
        "revision": revision - 1,
        "status": "rejected_art",
        "image_url": item.get("image_url"),
        "discord_approval_id": item.get("discord_approval_id"),
        "decision_at_utc": item.get("decision_at_utc"),
        "discord_reactions": item.get("discord_reactions"),
        "art_generator_version": item.get("art_generator_version"),
        "art_revision_style": item.get("art_revision_style"),
    })

    clear_revision_state(item)
    item.update({
        "_source_image": source_url,
        "image_url": raw(asset),
        "status": "pending",
        "art_revision": revision,
        "art_revision_reason": "human_rejected",
        "needs_art_revision": False,
        "art_ready_for_review": True,
        "art_standard_version": STANDARD,
        "art_generator_version": GENERATOR_VERSION,
        "art_revision_style": style,
        "revised_at_utc": datetime.now(timezone.utc).isoformat(),
    })
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("ARTE_REVISADA", path.name, f"R{revision}", style, "->", asset.as_posix())


def refresh_pending_revision(path, item):
    if item.get("status") != "pending" or str(item.get("discord_approval_id") or "").strip():
        return False
    try:
        revision = int(item.get("art_revision") or 1)
    except (TypeError, ValueError):
        return False
    if revision < 2 or item.get("art_generator_version") == GENERATOR_VERSION:
        return False

    source_url = resolve_source_url(item)
    source = load_image(source_url)
    asset = ASSETS / f"{path.stem}-r{revision}.jpg"
    style = render_revision(item, source, asset, item.get("mensagem") or "", revision)
    item["_source_image"] = source_url
    item["image_url"] = raw(asset)
    item["art_generator_version"] = GENERATOR_VERSION
    item["art_revision_style"] = style
    item["art_refreshed_at_utc"] = datetime.now(timezone.utc).isoformat()
    item["art_ready_for_review"] = True
    item["art_standard_version"] = STANDARD
    item["media_policy"] = "premium_editorial"
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("ARTE_ATUALIZADA_ANTES_DO_ENVIO", path.name, f"R{revision}", style, "->", asset.as_posix())
    return True


def main():
    CURATED.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    revised = 0
    refreshed = 0

    for path in sorted(CURATED.glob("*.json")):
        try:
            item = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print("JSON:", path, exc)
            continue

        if item.get("status") == "rejected_art" and item.get("needs_art_revision"):
            try:
                revise(path, item)
                revised += 1
            except Exception as exc:
                print("REVISAO_FALHOU", path.name, exc)
            continue

        try:
            if refresh_pending_revision(path, item):
                refreshed += 1
        except Exception as exc:
            print("REFRESH_FALHOU", path.name, exc)

    print(f"Revisão de arte concluída: {revised} nova(s); {refreshed} pendente(s) atualizada(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
