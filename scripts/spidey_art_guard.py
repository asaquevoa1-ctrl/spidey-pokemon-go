import json
import unicodedata
from pathlib import Path

QUEUE = Path("queue/curated")
STANDARD = "spidey-premium-v1"


def norm(value):
    text = str(value or "").lower()
    return "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))


def block(data, reason):
    data["status"] = "blocked_art_standard"
    data["art_ready_for_review"] = False
    data["art_block_reason"] = reason


def validate(path, data):
    if data.get("status") != "pending":
        return True, None

    if data.get("art_standard_version") != STANDARD:
        return False, f"arte sem padrão obrigatório {STANDARD}"
    if data.get("art_ready_for_review") is not True:
        return False, "arte ainda não liberada para revisão"

    rules = set(data.get("art_rules") or [])
    facts = set(data.get("fact_checks") or [])
    text = norm(" ".join([
        data.get("titulo", ""),
        data.get("mensagem", ""),
        data.get("source_url", ""),
    ]))

    if "city safari" in text:
        required = {"city_safari_pikachu_no_hat", "city_safari_eevee_safari_hat"}
        missing = required - rules
        if missing:
            return False, "City Safari sem regras obrigatórias: " + ", ".join(sorted(missing))

    if "coreia" in text or "korea" in text or "hanbok" in text:
        if "korea_female_pikachu" not in rules:
            return False, "evento da Coreia sem confirmação de Pikachu fêmea"
        shiny_claim = str(data.get("shiny_claim") or "none").strip().lower()
        if shiny_claim not in {"none", "verified_primary"}:
            return False, "alegação de shiny boost sem verificação primária"

    if "adidas" in text:
        required = {"adidas_jacket", "adidas_cap", "lucario_encounter", "lucario_mega_energy"}
        missing = required - facts
        if missing:
            return False, "adidas sem fatos oficiais obrigatórios: " + ", ".join(sorted(missing))

    return True, None


def main():
    QUEUE.mkdir(parents=True, exist_ok=True)
    blocked = 0
    ready = 0
    for path in sorted(QUEUE.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"JSON inválido {path.name}: {exc}")
            continue

        ok, reason = validate(path, data)
        if ok:
            if data.get("status") == "pending":
                ready += 1
                print(f"ART_OK {path.name}")
            continue

        block(data, reason)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        blocked += 1
        print(f"ART_BLOCKED {path.name}: {reason}")

    print(f"Guard concluído: {ready} pronta(s), {blocked} bloqueada(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
