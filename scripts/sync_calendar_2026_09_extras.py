from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from scripts.app_auto_publish_v2 import EVENTS_FILE, load_json, save_json, upsert, validate_event

BR = ZoneInfo("America/Sao_Paulo")
DAILY_SOURCE = {
    "name": "Twilight Trails • Daily Discoveries",
    "url": "https://leekduck.com/events/season-24-twilight-trails/",
    "confidence": "verified",
}
CANDIDATE = {
    "validation": {
        "source_verified": True,
        "cross_checked": True,
        "facts_complete": True,
        "schedule_verified": True,
        "art_verified": False,
    }
}


def iso_pair(local_tz: str, start: str, end: str):
    tz = ZoneInfo(local_tz)
    s = datetime.fromisoformat(start).replace(tzinfo=tz)
    e = datetime.fromisoformat(end).replace(tzinfo=tz)
    return s.isoformat(), e.isoformat(), s.astimezone(BR).isoformat(), e.astimezone(BR).isoformat()


def event(event_id, title, local_tz, start, end, category, tags, summary, source, mode="span", notes=None):
    sl, el, sb, eb = iso_pair(local_tz, start, end)
    return {
        "id": event_id,
        "slug": event_id,
        "title": title,
        "summary": summary,
        "category": category,
        "tags": tags[:3],
        "source": source,
        "schedule": {
            "local_timezone": local_tz,
            "start_local": sl,
            "end_local": el,
            "brazil_timezone": "America/Sao_Paulo",
            "start_brazil": sb,
            "end_brazil": eb,
        },
        "calendar": {"mode": mode},
        "presentation": {"requires_art": False, "fallback_visual": "spidey-logo"},
        "locations": [],
        "gpx": {"enabled": False, "reason": "Sem coordenada exata necessária para este item de calendário."},
        "notes": notes or [],
        "notifications": {"enabled": False, "default_lead_minutes": []},
    }


def build_events():
    items = []

    for day in (13, 20, 27):
        items.append(event(
            f"2026-09-{day:02d}-scenic-sunday", "Descoberta Diária: Domingo Pitoresco",
            "America/Sao_Paulo", f"2026-09-{day:02d}T00:00:00", f"2026-09-{day:02d}T23:59:59",
            "daily_discovery", ["Domingo Pitoresco", "Rotas", "Twilight Trails"],
            "Mais Pokémon na natureza e em Rotas, bônus de companheiro e mais encontros com Mateo.", DAILY_SOURCE,
        ))

    for day in (8, 15, 22, 29):
        items.append(event(
            f"2026-09-{day:02d}-showcase-tuesday", "Descoberta Diária: Terça de Vitrine",
            "America/Sao_Paulo", f"2026-09-{day:02d}T00:00:00", f"2026-09-{day:02d}T23:59:59",
            "daily_discovery", ["Vitrines", "PokéStop", "Twilight Trails"],
            "Até cinco Vitrines de Poképarada e mais PokéStops com Vitrines disponíveis.", DAILY_SOURCE,
        ))

    for day in (10, 17, 24):
        items.append(event(
            f"2026-09-{day:02d}-go-battle-thursday", "Descoberta Diária: Quinta de Batalhas GO",
            "America/Sao_Paulo", f"2026-09-{day:02d}T00:00:00", f"2026-09-{day:02d}T23:59:59",
            "daily_discovery", ["GO Battle", "PvP", "Twilight Trails"],
            "Até 10 séries no dia (50 batalhas) e bônus de Poeira Estelar em recompensas de vitória.", {
                "name": "Pokémon GO",
                "url": "https://pokemongo.com/news/go-battle-league-twilight-trails",
                "confidence": "official",
            },
        ))

    for day in (11, 18, 25):
        items.append(event(
            f"2026-09-{day:02d}-friendship-friday", "Descoberta Diária: Sexta da Amizade",
            "America/Sao_Paulo", f"2026-09-{day:02d}T00:00:00", f"2026-09-{day:02d}T23:59:59",
            "daily_discovery", ["Amizade", "Trocas", "Twilight Trails"],
            "Trocas especiais adicionais, menor custo de Poeira Estelar, maior chance de Lucky Trade e Candy XL em trocas presenciais.", DAILY_SOURCE,
        ))

    city_safaris = [
        ("brisbane", "Pokémon GO City Safari: Brisbane", "Australia/Brisbane", "Austrália", "https://pokemongo.com/featured-in-person-events/citysafari/brisbane"),
        ("lisbon", "Pokémon GO City Safari: Lisboa", "Europe/Lisbon", "Portugal", "https://pokemongo.com/featured-in-person-events/citysafari/lisbon"),
        ("marseille", "Pokémon GO City Safari: Marselha", "Europe/Paris", "França", "https://pokemongo.com/featured-in-person-events/citysafari/marseille"),
        ("munich", "Pokémon GO City Safari: Munique", "Europe/Berlin", "Alemanha", "https://pokemongo.com/featured-in-person-events/citysafari/munich"),
        ("rio", "Pokémon GO City Safari: Rio de Janeiro", "America/Sao_Paulo", "Brasil", "https://pokemongo.com/featured-in-person-events/citysafari/rio-de-janeiro"),
    ]
    for slug, title, tz, country, url in city_safaris:
        items.append(event(
            f"2026-09-city-safari-{slug}", title, tz,
            "2026-09-26T10:00:00", "2026-09-27T18:00:00",
            "city_safari", ["City Safari", country, "Presencial"],
            "Evento presencial City Safari nos dias 26 e 27 de setembro, das 10h às 18h em cada dia.",
            {"name": "Pokémon GO", "url": url, "confidence": "official"},
            notes=["A faixa no detalhe cobre os dois dias; a janela jogável diária é das 10h às 18h."],
        ))

    items.append(event(
        "2026-09-iit-delhi-rendezvous", "Pokémon GO no Rendezvous 2026 • IIT Delhi",
        "Asia/Kolkata", "2026-09-28T10:00:00", "2026-10-01T20:00:00",
        "regional_event", ["Índia", "IIT Delhi", "Regional"],
        "Evento oficial no IIT Delhi com bônus, encontros, reides, Collection Challenge e Pesquisa temporária.",
        {"name": "Pokémon GO", "url": "https://pokemongo.com/news/pokemongo-iitdelhi-2026", "confidence": "official"},
    ))

    return items


def main():
    items = build_events()
    errors = []
    for item in items:
        errors.extend(f"{item['id']}: {err}" for err in validate_event(item, CANDIDATE))
    if errors:
        raise RuntimeError("\n".join(errors))

    doc = load_json(EVENTS_FILE)
    events = doc.setdefault("events", [])
    changed = False
    for item in items:
        changed = upsert(events, item) or changed
    if changed:
        save_json(EVENTS_FILE, doc)
    print(f"setembro_extras={len(items)} changed={changed}")


if __name__ == "__main__":
    main()
