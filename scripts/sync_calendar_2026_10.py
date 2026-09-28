from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from scripts.app_auto_publish_v2 import EVENTS_FILE, load_json, save_json, upsert, validate_event

BR = ZoneInfo("America/Sao_Paulo")
HUB = {
    "name": "Pokémon GO Hub • calendário outubro 2026",
    "url": "https://pokemongohub.net/post/event/october-2026-events/",
    "confidence": "verified",
}
DAILY_SOURCE = {
    "name": "Twilight Trails • Daily Discoveries",
    "url": "https://leekduck.com/events/season-24-twilight-trails/",
    "confidence": "verified",
}
GBL = {
    "name": "Pokémon GO",
    "url": "https://pokemongo.com/news/go-battle-league-twilight-trails",
    "confidence": "official",
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


def event(event_id, title, start, end, category, tags, summary, source=None, mode="span", local_tz="America/Sao_Paulo", notes=None, notify=True):
    sl, el, sb, eb = iso_pair(local_tz, start, end)
    return {
        "id": event_id,
        "slug": event_id,
        "title": title,
        "summary": summary,
        "category": category,
        "tags": tags[:3],
        "source": dict(source or HUB),
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
        "gpx": {"enabled": False, "reason": "Evento sem coordenada exata específica confirmada."},
        "notes": notes or [],
        "notifications": {"enabled": notify, "default_lead_minutes": [60] if notify else []},
    }


def official(url):
    return {"name": "Pokémon GO", "url": url, "confidence": "official"}


def build_events():
    items = [
        event(
            "2026-10-harvest-taken-over", "Festival da Colheita: A Invasão",
            "2026-10-02T00:00:00", "2026-10-05T20:00:00", "team_go_rocket",
            ["Team GO Rocket", "Zekrom Sombroso", "Global"],
            "Invasão da Equipe GO Rocket durante o Festival da Colheita, com Zekrom Sombroso e remoção de Frustração.",
            official("https://pokemongo.com/pt-BR/news/harvest-festival-tgr-2026"),
        ),
        event(
            "2026-10-patterns-of-the-wild-indonesia", "Patterns of the Wild • Indonésia",
            "2026-10-02T10:00:00", "2026-10-02T20:00:00", "regional_event",
            ["Indonésia", "Pikachu Batik", "Regional"],
            "Evento regional na Indonésia com Pikachu usando camisa batik e Fundo Especial.",
            official("https://pokemongo.com/news/patterns-of-the-wild-2026"),
            local_tz="Asia/Jakarta",
        ),
        event(
            "2026-10-gigantamax-cinderace-max-day", "Dia de Batalhas Max: Cinderace Gigamax",
            "2026-10-03T14:00:00", "2026-10-03T17:00:00", "max_battle_day",
            ["Cinderace", "Gigamax", "Max Battle Day"],
            "Cinderace Gigamax em Batalhas Max de seis estrelas, com estreia do Brilhante.",
            official("https://pokemongo.com/news/gigantamax-cinderace-max-battle-day-2026"),
        ),
        event(
            "2026-10-world-space-week", "Semana Mundial do Espaço 2026",
            "2026-10-04T00:00:00", "2026-10-10T23:59:59", "evento_especial",
            ["Astronaut Pikachu", "Space Week", "Global"],
            "Semana Mundial do Espaço com estreia do Pikachu Astronauta em reides e Pesquisa temporária.",
            official("https://pokemongo.com/en/news/world-space-week-2026"),
        ),
        event(
            "2026-10-go-pass", "GO Pass: Outubro",
            "2026-10-06T10:00:00", "2026-11-03T10:00:00", "go_pass",
            ["GO Pass", "Kyogre", "Global"],
            "GO Pass de outubro com Kyogre e retorno do Globo da Sorte no Passe Deluxe.",
            official("https://pokemongo.com/news/go-pass-october-2026"), mode="hidden",
        ),
        event(
            "2026-10-zorua-community-day", "Dia Comunitário: Zorua",
            "2026-10-10T14:00:00", "2026-10-10T17:00:00", "community_day",
            ["Zorua", "Community Day", "Global"],
            "Zorua em destaque no Dia Comunitário de outubro, com Soco Enganador para Zoroark ao evoluir.",
            official("https://pokemongo.com/pt-BR/news/communityday-october-2026-zorua"),
        ),
        event(
            "2026-10-fall-marathon-buddy-trek", "Maratona das Folhas: Caminhada Companheira",
            "2026-10-13T10:00:00", "2026-10-19T20:00:00", "evento_especial",
            ["Bramblin", "Buddy", "Global"],
            "Evento com estreia de Bramblin e progressão do GO Pass temático.",
            official("https://pokemongo.com/news/fall-marathon-buddy-trek-2026"),
        ),
        event(
            "2026-10-sandile-hatch-day", "Dia de Chocar: Sandile",
            "2026-10-17T11:00:00", "2026-10-17T17:00:00", "hatch_day",
            ["Sandile", "Hatch Day", "Global"],
            "Sandile chocará com muito mais frequência em Ovos de 2 km, com chance aumentada de Brilhante.",
            official("https://pokemongo.com/news/sandile-hatch-day-2026"),
        ),
        event(
            "2026-10-dynamax-max-battle-day", "Dia de Batalhas Max: Dinamax",
            "2026-10-24T14:00:00", "2026-10-24T17:00:00", "max_battle_day",
            ["Dinamax", "Max Battle Day", "Global"],
            "Dia de Batalhas Max anunciado para 24 de outubro; o Pokémon em destaque ainda pode receber atualização oficial.",
            HUB, notes=["Data e janela confirmadas no calendário atual; detalhes do destaque ainda estão sujeitos a anúncio."],
        ),
        event(
            "2026-10-halloween-part-1", "Halloween 2026: Parte I",
            "2026-10-27T10:00:00", "2026-10-31T20:00:00", "halloween",
            ["Halloween", "Evento", "Global"],
            "Primeira parte do evento de Halloween 2026.", HUB,
            notes=["Detalhes de Pokémon e bônus ainda podem ser ampliados quando a página oficial específica for publicada."],
        ),
        event(
            "2026-10-super-mega-raid-day", "Dia de Super Megarreides",
            "2026-10-31T14:00:00", "2026-10-31T17:00:00", "raid_day",
            ["Super Mega", "Raid Day", "Global"],
            "Dia de Super Megarreides de Halloween; chefe em destaque ainda sujeito a anúncio oficial.", HUB,
            notes=["Data e janela confirmadas; o chefe pode ser atualizado automaticamente após anúncio."],
        ),
    ]

    spotlight = [
        (1, "Seedot", "2× PE por captura."),
        (8, "Elgyem", "2× Doces por captura."),
        (15, "Stufful", "2× Doces por transferência."),
        (22, "Morelull", "2× Poeira Estelar por captura."),
        (29, "Gastly", "2× PE por evolução."),
    ]
    for day, pokemon, bonus in spotlight:
        items.append(event(
            f"2026-10-{day:02d}-spotlight-{pokemon.lower()}", f"Spotlight Hour: {pokemon}",
            f"2026-10-{day:02d}T18:00:00", f"2026-10-{day:02d}T19:00:00", "spotlight_hour",
            ["Spotlight Hour", pokemon, "Global"], bonus, HUB,
        ))

    raid_hours = [
        (7, "Yveltal"), (14, "Dialga"), (21, "Palkia"), (28, "Giratina Forma Origem"),
    ]
    for day, pokemon in raid_hours:
        items.append(event(
            f"2026-10-{day:02d}-raid-hour-{pokemon.lower().replace(' ', '-')}", f"Raid Hour: {pokemon}",
            f"2026-10-{day:02d}T18:00:00", f"2026-10-{day:02d}T19:00:00", "raid_hour",
            ["Raid Hour", "5 estrelas", "Global"], f"{pokemon} em destaque na Hora de Reides.", HUB,
        ))

    max_mondays = [
        (5, "Sizzlipede"), (12, "Rookidee"), (19, "Sneasel"), (26, "Sableye"),
    ]
    for day, pokemon in max_mondays:
        items.append(event(
            f"2026-10-{day:02d}-max-monday-{pokemon.lower()}", f"Max Monday: Dynamax {pokemon}",
            f"2026-10-{day:02d}T06:00:00", f"2026-10-{day:02d}T21:00:00", "max_monday",
            ["Max Monday", "Dynamax", pokemon], f"{pokemon} Dynamax em destaque nos Power Spots durante a Segunda Max.", HUB,
        ))

    five_star = [
        ("yveltal", "Yveltal", "2026-10-07T06:00:00", "2026-10-13T22:00:00"),
        ("dialga", "Dialga", "2026-10-14T06:00:00", "2026-10-20T22:00:00"),
        ("palkia", "Palkia", "2026-10-21T06:00:00", "2026-10-27T22:00:00"),
        ("giratina-origin", "Giratina (Forma Origem)", "2026-10-28T06:00:00", "2026-11-03T22:00:00"),
    ]
    for slug, pokemon, start, end in five_star:
        items.append(event(
            f"2026-10-raids-{slug}", f"Reides 5★: {pokemon}", start, end, "raid_rotation",
            ["Reide 5★", "Rotação", pokemon], f"{pokemon} na rotação de Reides de cinco estrelas.", HUB, mode="start",
        ))

    mega = [
        ("blastoise", "Mega Blastoise", "2026-10-07T06:00:00", "2026-10-13T22:00:00"),
        ("dragonite", "Mega Dragonite", "2026-10-14T06:00:00", "2026-10-20T22:00:00"),
        ("charizard-xy", "Mega Charizard X e Y", "2026-10-21T06:00:00", "2026-10-27T22:00:00"),
        ("sableye", "Mega Sableye", "2026-10-28T06:00:00", "2026-11-03T22:00:00"),
    ]
    for slug, pokemon, start, end in mega:
        items.append(event(
            f"2026-10-mega-{slug}-raids", f"Mega Reides: {pokemon}", start, end, "mega_raid_rotation",
            ["Mega Reide", "Rotação", pokemon], f"{pokemon} na rotação de Mega Reides.", HUB, mode="start",
        ))

    gbl = [
        ("06-13", "Great Mega / Ultra Mega / Master Mega", "2026-10-06T17:00:00", "2026-10-13T17:00:00"),
        ("13-20", "Great / Ultra Mega / Little Cup", "2026-10-13T17:00:00", "2026-10-20T17:00:00"),
        ("20-27", "Ultra / Master Mega / Fantasy Cup", "2026-10-20T17:00:00", "2026-10-27T17:00:00"),
        ("27-1103", "Master / Mega Halloween Cup", "2026-10-27T17:00:00", "2026-11-03T18:00:00"),
    ]
    for slug, leagues, start, end in gbl:
        items.append(event(
            f"2026-10-gbl-{slug}", f"GO Battle League: {leagues}", start, end, "go_battle_league",
            ["GO Battle League", "PvP", "Twilight Trails"], f"Rotação da Liga de Batalha GO: {leagues}.", GBL, mode="start",
        ))

    shadow_weekends = [
        (3, 4, "Thundurus (Forma Encarnada)", "thundurus"),
        (10, 11, "Landorus (Forma Encarnada)", "landorus-10"),
        (17, 18, "Landorus (Forma Encarnada)", "landorus-17"),
        (24, 25, "Landorus (Forma Encarnada)", "landorus-24"),
        (31, 1, "Landorus (Forma Encarnada)", "landorus-31"),
    ]
    for start_day, end_day, pokemon, slug in shadow_weekends:
        end_month = 11 if start_day == 31 else 10
        end_date = f"2026-{end_month:02d}-{end_day:02d}T23:59:59"
        items.append(event(
            f"2026-10-shadow-{slug}", f"Shadow Raids: {pokemon}", f"2026-10-{start_day:02d}T00:00:00", end_date,
            "shadow_raids", ["Shadow Raid", pokemon, "Fim de semana"], f"{pokemon} Sombroso em Reides Sombrosas no fim de semana.", HUB,
        ))

    for day in (4, 11, 18, 25):
        items.append(event(
            f"2026-10-{day:02d}-scenic-sunday", "Descoberta Diária: Domingo Pitoresco",
            f"2026-10-{day:02d}T00:00:00", f"2026-10-{day:02d}T23:59:59", "daily_discovery",
            ["Domingo Pitoresco", "Rotas", "Twilight Trails"],
            "Mais Pokémon na natureza e em Rotas, bônus de companheiro e mais encontros com Mateo.", DAILY_SOURCE, notify=False,
        ))

    for day in (6, 13, 20, 27):
        items.append(event(
            f"2026-10-{day:02d}-showcase-tuesday", "Descoberta Diária: Terça de Vitrine",
            f"2026-10-{day:02d}T00:00:00", f"2026-10-{day:02d}T23:59:59", "daily_discovery",
            ["Vitrines", "PokéStop", "Twilight Trails"],
            "Até cinco Vitrines de Poképarada e mais PokéStops com Vitrines disponíveis.", DAILY_SOURCE, notify=False,
        ))

    for day in (1, 8, 15, 22, 29):
        items.append(event(
            f"2026-10-{day:02d}-go-battle-thursday", "Descoberta Diária: Quinta de Batalhas GO",
            f"2026-10-{day:02d}T00:00:00", f"2026-10-{day:02d}T23:59:59", "daily_discovery",
            ["GO Battle", "PvP", "Twilight Trails"],
            "Até 10 séries no dia (50 batalhas) e bônus de Poeira Estelar em recompensas de vitória.", GBL, notify=False,
        ))

    for day in (2, 9, 16, 23, 30):
        items.append(event(
            f"2026-10-{day:02d}-friendship-friday", "Descoberta Diária: Sexta da Amizade",
            f"2026-10-{day:02d}T00:00:00", f"2026-10-{day:02d}T23:59:59", "daily_discovery",
            ["Amizade", "Trocas", "Twilight Trails"],
            "Trocas especiais adicionais, menor custo de Poeira Estelar, maior chance de Lucky Trade e Candy XL em trocas presenciais.", DAILY_SOURCE, notify=False,
        ))

    return items


def main():
    items = build_events()
    ids = [item["id"] for item in items]
    if len(ids) != len(set(ids)):
        raise RuntimeError("IDs duplicados no calendário de outubro")

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
    print(f"outubro_2026={len(items)} changed={changed}")


if __name__ == "__main__":
    main()
