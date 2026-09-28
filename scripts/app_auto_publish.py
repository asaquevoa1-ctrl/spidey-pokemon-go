from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
READY_DIR = ROOT / "queue" / "app-ready"
EVENTS_FILE = ROOT / "spidey-app" / "data" / "events.json"
STAMPS_FILE = ROOT / "spidey-app" / "data" / "stamps.json"

EXACT_COORD_TYPES = {"exact_pokestop", "exact_venue", "event_site"}
TRUSTED_SOURCE_LEVELS = {"official", "verified"}
SHA256_RE = re.compile(r"^[0-9a-fA-F]{64}$")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def valid_timezone(name: str | None) -> bool:
    if not name:
        return False
    try:
        ZoneInfo(name)
        return True
    except Exception:
        return False


def valid_coordinate_pair(latitude, longitude) -> bool:
    if latitude is None or longitude is None or latitude == "" or longitude == "":
        return False
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (TypeError, ValueError):
        return False
    return -90 <= lat <= 90 and -180 <= lon <= 180


def validate_source(source: dict, validation: dict, errors: list[str]) -> None:
    if not isinstance(source, dict):
        errors.append("source ausente")
        return
    if not str(source.get("name") or "").strip():
        errors.append("source.name ausente")
    url = str(source.get("url") or "")
    if not url.startswith("https://"):
        errors.append("source.url precisa ser HTTPS")
    confidence = str(source.get("confidence") or "").lower()
    if confidence not in TRUSTED_SOURCE_LEVELS:
        errors.append("source.confidence precisa ser official ou verified")
    if validation.get("source_verified") is not True:
        errors.append("validation.source_verified != true")
    if confidence == "verified" and validation.get("cross_checked") is not True:
        errors.append("fonte secondary/verified exige validation.cross_checked=true")


def validate_art(art: dict, validation: dict, errors: list[str]) -> None:
    if not isinstance(art, dict):
        errors.append("arte ausente")
        return
    if validation.get("art_verified") is not True:
        errors.append("validation.art_verified != true")
    if art.get("standard") != "spidey-premium-v1":
        errors.append("arte fora do padrão spidey-premium-v1")
    try:
        width = int(art.get("web_width") or art.get("width") or 0)
        height = int(art.get("web_height") or art.get("height") or 0)
    except (TypeError, ValueError):
        width = height = 0
    if width < 800 or height < 1200 or height <= width:
        errors.append("arte precisa ser retrato e ter no mínimo 800x1200")
    url = str(art.get("url") or "")
    if not (url.startswith("assets/") or url.startswith("https://")):
        errors.append("art.url inválida")
    sha = str(art.get("web_sha256") or art.get("sha256") or "")
    if not SHA256_RE.fullmatch(sha):
        errors.append("SHA-256 da arte ausente ou inválido")


def validate_event(payload: dict, candidate: dict) -> list[str]:
    errors: list[str] = []
    validation = candidate.get("validation") or {}

    for key in ("id", "slug", "title"):
        if not str(payload.get(key) or "").strip():
            errors.append(f"event.{key} ausente")

    validate_source(payload.get("source") or {}, validation, errors)

    if validation.get("facts_complete") is not True:
        errors.append("validation.facts_complete != true")
    if validation.get("schedule_verified") is not True:
        errors.append("validation.schedule_verified != true")

    schedule = payload.get("schedule") or {}
    local_start = parse_iso(schedule.get("start_local"))
    local_end = parse_iso(schedule.get("end_local"))
    br_start = parse_iso(schedule.get("start_brazil"))
    br_end = parse_iso(schedule.get("end_brazil"))
    if not all((local_start, local_end, br_start, br_end)):
        errors.append("horários local/Brasil precisam ser ISO válidos")
    else:
        if local_start >= local_end:
            errors.append("start_local precisa ser anterior a end_local")
        if br_start >= br_end:
            errors.append("start_brazil precisa ser anterior a end_brazil")
    if not valid_timezone(schedule.get("local_timezone")):
        errors.append("local_timezone inválido")
    if not valid_timezone(schedule.get("brazil_timezone")):
        errors.append("brazil_timezone inválido")

    locations = payload.get("locations") or []
    for idx, loc in enumerate(locations):
        lat = loc.get("latitude")
        lon = loc.get("longitude")
        has_any = lat not in (None, "") or lon not in (None, "")
        if has_any and not valid_coordinate_pair(lat, lon):
            errors.append(f"locations[{idx}] latitude/longitude inválidas")

    gpx = payload.get("gpx") or {}
    if gpx.get("enabled") is True:
        exact = [loc for loc in locations if valid_coordinate_pair(loc.get("latitude"), loc.get("longitude")) and loc.get("coordinate_type") in EXACT_COORD_TYPES]
        if not exact:
            errors.append("GPX habilitado sem coordenada exata confirmada")

    validate_art(payload.get("art") or {}, validation, errors)
    return errors


def validate_stamp(payload: dict, candidate: dict) -> list[str]:
    errors: list[str] = []
    validation = candidate.get("validation") or {}

    for key in ("id", "slug", "title"):
        if not str(payload.get(key) or "").strip():
            errors.append(f"stamp.{key} ausente")

    validate_source(payload.get("source") or {}, validation, errors)
    if validation.get("facts_complete") is not True:
        errors.append("validation.facts_complete != true")

    stops = payload.get("stops") or []
    if not stops:
        errors.append("Stamp Rally sem stops")

    seen = set()
    for idx, stop in enumerate(stops):
        stop_id = str(stop.get("id") or "")
        if not stop_id:
            errors.append(f"stops[{idx}].id ausente")
        elif stop_id in seen:
            errors.append(f"stop duplicada: {stop_id}")
        seen.add(stop_id)

        lat = stop.get("latitude")
        lon = stop.get("longitude")
        has_any = lat not in (None, "") or lon not in (None, "")
        if has_any and not valid_coordinate_pair(lat, lon):
            errors.append(f"stops[{idx}] latitude/longitude inválidas")

        ctype = stop.get("coordinate_type")
        confidence = str(stop.get("coordinate_confidence") or "").lower()
        if ctype == "exact_pokestop":
            if not valid_coordinate_pair(lat, lon):
                errors.append(f"stops[{idx}] exact_pokestop sem coordenada válida")
            if confidence in ("", "unconfirmed", "low"):
                errors.append(f"stops[{idx}] exact_pokestop sem confiança suficiente")
        if stop.get("gpx_enabled") is True and ctype != "exact_pokestop":
            errors.append(f"stops[{idx}] GPX só pode ser habilitado para exact_pokestop")
        if stop.get("gpx_enabled") is True and not valid_coordinate_pair(lat, lon):
            errors.append(f"stops[{idx}] GPX habilitado sem coordenada válida")

    return errors


def upsert(items: list[dict], payload: dict) -> bool:
    item_id = payload["id"]
    payload = dict(payload)
    payload["status"] = "published"
    for index, current in enumerate(items):
        if current.get("id") == item_id:
            if current == payload:
                return False
            items[index] = payload
            return True
    items.append(payload)
    return True


def main() -> int:
    events_doc = load_json(EVENTS_FILE)
    stamps_doc = load_json(STAMPS_FILE)
    events = events_doc.setdefault("events", [])
    rallies = stamps_doc.setdefault("rallies", [])

    published = 0
    review = 0
    changed_events = False
    changed_stamps = False

    for path in sorted(READY_DIR.glob("*.json")):
        candidate = load_json(path)
        if candidate.get("schema_version") != "spidey-app-candidate-v1":
            continue
        if candidate.get("status") != "ready":
            continue

        errors: list[str] = []
        if candidate.get("auto_publish") is not True:
            errors.append("auto_publish != true")

        kind = candidate.get("kind")
        payload = candidate.get("payload") or {}
        if kind == "event":
            errors.extend(validate_event(payload, candidate))
        elif kind == "stamp_rally":
            errors.extend(validate_stamp(payload, candidate))
        else:
            errors.append("kind precisa ser event ou stamp_rally")

        if errors:
            candidate["status"] = "review_required"
            candidate["review_reasons"] = sorted(set(errors))
            candidate["review_required_at_utc"] = datetime.now(timezone.utc).isoformat()
            save_json(path, candidate)
            review += 1
            continue

        if kind == "event":
            changed_events = upsert(events, payload) or changed_events
        else:
            changed_stamps = upsert(rallies, payload) or changed_stamps

        candidate["status"] = "published_to_app"
        candidate["published_at_utc"] = datetime.now(timezone.utc).isoformat()
        candidate["app_item_id"] = payload.get("id")
        candidate.pop("review_reasons", None)
        save_json(path, candidate)
        published += 1

    if changed_events:
        save_json(EVENTS_FILE, events_doc)
    if changed_stamps:
        save_json(STAMPS_FILE, stamps_doc)

    print(json.dumps({"published": published, "review_required": review, "events_changed": changed_events, "stamps_changed": changed_stamps}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
