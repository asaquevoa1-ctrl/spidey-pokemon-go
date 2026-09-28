from __future__ import annotations

import json
import os
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
EVENTS_FILE = ROOT / "spidey-app" / "data" / "events.json"
STAMPS_FILE = ROOT / "spidey-app" / "data" / "stamps.json"
WEEKLY_DIR = ROOT / "weekly"
CURRENT_FILE = WEEKLY_DIR / "current.json"
ARCHIVE_DIR = WEEKLY_DIR / "archive"
BR = ZoneInfo("America/Sao_Paulo")

CATEGORY_GROUPS = {
    "raid_hour": "raids",
    "raid_rotation": "raids",
    "mega_raid_rotation": "raids",
    "mega_raid": "raids",
    "shadow_raid": "raids",
    "shadow_raids": "raids",
    "max_monday": "max_pvp",
    "max_battle": "max_pvp",
    "gmax": "max_pvp",
    "gbl": "max_pvp",
    "go_battle_league": "max_pvp",
    "league_rotation": "max_pvp",
    "spotlight_hour": "daily",
    "showcase": "daily",
    "daily_discovery": "daily",
    "daily_discoveries": "daily",
    "community_day": "featured",
    "go_fest": "featured",
    "raid_day": "featured",
    "hatch_day": "featured",
    "catch_mastery": "featured",
    "evento_especial": "featured",
    "timed_research": "featured",
}

REGIONAL_MARKERS = {
    "regional", "local", "city_safari", "in_person", "presencial", "exclusivo",
    "exclusive", "stamp", "museum", "mall", "collab", "observatory", "poképark",
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=BR)
    return dt.astimezone(BR)


def event_range(event: dict) -> tuple[datetime | None, datetime | None]:
    schedule = event.get("schedule") or {}
    return parse_dt(schedule.get("start_brazil") or schedule.get("start_local")), parse_dt(schedule.get("end_brazil") or schedule.get("end_local"))


def clean_event(event: dict) -> dict:
    start, end = event_range(event)
    return {
        "id": event.get("id"),
        "title": event.get("title"),
        "summary": event.get("summary") or "",
        "category": event.get("category") or "evento",
        "tags": event.get("tags") or [],
        "start_brazil": start.isoformat() if start else None,
        "end_brazil": end.isoformat() if end else None,
        "source": event.get("source") or {},
        "art": event.get("art") or {},
    }


def is_regional(event: dict) -> bool:
    hay = " ".join([
        str(event.get("category") or ""),
        str(event.get("title") or ""),
        str(event.get("summary") or ""),
        " ".join(map(str, event.get("tags") or [])),
    ]).lower()
    return any(marker in hay for marker in REGIONAL_MARKERS)


def group_for(event: dict) -> str:
    if is_regional(event):
        return "also_happening"
    return CATEGORY_GROUPS.get(str(event.get("category") or "").lower(), "featured")


def overlaps(start: datetime, end: datetime, window_start: datetime, window_end: datetime) -> bool:
    return start <= window_end and end >= window_start


def day_window(day: date) -> tuple[datetime, datetime]:
    start = datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=BR)
    return start, start + timedelta(days=1) - timedelta(microseconds=1)


def monday_for(anchor: date) -> date:
    return anchor - timedelta(days=anchor.weekday())


def score(event: dict) -> tuple[int, datetime]:
    category = str(event.get("category") or "")
    priorities = {
        "go_fest": 0, "community_day": 1, "raid_day": 2, "hatch_day": 3,
        "evento_especial": 4, "timed_research": 5, "catch_mastery": 6,
        "raid_hour": 7, "spotlight_hour": 8, "max_monday": 9,
        "raid_rotation": 10, "mega_raid_rotation": 11, "shadow_raids": 12,
        "gbl": 13, "go_battle_league": 13,
    }
    start, _ = event_range(event)
    return priorities.get(category, 50), start or datetime.max.replace(tzinfo=BR)


def build(anchor: date) -> dict:
    week_start = monday_for(anchor)
    week_end = week_start + timedelta(days=6)
    start_dt, _ = day_window(week_start)
    _, end_dt = day_window(week_end)

    events_doc = load(EVENTS_FILE)
    events = []
    for event in events_doc.get("events", []):
        if event.get("status") not in (None, "published"):
            continue
        if (event.get("calendar") or {}).get("mode") == "hidden":
            continue
        start, end = event_range(event)
        if not start or not end or not overlaps(start, end, start_dt, end_dt):
            continue
        events.append(event)

    events.sort(key=score)
    sections = {"featured": [], "raids": [], "max_pvp": [], "also_happening": []}
    for event in events:
        group = group_for(event)
        if group == "daily":
            continue
        sections[group].append(clean_event(event))

    days = []
    for offset in range(7):
        day = week_start + timedelta(days=offset)
        d_start, d_end = day_window(day)
        active = []
        for event in events:
            start, end = event_range(event)
            if start and end and overlaps(start, end, d_start, d_end):
                group = group_for(event)
                # No card diário: itens de grande duração/rotações ficam nos blocos próprios.
                if group in {"daily", "featured"} and (end - start) <= timedelta(days=2):
                    active.append(clean_event(event))
        active.sort(key=lambda item: item.get("start_brazil") or "")
        days.append({"date": day.isoformat(), "weekday": day.strftime("%A").lower(), "items": active[:5]})

    stamps = []
    if STAMPS_FILE.exists():
        for rally in load(STAMPS_FILE).get("rallies", []):
            if rally.get("status") != "published":
                continue
            stamps.append({
                "id": rally.get("id"),
                "title": rally.get("title"),
                "summary": rally.get("summary") or "",
                "stamp_count": rally.get("stamp_count") or len(rally.get("stops") or []),
                "source": rally.get("source") or {},
            })

    # Evita uma arte semanal ilegível. Dados completos continuam no calendário.
    sections["featured"] = sections["featured"][:8]
    sections["raids"] = sections["raids"][:10]
    sections["max_pvp"] = sections["max_pvp"][:8]
    sections["also_happening"] = sections["also_happening"][:12]

    return {
        "schema_version": "spidey-weekly-v1",
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "timezone": "America/Sao_Paulo",
        "title": f"Spidey Weekly • {week_start.strftime('%d/%m')} a {week_end.strftime('%d/%m')}",
        "visual_standard": "spidey-weekly-premium-v1",
        "status": "ready_for_art",
        "days": days,
        "sections": sections,
        "stamps": stamps[:8],
        "meta": {
            "calendar_events_in_week": len(events),
            "generated_at": datetime.now(BR).isoformat(),
            "source": "spidey-app/data/events.json + stamps.json",
        },
    }


def main() -> int:
    override = os.getenv("SPIDEY_WEEKLY_DATE", "").strip()
    anchor = date.fromisoformat(override) if override else datetime.now(BR).date()
    payload = build(anchor)
    save(CURRENT_FILE, payload)
    save(ARCHIVE_DIR / f"{payload['week_start']}.json", payload)
    print(json.dumps({
        "week": f"{payload['week_start']}..{payload['week_end']}",
        "events": payload["meta"]["calendar_events_in_week"],
        "featured": len(payload["sections"]["featured"]),
        "raids": len(payload["sections"]["raids"]),
        "max_pvp": len(payload["sections"]["max_pvp"]),
        "also_happening": len(payload["sections"]["also_happening"]),
        "stamps": len(payload["stamps"]),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
