import html
import io
import json
import os
import re
import unicodedata
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

PENDING = Path("queue/pending")
CURATED = Path("queue/curated")
ASSETS = Path("assets/generated")
REPO = os.getenv("GITHUB_REPOSITORY", "asaquevoa1-ctrl/spidey-pokemon-go")
BRANCH = os.getenv("SPIDEY_ASSET_BRANCH", "main")
UA = "Mozilla/5.0 (SpideyPokemonGO/2.0)"
W, H = 1080, 1350
STANDARD = "spidey-premium-v1"
PENDING_STATES = {
    "aguardando_curadoria_premium",
    "aguardando_curadoria_midia",
    "aguardando_arte_chatgpt",
}
GENERIC = {
    "pokemon", "pokemongo", "noticia", "evento", "event", "update", "oficial", "g47ix",
    "trainer", "trainers", "pikachu", "raid", "raids", "research", "timed", "shiny",
    "city", "safari", "coming", "available", "details", "fonte", "source", "game",
}
STOP = {
    "para", "com", "uma", "das", "dos", "que", "por", "mais", "como", "esta", "the", "and", "for",
    "with", "this", "that", "from", "will", "are", "you", "your", "next", "into", "have", "get",
    "has", "not", "yet", "now", "two", "days", "visit", "show", "comments", "just", "is", "in",
    "to", "of", "on", "a", "an", "or", "at", "be", "it", "we", "our", "ao", "aos", "na", "no", "em",
}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.description = ""
        self.in_p = False
        self.parts = []
        self.paragraphs = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = (a.get("property") or a.get("name") or "").lower()
            value = (a.get("content") or "").strip()
            if key in {"og:image", "twitter:image", "twitter:image:src"} and value:
                self.images.append(html.unescape(value))
            if key in {"description", "og:description", "twitter:description"} and value and not self.description:
                self.description = html.unescape(value).strip()
        elif tag == "p":
            self.in_p = True
            self.parts = []

    def handle_data(self, data):
        if self.in_p and data.strip():
            self.parts.append(data.strip())

    def handle_endtag(self, tag):
        if tag == "p" and self.in_p:
            text = re.sub(r"\s+", " ", " ".join(self.parts)).strip()
            if len(text) >= 35:
                self.paragraphs.append(text)
            self.in_p = False
            self.parts = []


def get(url, **kwargs):
    headers = dict(kwargs.pop("headers", {}))
    headers.setdefault("User-Agent", UA)
    return requests.get(url, headers=headers, **kwargs)


def noacc(text):
    return "".join(
        c for c in unicodedata.normalize("NFKD", str(text or ""))
        if not unicodedata.combining(c)
    )


def words(text):
    return {
        word for word in re.findall(r"[a-z0-9]{4,}", noacc(text).lower())
        if word not in STOP | GENERIC and not word.isdigit()
    }


def kind(item):
    source_id = str(item.get("_source_id") or "")
    if source_id.startswith("oficial-"):
        return "OFICIAL"
    if source_id.startswith("g47ix-"):
        return "G47IX"
    if source_id.startswith("pokeminers-"):
        return "POKEMINERS"
    if source_id.startswith("sps-"):
        return "SPS"
    return "SPIDEY"


def duplicate(a, b):
    if (kind(a) == "OFICIAL") == (kind(b) == "OFICIAL"):
        return False
    return any(len(word) >= 6 for word in words(a.get("mensagem")) & words(b.get("mensagem")))


def clean_msg(text):
    return re.sub(r"\n*\s*📌\s*Fonte:.*$", "", str(text or ""), flags=re.I | re.S).strip()


def english(text):
    base = f" {noacc(text).lower()} "
    markers = (
        " the ", " and ", " is ", " are ", " will ", " available ", " visit ",
        " stores ", " due ", " event ", " storm ", " rescheduled ",
    )
    return sum(marker in base for marker in markers) >= 2


def translate(text):
    if not english(text):
        return text
    try:
        r = get(
            "https://translate.googleapis.com/translate_a/single",
            params={"client": "gtx", "sl": "auto", "tl": "pt", "dt": "t", "q": text},
            timeout=20,
        )
        r.raise_for_status()
        payload = r.json()
        out = "".join(x[0] for x in (payload[0] or []) if isinstance(x, list) and x and x[0]).strip()
        if out and out != text:
            return out
    except Exception as exc:
        print("TRADUCAO_GOOGLE:", exc)

    try:
        r = get(
            "https://api.mymemory.translated.net/get",
            params={"q": text[:4500], "langpair": "en|pt-BR"},
            timeout=25,
        )
        r.raise_for_status()
        out = str((r.json().get("responseData") or {}).get("translatedText") or "").strip()
        if out and out.lower() != text.lower():
            return html.unescape(out)
    except Exception as exc:
        print("TRADUCAO_MYMEMORY:", exc)
    return text


def page(url):
    r = get(url, timeout=30, allow_redirects=True)
    r.raise_for_status()
    parsed = Page()
    parsed.feed(r.text)
    return parsed


def urls(text):
    return [u.rstrip(".,") for u in re.findall(r"https?://[^\s<>\]\)]+", str(text or ""))]


def pogo_url(url):
    return str(url or "").strip().replace("/pt_BR/", "/pt-BR/")


def page_candidates(item):
    out = [pogo_url(u) for u in urls(item.get("mensagem")) if "pokemongo.com/" in u]
    url = pogo_url(item.get("url"))
    if "pokemongo.com/" in url:
        out.append(url)
    for base in list(out):
        if "/pt-BR/" in base:
            out.append(base.replace("/pt-BR/", "/en/"))
        elif "pokemongo.com/news/" in base:
            out.append(base.replace("pokemongo.com/news/", "pokemongo.com/en/news/"))
    return list(dict.fromkeys(out))


def recursive_images(obj):
    found = []

    def walk(value):
        if isinstance(value, dict):
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)
        elif isinstance(value, str) and value.startswith("http"):
            low = value.lower()
            if "pbs.twimg.com/media" in low or "video_thumb" in low or re.search(r"\.(png|jpe?g|webp)(\?|$)", low):
                found.append(value)

    walk(obj)
    return list(dict.fromkeys(found))


def fx_images(item):
    match = re.search(r"g47ix-(\d+)", str(item.get("_source_id") or ""))
    if not match:
        return []
    post_id = match.group(1)
    try:
        r = get("https://api.fxtwitter.com/2/profile/g47ix/statuses?count=20", timeout=30)
        r.raise_for_status()
        for post in r.json().get("results") or []:
            if str(post.get("id")) == post_id:
                return recursive_images(post)
    except Exception as exc:
        print("FX:", exc)
    return []


def image_candidates(item):
    """Retorna somente mídia coerente com a fonte do item.

    Uma notícia OFICIAL não herda arte do G47IX. Isso evita misturar fonte
    editorial com identidade visual de terceiros.
    """
    out = []
    source_kind = kind(item)

    if source_kind == "OFICIAL":
        for url in page_candidates(item):
            try:
                out.extend(page(url).images)
            except Exception as exc:
                print("PAGE:", url, exc)
    elif source_kind == "G47IX":
        out.extend(fx_images(item))

    for key in ("image_url", "imagem_url", "media_url", "thumbnail_url"):
        value = item.get(key)
        if value:
            out.append(str(value))

    return list(dict.fromkeys(out))


def load_image(url):
    r = get(url, timeout=45, allow_redirects=True)
    r.raise_for_status()
    if len(r.content) < 8000:
        raise ValueError("arquivo pequeno")
    Image.open(io.BytesIO(r.content)).verify()
    image = Image.open(io.BytesIO(r.content)).convert("RGB")
    if image.width < 500 or image.height < 350:
        raise ValueError(f"imagem pequena {image.size}")
    lo, hi = image.resize((64, 64)).convert("L").getextrema()
    if hi <= 12 or (hi - lo <= 3 and hi <= 24):
        raise ValueError("imagem preta")
    return image


def cover(image, width=W, height=H):
    scale = max(width / image.width, height / image.height)
    resized = image.resize((int(image.width * scale), int(image.height * scale)), Image.Resampling.LANCZOS)
    x = (resized.width - width) // 2
    y = (resized.height - height) // 2
    return resized.crop((x, y, x + width, y + height))


def contain(image, width, height):
    scale = min(width / image.width, height / image.height)
    return image.resize((max(1, int(image.width * scale)), max(1, int(image.height * scale))), Image.Resampling.LANCZOS)


def ft(size, bold=False):
    candidates = (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    )
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()


def wrap(draw, text, font, max_width, limit=3):
    lines = []
    current = ""
    for word in str(text).split():
        trial = (current + " " + word).strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
            if len(lines) >= limit:
                break
    if current and len(lines) < limit:
        lines.append(current)
    return lines


def headline(message, title):
    first = re.sub(r"https?://\S+", "", clean_msg(message).split("\n", 1)[0]).strip()
    return (first or title)[:180]


def visual_constraints(item, message):
    base = noacc(" ".join((str(item.get("titulo") or ""), str(message or "")))).lower()
    rules = []
    if "city safari" in base:
        rules.extend(["city_safari_pikachu_no_hat", "city_safari_eevee_safari_hat"])
    if "coreia" in base or "korea" in base or "hanbok" in base:
        rules.append("korea_female_pikachu")
    if "adidas" in base:
        rules.extend(["adidas_jacket", "adidas_cap", "lucario_encounter", "lucario_mega_energy"])
    return rules


def render(item, source, out, message):
    """Monta card premium sem sacrificar a legibilidade da mídia-base.

    A imagem real da fonte funciona como referência/hero. O fundo é derivado da
    própria mídia, com acabamento editorial do Spidey, moldura, brilho, logo,
    categoria e manchete.
    """
    bg = cover(source).filter(ImageFilter.GaussianBlur(18))
    bg = ImageEnhance.Brightness(bg).enhance(0.48).convert("RGBA")
    canvas = bg.copy()
    draw = ImageDraw.Draw(canvas)

    # Moldura externa premium.
    draw.rounded_rectangle((18, 18, W - 18, H - 18), radius=38, outline=(44, 190, 255, 230), width=4)
    draw.rounded_rectangle((26, 26, W - 26, H - 26), radius=34, outline=(230, 190, 78, 180), width=2)

    # Hero preservado: não faz crop agressivo do infográfico/fonte.
    hero = contain(source, 980, 760).convert("RGBA")
    hx = (W - hero.width) // 2
    hy = 170 + max(0, (760 - hero.height) // 2)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((hx - 10, hy - 10, hx + hero.width + 10, hy + hero.height + 10), radius=28, fill=(0, 0, 0, 145))
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(hero, (hx, hy), hero)
    draw = ImageDraw.Draw(canvas)

    # Cabeçalho.
    chip = re.sub(r"^[^A-Za-zÀ-ÿ0-9]*", "", str(item.get("titulo") or "NOTÍCIA")).upper()[:36]
    chip_font = ft(25, True)
    chip_width = min(W - 300, draw.textbbox((0, 0), chip, font=chip_font)[2] + 58)
    draw.rounded_rectangle((48, 48, 48 + chip_width, 108), radius=28, fill=(3, 20, 48, 235), outline=(57, 205, 255, 235), width=2)
    draw.text((77, 65), chip, font=chip_font, fill="white")

    logo_path = Path("assets/spidey-logo-oficial.jpg")
    if not logo_path.exists():
        raise RuntimeError("logo oficial ausente")
    logo = Image.open(logo_path).convert("RGB").resize((120, 120), Image.Resampling.LANCZOS).convert("RGBA")
    mask = Image.new("L", (120, 120))
    ImageDraw.Draw(mask).ellipse((0, 0, 119, 119), fill=255)
    canvas.paste(logo, (W - 168, 40), mask)
    draw = ImageDraw.Draw(canvas)

    # Painel editorial inferior.
    panel_top = 965
    draw.rounded_rectangle((38, panel_top, W - 38, H - 38), radius=34, fill=(2, 14, 34, 232), outline=(48, 190, 255, 210), width=2)
    draw.line((72, panel_top + 22, W - 72, panel_top + 22), fill=(226, 188, 74, 230), width=4)

    text = headline(message, str(item.get("titulo") or "Pokémon GO")).upper()
    title_font = ft(50, True)
    lines = wrap(draw, text, title_font, W - 145, 3)
    y = panel_top + 55
    for line in lines:
        draw.text((72 + 3, y + 3), line, font=title_font, fill=(0, 0, 0, 190))
        draw.text((72, y), line, font=title_font, fill="white")
        y += 60

    source_label = {"OFICIAL": "Pokémon GO oficial", "G47IX": "G47IX", "POKEMINERS": "PokeMiners", "SPS": "SPS"}.get(kind(item), kind(item))
    draw.text((72, H - 92), f"SPIDEY • Fonte: {source_label}", font=ft(23, True), fill=(193, 226, 255))
    draw.text((W - 340, H - 92), "PADRÃO PREMIUM", font=ft(21, True), fill=(229, 193, 89))

    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out, "JPEG", quality=94, optimize=True)


def enrich(item):
    body = clean_msg(item.get("mensagem"))
    if kind(item) == "G47IX":
        body = translate(body)
    if kind(item) == "OFICIAL":
        try:
            candidates = page_candidates(item)
            parsed = page(candidates[0] if candidates else pogo_url(item.get("url")))
            extra = parsed.description
            if extra and extra.lower() in body.lower():
                extra = ""
            if not extra:
                extra = next(
                    (p for p in parsed.paragraphs if p.lower() not in body.lower() and "cookie" not in p.lower()),
                    "",
                )
            if extra and len(body.split()) < 24:
                body += f"\n\n{extra}"
        except Exception as exc:
            print("ENRIQUECER:", exc)

    label = {
        "OFICIAL": "Pokémon GO oficial",
        "G47IX": "G47IX",
        "POKEMINERS": "PokeMiners",
        "SPS": "SPS",
    }.get(kind(item), kind(item))
    return f"{body.strip()}\n\n📌 Fonte: {label}"


def raw(path):
    return f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{path.as_posix()}"


def load_pending():
    rows = []
    for path in sorted(PENDING.glob("*/*.json")):
        try:
            item = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print("JSON:", path, exc)
            continue
        if item.get("status") in PENDING_STATES:
            rows.append((path, item))
    return rows


def main():
    CURATED.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    rows = load_pending()
    if not rows:
        print("Nenhum item aguardando curadoria premium.")
        return 0

    officials = [row for row in rows if kind(row[1]) == "OFICIAL"]
    duplicates = set()

    for path, item in rows:
        if kind(item) == "OFICIAL":
            continue
        for _, official in officials:
            if duplicate(item, official):
                item["status"] = "duplicado"
                item["duplicate_of"] = official.get("_source_id")
                path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                duplicates.add(path)
                print("DUPLICADO", path.name, "->", official.get("_source_id"))
                break

    done = 0
    for path, item in rows:
        if path in duplicates:
            continue

        message = enrich(item)
        source = None
        chosen = None
        errors = []
        for url in image_candidates(item):
            try:
                source = load_image(url)
                chosen = url
                break
            except Exception as exc:
                errors.append(str(exc))

        if source is None:
            print("SEM_ARTE", path.name, "; ".join(errors[:3]))
            continue

        asset = ASSETS / (path.stem + ".jpg")
        render(item, source, asset, message)
        curated_path = CURATED / path.name
        source_url = pogo_url(item.get("url")) if kind(item) == "OFICIAL" else item.get("url")
        coords = item.get("coordenadas", [])
        visual_mode = "premium_operational" if coords else "premium_editorial"

        data = {
            "titulo": item.get("titulo"),
            "mensagem": message,
            "source_url": source_url,
            "image_url": raw(asset),
            "source_verified": True,
            "coordenadas": coords,
            "horarios": item.get("horarios", []),
            "gerar_gpx": bool(item.get("gerar_gpx", True)),
            "gpx_nome": item.get("gpx_nome", "spidey-evento.gpx"),
            "status": "pending",
            "_source_id": item.get("_source_id"),
            "_source_image": chosen,
            "created_at_utc": item.get("created_at_utc"),
            "curated_at_utc": datetime.now(timezone.utc).isoformat(),
            "art_standard_version": STANDARD,
            "art_ready_for_review": True,
            "media_policy": "premium_editorial",
            "visual_mode": visual_mode,
            "visual_constraints": visual_constraints(item, message),
        }
        curated_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        item["status"] = "curated"
        item["curated_path"] = curated_path.as_posix()
        item["asset_path"] = asset.as_posix()
        item["art_standard_version"] = STANDARD
        item["visual_mode"] = visual_mode
        path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        done += 1
        print("CURADO_PREMIUM", path.name)

    print(f"Auto-curadoria premium concluída: {done} item(ns).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
