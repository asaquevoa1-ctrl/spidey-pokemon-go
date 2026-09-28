from __future__ import annotations

import json
import re
from copy import deepcopy
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
STAMPS_FILE = ROOT / "spidey-app" / "data" / "stamps.json"
READY_FILE = ROOT / "queue" / "app-ready" / "pokexciting-cross-region-official.json"
OFFICIAL_URL = "https://pokemongo.com/en/news/event-apac-stamp-rally-2026"
RALLY_ID = "pokexciting-cross-region-2026"
UA = "Mozilla/5.0 (SpideyPokemonGO/3.0)"

LABEL_TO_STOP = {
    "Kuala Lumpur, Malaysia": "pokexciting-kuala-lumpur-klcc",
    "Taipei, Taiwan": "pokexciting-taipei-xiangti",
    "Singapore": "pokexciting-singapore-changi-t3",
    "Manila, Philippines": "pokexciting-manila-moa-sky",
    "Bangkok, Thailand": "pokexciting-bangkok-tba",
}


class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data):
        text = re.sub(r"\s+", " ", data).strip()
        if text:
            self.parts.append(text)

    def text(self) -> str:
        return " ".join(self.parts)


def fetch_official_text() -> str:
    response = requests.get(OFFICIAL_URL, headers={"User-Agent": UA}, timeout=30)
    response.raise_for_status()
    parser = TextParser()
    parser.feed(response.text)
    text = parser.text()
    if "Cross-Regional Schedule" not in text or "Kuala Lumpur" not in text:
        raise RuntimeError("Página oficial não contém o bloco esperado do Stamp Rally.")
    start = text.index("Cross-Regional Schedule")
    end_marker = "Please be aware of your surroundings"
    end = text.find(end_marker, start)
    return text[start:end if end > start else None]


def iso_date(value: str) -> str:
    return datetime.strptime(value, "%B %d, %Y").date().isoformat()


def normalized_venue(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    return value.replace(": ", " • ")


def parse_schedule(text: str) -> dict[str, dict]:
    found: dict[str, dict] = {}
    for label in LABEL_TO_STOP:
        pattern = re.compile(
            re.escape(label)
            + r"\s*(?:\(([^)]*)\))?\s*:\s*"
            + r"([A-Z][a-z]+ \d{1,2}, \d{4})\s*[–—-]\s*([A-Z][a-z]+ \d{1,2}, \d{4})"
        )
        match = pattern.search(text)
        if match:
            venue, start, end = match.groups()
            found[label] = {
                "venue": normalized_venue(venue or "") or None,
                "available_from": iso_date(start),
                "available_until": iso_date(end),
                "announced": True,
            }
            continue

        tba_pattern = re.compile(
            re.escape(label) + r"\s*:\s*(?:Location and dates|Location|Dates).*?(?:future update|announced)",
            re.I,
        )
        if tba_pattern.search(text):
            found[label] = {
                "venue": None,
                "available_from": None,
                "available_until": None,
                "announced": False,
            }

    missing = [label for label in LABEL_TO_STOP if label not in found]
    if missing:
        raise RuntimeError("Não foi possível interpretar cidades oficiais: " + ", ".join(missing))
    return found


def main() -> int:
    official = parse_schedule(fetch_official_text())
    stamps_doc = json.loads(STAMPS_FILE.read_text(encoding="utf-8"))
    rally = next((item for item in stamps_doc.get("rallies", []) if item.get("id") == RALLY_ID), None)
    if not rally:
        raise RuntimeError(f"Rally {RALLY_ID} não encontrado em stamps.json")

    payload = deepcopy(rally)
    payload["source"] = {
        "name": "Pokémon GO",
        "url": OFFICIAL_URL,
        "confidence": "official",
    }

    changed = False
    stop_by_id = {stop.get("id"): stop for stop in payload.get("stops", [])}
    for label, stop_id in LABEL_TO_STOP.items():
        stop = stop_by_id.get(stop_id)
        if not stop:
            raise RuntimeError(f"Stop esperada ausente: {stop_id}")
        info = official[label]
        new_venue = info["venue"] or "Local a confirmar"
        for key, value in (
            ("venue", new_venue),
            ("available_from", info["available_from"]),
            ("available_until", info["available_until"]),
        ):
            if stop.get(key) != value:
                stop[key] = value
                changed = True

    if not changed:
        print("Stamp Rally oficial sem mudanças.")
        return 0

    candidate = {
        "schema_version": "spidey-app-candidate-v1",
        "candidate_id": "official-pokexciting-cross-region",
        "kind": "stamp_rally",
        "status": "ready",
        "auto_publish": True,
        "validation": {
            "source_verified": True,
            "facts_complete": True,
            "cross_checked": False,
            "official_page_parsed": True,
        },
        "payload": payload,
    }

    if READY_FILE.exists():
        current = json.loads(READY_FILE.read_text(encoding="utf-8"))
        if current.get("payload") == payload and current.get("status") in {"ready", "published_to_app"}:
            print("Mudança oficial já está enfileirada/publicada.")
            return 0

    READY_FILE.parent.mkdir(parents=True, exist_ok=True)
    READY_FILE.write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Atualização oficial de Stamp Rally criada em queue/app-ready.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
