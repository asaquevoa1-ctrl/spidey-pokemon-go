import json
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

QUEUE = Path("queue/curated")
STANDARD = "spidey-premium-v1"
GOLD_ENGINE = "spidey-gold-openai-v1"
GOLD_SOURCE_ENGINE = "spidey-gold-source-v1"
GOLD_ENGINES = {GOLD_ENGINE, GOLD_SOURCE_ENGINE}
GOLD_REFERENCE = "spidey-gold-standard-2026-09-25"
GENERATED_PREFIX = "https://raw.githubusercontent.com/asaquevoa1-ctrl/spidey-pokemon-go/"


def norm(value):
    text = str(value or "").lower()
    return "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))


def public_http(value):
    try:
        parsed = urlparse(str(value or "").strip())
    except Exception:
        return False
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def block(data, reason):
    data["status"] = "blocked_art_standard"
    data["art_ready_for_review"] = False
    data["art_standard_version"] = STANDARD
    data["art_block_reason"] = reason


def validate(path, data):
    if data.get("status") != "pending":
        return True, None

    if data.get("source_verified") is not True:
        return False, "fonte do conteúdo não foi verificada"

    source_url = str(data.get("source_url") or "").strip()
    if not public_http(source_url):
        return False, "source_url ausente ou inválida"

    source_image = str(data.get("_source_image") or "").strip()
    if not public_http(source_image):
        return False, "mídia/referência visual da fonte ausente ou inválida"

    image_url = str(data.get("image_url") or "").strip()
    if not image_url.startswith(GENERATED_PREFIX) or "/assets/generated/" not in image_url:
        return False, "arte final precisa estar persistida em assets/generated no GitHub"

    if data.get("art_standard_version") != STANDARD:
        return False, f"arte fora do padrão obrigatório {STANDARD}"

    if data.get("art_ready_for_review") is not True:
        return False, "arte ainda não foi liberada para revisão"

    if str(data.get("media_policy") or "") != "premium_editorial":
        return False, "política visual não está em premium_editorial"

    # Gold Standard é condição técnica de entrada no Discord. O motor OpenAI é
    # preferencial; o source-v1 é um fallback full-bleed certificado que usa a
    # mídia factual da própria fonte quando a chave de geração não está disponível.
    if data.get("gold_standard_visual") is not True:
        return False, "arte não foi gerada pelo fluxo Gold Standard"
    engine = str(data.get("art_generator_version") or "")
    if engine not in GOLD_ENGINES:
        return False, "motor visual inválido; obrigatório um motor Gold certificado"
    if engine == GOLD_SOURCE_ENGINE and str(data.get("art_revision_style") or "") != "gold_source_full_bleed":
        return False, "fallback Gold precisa usar composição full-bleed certificada"
    if str(data.get("visual_reference_set") or "") != GOLD_REFERENCE:
        return False, "referência visual oficial Gold Standard ausente"
    if data.get("brand_logo_overlay") is not True:
        return False, "logo oficial Spidey não foi aplicado pelo sistema"

    text = norm(" ".join([
        data.get("titulo", ""),
        data.get("mensagem", ""),
        data.get("source_url", ""),
    ]))
    constraints = set(data.get("visual_constraints") or [])

    if "city safari" in text:
        required = {"city_safari_pikachu_no_hat", "city_safari_eevee_safari_hat"}
        missing = required - constraints
        if missing:
            return False, "City Safari sem regras visuais obrigatórias: " + ", ".join(sorted(missing))

    if "coreia" in text or "korea" in text or "hanbok" in text:
        if "korea_female_pikachu" not in constraints:
            return False, "evento da Coreia sem regra obrigatória de Pikachu fêmea"

    if "adidas" in text:
        required = {"adidas_jacket", "adidas_cap", "lucario_encounter", "lucario_mega_energy"}
        missing = required - constraints
        if missing:
            return False, "adidas sem regras oficiais obrigatórias: " + ", ".join(sorted(missing))

    data.pop("art_block_reason", None)
    return True, None


def main():
    QUEUE.mkdir(parents=True, exist_ok=True)
    blocked = 0
    ready = 0
    changed = 0

    for path in sorted(QUEUE.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"JSON inválido {path.name}: {exc}")
            continue

        before = json.dumps(data, ensure_ascii=False, sort_keys=True)
        ok, reason = validate(path, data)
        if ok:
            if data.get("status") == "pending":
                ready += 1
                print(f"ART_OK_GOLD {path.name}")
        else:
            block(data, reason)
            blocked += 1
            print(f"ART_BLOCKED {path.name}: {reason}")

        after = json.dumps(data, ensure_ascii=False, sort_keys=True)
        if before != after:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed += 1

    print(f"Guard Gold concluído: {ready} pronta(s), {blocked} bloqueada(s), {changed} atualizada(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
