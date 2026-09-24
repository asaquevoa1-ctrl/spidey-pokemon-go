import json
from pathlib import Path
from urllib.parse import urlparse

QUEUE = Path("queue/curated")
STANDARD = "spidey-source-v1"
GENERATED_PREFIX = "https://raw.githubusercontent.com/asaquevoa1-ctrl/spidey-pokemon-go/"


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

    source_image = str(data.get("_source_image") or "").strip()
    if not public_http(source_image):
        return False, "mídia original da fonte ausente ou inválida"

    image_url = str(data.get("image_url") or "").strip()
    if not image_url.startswith(GENERATED_PREFIX) or "/assets/generated/" not in image_url:
        return False, "card final precisa estar persistido em assets/generated no GitHub"

    # O card é sempre montado a partir da mídia real da fonte pelo auto-curador.
    # Não tentamos inventar personagens, roupas ou detalhes visuais a partir do texto.
    # Integridade, resolução e arte praticamente preta são validadas novamente
    # imediatamente antes do envio ao Discord em send_curated.py.
    data["art_standard_version"] = STANDARD
    data["art_ready_for_review"] = True
    data["media_policy"] = "source_first"
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
                print(f"ART_OK_SOURCE {path.name}")
        else:
            block(data, reason)
            blocked += 1
            print(f"ART_BLOCKED {path.name}: {reason}")

        after = json.dumps(data, ensure_ascii=False, sort_keys=True)
        if before != after:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed += 1

    print(f"Guard concluído: {ready} pronta(s), {blocked} bloqueada(s), {changed} atualizada(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
