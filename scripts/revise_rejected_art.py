import json
from datetime import datetime, timezone
from pathlib import Path

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


def render_revision(item, source, out, message, revision):
    """Gera uma composição nova para uma arte reprovada.

    R2+ não replica o card original: preserva a mídia factual da fonte, mas muda
    hierarquia, enquadramento e tratamento editorial para uma revisão visual real.
    """
    bg = cover(source).filter(ImageFilter.GaussianBlur(26))
    bg = ImageEnhance.Brightness(bg).enhance(0.34).convert("RGBA")
    canvas = bg.copy()
    draw = ImageDraw.Draw(canvas)

    # Moldura e acentos editoriais.
    draw.rounded_rectangle((20, 20, W - 20, H - 20), radius=42, outline=(72, 205, 255, 235), width=4)
    draw.line((54, 145, W - 54, 145), fill=(232, 190, 75, 220), width=4)

    # Cabeçalho compacto.
    chip = str(item.get("titulo") or "POKÉMON GO").upper()[:34]
    chip_font = ft(24, True)
    chip_w = min(W - 310, draw.textbbox((0, 0), chip, font=chip_font)[2] + 58)
    draw.rounded_rectangle((52, 52, 52 + chip_w, 112), radius=28, fill=(2, 17, 42, 235), outline=(76, 205, 255, 235), width=2)
    draw.text((80, 68), chip, font=chip_font, fill="white")

    rev_label = f"REVISÃO R{revision}"
    rev_font = ft(22, True)
    rw = draw.textbbox((0, 0), rev_label, font=rev_font)[2] + 46
    draw.rounded_rectangle((W - rw - 52, 52, W - 52, 112), radius=28, fill=(104, 30, 155, 235), outline=(235, 198, 255, 220), width=2)
    draw.text((W - rw - 29, 69), rev_label, font=rev_font, fill="white")

    # Hero maior e central, com respiro lateral.
    hero = contain(source, 940, 840).convert("RGBA")
    hx = (W - hero.width) // 2
    hy = 182 + max(0, (840 - hero.height) // 2)

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (hx - 14, hy - 14, hx + hero.width + 14, hy + hero.height + 14),
        radius=34,
        fill=(0, 0, 0, 170),
        outline=(70, 199, 255, 170),
        width=2,
    )
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(hero, (hx, hy), hero)
    draw = ImageDraw.Draw(canvas)

    # Logo oficial do projeto.
    logo_path = Path("assets/spidey-logo-oficial.jpg")
    if not logo_path.exists():
        raise RuntimeError("logo oficial ausente")
    logo = Image.open(logo_path).convert("RGB").resize((112, 112), Image.Resampling.LANCZOS).convert("RGBA")
    mask = Image.new("L", (112, 112))
    ImageDraw.Draw(mask).ellipse((0, 0, 111, 111), fill=255)
    canvas.paste(logo, (W - 164, 164), mask)
    draw = ImageDraw.Draw(canvas)

    # Bloco inferior com manchete mais curta e mais forte.
    panel_top = 1040
    draw.rounded_rectangle((42, panel_top, W - 42, H - 42), radius=34, fill=(1, 13, 33, 238), outline=(71, 205, 255, 210), width=2)
    draw.line((76, panel_top + 22, W - 76, panel_top + 22), fill=(230, 188, 75, 230), width=4)

    title = headline(message, str(item.get("titulo") or "Pokémon GO")).upper()
    title_font = ft(45, True)
    lines = wrap(draw, title, title_font, W - 150, 3)
    y = panel_top + 50
    for line in lines:
        draw.text((76 + 2, y + 2), line, font=title_font, fill=(0, 0, 0, 190))
        draw.text((76, y), line, font=title_font, fill="white")
        y += 54

    source_label = {
        "OFICIAL": "Pokémon GO oficial",
        "G47IX": "G47IX",
        "POKEMINERS": "PokeMiners",
        "SPS": "SPS",
    }.get(kind(item), kind(item))
    draw.text((76, H - 84), f"SPIDEY • Fonte: {source_label}", font=ft(22, True), fill=(190, 226, 255))

    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=95, optimize=True)


def next_revision(item):
    try:
        current = int(item.get("art_revision") or 1)
    except (TypeError, ValueError):
        current = 1
    return max(2, current + 1)


def revise(path, item):
    source_url = str(item.get("_source_image") or "").strip()
    if not source_url:
        raise RuntimeError("_source_image ausente; revisão não pode reutilizar arte gerada como fonte")

    source = load_image(source_url)
    revision = next_revision(item)
    asset = ASSETS / f"{path.stem}-r{revision}.jpg"
    render_revision(item, source, asset, item.get("mensagem") or "", revision)

    history = item.setdefault("art_revision_history", [])
    history.append({
        "revision": revision - 1,
        "status": "rejected_art",
        "image_url": item.get("image_url"),
        "discord_approval_id": item.get("discord_approval_id"),
        "decision_at_utc": item.get("decision_at_utc"),
        "discord_reactions": item.get("discord_reactions"),
    })

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

    item.update({
        "image_url": raw(asset),
        "status": "pending",
        "art_revision": revision,
        "art_revision_reason": "human_rejected",
        "needs_art_revision": False,
        "art_ready_for_review": True,
        "art_standard_version": STANDARD,
        "revised_at_utc": datetime.now(timezone.utc).isoformat(),
    })
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("ARTE_REVISADA", path.name, f"R{revision}", "->", asset.as_posix())


def main():
    CURATED.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    revised = 0

    for path in sorted(CURATED.glob("*.json")):
        try:
            item = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print("JSON:", path, exc)
            continue

        if item.get("status") != "rejected_art" or not item.get("needs_art_revision"):
            continue

        try:
            revise(path, item)
            revised += 1
        except Exception as exc:
            print("REVISAO_FALHOU", path.name, exc)

    print(f"Revisão de arte concluída: {revised} item(ns).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
