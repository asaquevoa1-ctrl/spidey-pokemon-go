from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
EVENTS_FILE = ROOT / "spidey-app" / "data" / "events.json"
OUT_FILE = ROOT / "notifications" / "queue.json"
BR = ZoneInfo("America/Sao_Paulo")
DEFAULT_LEADS = [60]
HORIZON_DAYS = 45


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


def clean_leads(value) -> list[int]:
    leads = value if isinstance(value, list) else DEFAULT_LEADS
    out = []
    for item in leads:
        try:
            minutes = int(item)
        except (TypeError, ValueError):
            continue
        if 0 <= minutes <= 10080 and minutes not in out:
            out.append(minutes)
    return sorted(out, reverse=True) or list(DEFAULT_LEADS)


def body_for(event: dict, lead: int) -> str:
    title = str(event.get("title") or "Evento Pokémon GO")
    if lead >= 1440:
        return f"{title} começa em cerca de {lead // 1440} dia(s)."
    if lead >= 60:
        hours = lead // 60
        return f"{title} começa em cerca de {hours} hora(s)."
    if lead > 0:
        return f"{title} começa em cerca de {lead} minuto(s)."
    return f"{title} está começando agora."


def build(now: datetime) -> dict:
    data = load(EVENTS_FILE)
    horizon = now + timedelta(days=HORIZON_DAYS)
    jobs = []

    for event in data.get("events", []):
        if event.get("status") != "published":
            continue
        notification = event.get("notifications") or {}
        if notification.get("enabled") is False:
            continue

        schedule = event.get("schedule") or {}
        start = parse_dt(schedule.get("start_brazil") or schedule.get("start_local"))
        if not start or start > horizon:
            continue

        leads = clean_leads(notification.get("default_lead_minutes"))
        for lead in leads:
            scheduled = start - timedelta(minutes=lead)
            # Mantém uma pequena janela passada para o futuro sender conseguir
            # recuperar um aviso caso uma execução atrase.
            if scheduled < now - timedelta(hours=6):
                continue
            jobs.append({
                "id": f"{event.get('id')}:start:{lead}",
                "event_id": event.get("id"),
                "event_title": event.get("title"),
                "category": event.get("category") or "evento",
                "scheduled_for": scheduled.isoformat(),
                "event_start": start.isoformat(),
                "lead_minutes": lead,
                "title": "Spidey Pokémon GO",
                "body": body_for(event, lead),
                "url": f"./?event={event.get('slug') or event.get('id')}",
                "status": "pending",
                "source": event.get("source") or {},
            })

    jobs.sort(key=lambda item: (item["scheduled_for"], item["event_id"], item["lead_minutes"]))
    return {
        "schema_version": "spidey-notification-queue-v1",
        "timezone": "America/Sao_Paulo",
        "horizon_days": HORIZON_DAYS,
        "jobs": jobs,
        "meta": {
            "pending_count": len(jobs),
            "delivery_backend": "web_push",
            "note": "Envio pelo dispatcher autenticado do app; adesão e permissões por aparelho.",
        },
    }


def main() -> int:
    now = datetime.now(BR).replace(minute=0, second=0, microsecond=0)
    payload = build(now)
    save(OUT_FILE, payload)
    print(json.dumps({"pending": payload["meta"]["pending_count"], "backend": payload["meta"]["delivery_backend"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
