from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS_FILE = ROOT / "spidey-app" / "data" / "events.json"
GENERATED_DIR = ROOT / "spidey-app" / "assets" / "events" / "generated"

LIMITS = {
    "thumb": (480, 600),
    "card": (720, 900),
    "weekly": (720, 900),
    "hero": (800, 1200),
    "poster": (800, 1200),
}

ROLE_ORDER = {
    "thumb": ("thumb", "card", "hero", "poster"),
    "card": ("card", "thumb", "hero", "poster"),
    "weekly": ("card", "thumb", "hero", "poster"),
    "hero": ("hero", "poster", "card"),
    "poster": ("poster", "hero"),
}


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9._-]+", "-", value)
    return value.strip("-") or "evento"


def generated_asset(event: dict) -> dict | None:
    event_id = str(event.get("id") or "").strip()
    if not event_id:
        return None
    filename = f"{slugify(event_id)}.svg"
    path = GENERATED_DIR / filename
    if not path.exists():
        return None
    return {
        "url": f"assets/events/generated/{filename}",
        "width": 1080,
        "height": 1620,
        "sha256": "",
        "source_role": "generated_vector",
    }


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def normalize(raw, art: dict, source_role: str) -> dict | None:
    if not raw:
        return None
    if isinstance(raw, str):
        return {
            "url": raw,
            "width": int(art.get(f"{source_role}_width") or art.get("web_width") or art.get("width") or 0),
            "height": int(art.get(f"{source_role}_height") or art.get("web_height") or art.get("height") or 0),
            "sha256": art.get(f"{source_role}_sha256") or art.get("web_sha256") or art.get("sha256") or "",
            "source_role": source_role,
        }
    if not isinstance(raw, dict):
        return None
    return {
        "url": raw.get("url") or raw.get("src") or "",
        "width": int(raw.get("width") or 0),
        "height": int(raw.get("height") or 0),
        "sha256": raw.get("sha256") or raw.get("web_sha256") or "",
        "source_role": source_role,
    }


def usable(asset: dict | None, role: str) -> bool:
    if not asset:
        return False
    url = str(asset.get("url") or "").strip()
    if not url or url.lower().startswith("data:") or ".b64" in url.lower() or "spidey-logo-oficial" in url.lower():
        return False
    width, height = int(asset.get("width") or 0), int(asset.get("height") or 0)
    min_width, min_height = LIMITS[role]
    if width < min_width or height < min_height:
        return False
    if role in {"hero", "poster"} and height <= width:
        return False
    return True


def resolve(event: dict, role: str) -> dict | None:
    art = event.get("art") or {}
    assets = art.get("assets") or {}
    seen: set[tuple] = set()
    candidates: list[dict] = []
    for candidate_role in ROLE_ORDER[role]:
        for raw in (assets.get(candidate_role), art.get(candidate_role)):
            item = normalize(raw, art, candidate_role)
            if item:
                candidates.append(item)
    if art.get("url"):
        candidates.append({
            "url": art.get("url"),
            "width": int(art.get("web_width") or art.get("width") or 0),
            "height": int(art.get("web_height") or art.get("height") or 0),
            "sha256": art.get("web_sha256") or art.get("sha256") or "",
            "source_role": "legacy",
        })
    generated = generated_asset(event)
    if generated:
        candidates.append(generated)
    for candidate in candidates:
        key = (candidate["url"], candidate["width"], candidate["height"])
        if key in seen:
            continue
        seen.add(key)
        if usable(candidate, role):
            return candidate
    return None


def overlaps_sep_oct_2026(event: dict) -> bool:
    schedule = event.get("schedule") or {}
    start = parse_dt(schedule.get("start_brazil") or schedule.get("start_local"))
    end = parse_dt(schedule.get("end_brazil") or schedule.get("end_local"))
    if not start or not end:
        return False
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    window_start = datetime(2026, 9, 1, tzinfo=start.tzinfo)
    window_end = datetime(2026, 10, 31, 23, 59, 59, tzinfo=start.tzinfo)
    return start <= window_end and end >= window_start


def build_report() -> dict:
    doc = json.loads(EVENTS_FILE.read_text(encoding="utf-8"))
    published = [event for event in doc.get("events", []) if event.get("status") == "published"]
    scope = [event for event in published if overlaps_sep_oct_2026(event)]

    def coverage(events: list[dict]) -> dict:
        result = {role: 0 for role in LIMITS}
        premium = {role: 0 for role in LIMITS}
        generated = {role: 0 for role in LIMITS}
        missing = []
        for event in events:
            assets = {role: resolve(event, role) for role in LIMITS}
            for role, asset in assets.items():
                ok = bool(asset)
                result[role] += int(ok)
                if asset:
                    if asset.get("source_role") == "generated_vector":
                        generated[role] += 1
                    else:
                        premium[role] += 1
            if not assets["hero"] or not assets["weekly"]:
                missing.append({
                    "id": event.get("id"),
                    "title": event.get("title"),
                    "category": event.get("category"),
                    "hero_ready": bool(assets["hero"]),
                    "weekly_ready": bool(assets["weekly"]),
                })
        return {
            "total": len(events),
            "ready": result,
            "premium_or_source_art": premium,
            "generated_vector": generated,
            "needs_art": missing,
        }

    festival = next((event for event in published if event.get("slug") == "festival-das-luzes-2026-india"), None)
    festival_hero = resolve(festival, "hero") if festival else None
    return {
        "schema_version": "spidey-art-audit-v2",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "all_published": coverage(published),
        "sep_oct_2026": coverage(scope),
        "festival_hero_ready": bool(festival_hero and festival_hero.get("source_role") != "generated_vector"),
        "rules": {
            "logo_is_event_art": False,
            "data_uri_allowed": False,
            "generated_vector_is_premium": False,
            "hero_minimum": "800x1200 vertical",
            "weekly_minimum": "720x900",
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="reports/art-audit.json")
    args = parser.parse_args()
    report = build_report()
    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    scope = report["sep_oct_2026"]
    print(json.dumps({
        "published": report["all_published"]["total"],
        "sep_oct": scope["total"],
        "sep_oct_hero_ready": scope["ready"]["hero"],
        "sep_oct_weekly_ready": scope["ready"]["weekly"],
        "sep_oct_premium_hero": scope["premium_or_source_art"]["hero"],
        "sep_oct_generated_hero": scope["generated_vector"]["hero"],
        "sep_oct_needs_art": len(scope["needs_art"]),
        "festival_hero_ready": report["festival_hero_ready"],
    }, ensure_ascii=False))
    if not report["festival_hero_ready"]:
        raise SystemExit("Festival das Luzes deixou de atender o gate de hero art real")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
