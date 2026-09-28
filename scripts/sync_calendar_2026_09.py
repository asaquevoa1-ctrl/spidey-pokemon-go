from __future__ import annotations

from scripts.app_auto_publish_v2 import EVENTS_FILE, load_json, save_json, upsert, validate_event

BR = "America/Sao_Paulo"
VERIFIED = {
    "name": "Pokémon GO • calendário setembro 2026",
    "url": "https://pokemongohub.net/post/guide/september-2026-events/",
    "confidence": "verified",
}
GBL = {
    "name": "Pokémon GO",
    "url": "https://pokemongo.com/news/go-battle-league-twilight-trails",
    "confidence": "official",
}
GO_PASS = {
    "name": "Pokémon GO",
    "url": "https://pokemongo.com/pt-BR/news/go-pass-september-2026",
    "confidence": "official",
}
PHANTUMP = {
    "name": "Leek Duck • fonte oficial referenciada",
    "url": "https://leekduck.com/events/catch-mastery-phantump-2026/",
    "confidence": "verified",
}
HARVEST = {
    "name": "Leek Duck • fonte oficial referenciada",
    "url": "https://leekduck.com/events/harvest-festival-2026/",
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


def event(event_id, title, start, end, category, tags, summary, source=None, mode="span", notes=None):
    return {
        "id": event_id,
        "slug": event_id,
        "title": title,
        "summary": summary,
        "category": category,
        "tags": tags[:3],
        "source": dict(source or VERIFIED),
        "schedule": {
            "local_timezone": BR,
            "start_local": start,
            "end_local": end,
            "brazil_timezone": BR,
            "start_brazil": start,
            "end_brazil": end,
        },
        "calendar": {"mode": mode},
        "presentation": {"requires_art": False, "fallback_visual": "spidey-logo"},
        "locations": [],
        "gpx": {"enabled": False, "reason": "Evento sem coordenada específica confirmada."},
        "notes": notes or [],
        "notifications": {"enabled": True, "default_lead_minutes": [60]},
    }


def build_events():
    items = [
        event("2026-09-mega-ascension", "Mega Ascension", "2026-08-31T10:00:00-03:00", "2026-09-04T23:59:00-03:00", "evento_especial", ["Mega", "Global", "Setembro"], "Evento de Mega Evolução que abre setembro."),
        event("2026-09-go-fest-mega-finale", "Pokémon GO Fest 2026: Mega Finale", "2026-09-05T10:00:00-03:00", "2026-09-06T18:00:00-03:00", "go_fest", ["GO Fest", "Mega", "Global"], "Finale global do GO Fest 2026, das 10h às 18h em cada dia.", notes=["A janela diária do evento é de 10h às 18h no sábado e no domingo."]),
        event("2026-09-twilight-trails-season", "Temporada Twilight Trails", "2026-09-08T10:00:00-03:00", "2026-12-01T10:00:00-03:00", "temporada", ["Temporada", "Twilight Trails", "Global"], "Temporada Twilight Trails.", mode="hidden"),
        event("2026-09-go-pass", "GO Pass: Setembro", "2026-09-08T10:00:00-03:00", "2026-10-06T10:00:00-03:00", "go_pass", ["GO Pass", "Latios", "Global"], "GO Pass de setembro com Latios entre as recompensas.", source=GO_PASS, mode="hidden"),
        event("2026-09-mega-squads", "Mega Squads", "2026-09-08T10:00:00-03:00", "2026-09-14T20:00:00-03:00", "evento_especial", ["Mega", "Maschiff", "Global"], "Evento Mega Squads com estreia de Maschiff/Mabosstiff e outras novidades."),
        event("2026-09-gible-community-day-classic", "Dia Comunitário Clássico: Gible", "2026-09-12T14:00:00-03:00", "2026-09-12T17:00:00-03:00", "community_day", ["Gible", "Community Day", "Global"], "Gible em destaque no Dia Comunitário Clássico de setembro."),
        event("2026-09-horizons-celebration", "Celebração Pokémon Horizons: The Series", "2026-09-16T10:00:00-03:00", "2026-09-22T20:00:00-03:00", "evento_especial", ["Horizons", "Evento", "Global"], "Retorno do evento de celebração de Pokémon Horizons: The Series."),
        event("2026-09-staraptor-super-mega-raid-day", "Dia de Reides Super Mega: Staraptor", "2026-09-19T14:00:00-03:00", "2026-09-19T17:00:00-03:00", "raid_day", ["Staraptor", "Super Mega", "Raid Day"], "Staraptor em destaque no Dia de Reides Super Mega."),
        event("2026-09-choose-your-path", "Choose Your Path • Twilight Trails", "2026-09-23T10:00:00-03:00", "2026-09-28T20:00:00-03:00", "timed_research", ["Pesquisa", "Twilight Trails", "Global"], "Pesquisa temporária ramificada com caminhos de exploração, captura ou batalha."),
        event("2026-09-phantump-catch-mastery", "Catch Mastery: Phantump", "2026-09-26T10:00:00-03:00", "2026-09-26T20:00:00-03:00", "catch_mastery", ["Phantump", "Catch Mastery", "Global"], "Evento Catch Mastery com Phantump e chance aumentada de Brilhante.", source=PHANTUMP),
        event("2026-09-harvest-festival-applin", "Festival da Colheita 2026: Applin Picking", "2026-09-29T10:00:00-03:00", "2026-10-05T20:00:00-03:00", "evento_especial", ["Harvest", "Applin", "Global"], "Festival da Colheita com estreia de Applin Brilhante.", source=HARVEST),
    ]

    spotlight = [
        ("2026-09-10-spotlight-weedle", "Spotlight Hour: Weedle, Kakuna e Beedrill", "2026-09-10T18:00:00-03:00", "2026-09-10T19:00:00-03:00", "2× Candy por transferência."),
        ("2026-09-13-spotlight-houndour", "Spotlight Hour: Houndour e Houndoom", "2026-09-13T18:00:00-03:00", "2026-09-13T19:00:00-03:00", "2× Candy por transferência."),
        ("2026-09-17-spotlight-charmander", "Spotlight Hour: Charmander com óculos de Friede", "2026-09-17T18:00:00-03:00", "2026-09-17T19:00:00-03:00", "2× Poeira Estelar por captura."),
        ("2026-09-24-spotlight-rattata", "Spotlight Hour: Rattata", "2026-09-24T18:00:00-03:00", "2026-09-24T19:00:00-03:00", "2× XP por evolução e chance aumentada de Rattata XXS."),
    ]
    for row in spotlight:
        items.append(event(row[0], row[1], row[2], row[3], "spotlight_hour", ["Spotlight Hour", "Semanal", "Global"], row[4]))

    raid_hours = [
        ("2026-09-02-raid-hour-regi", "Raid Hour: Regirock, Regice e Registeel", "2026-09-02T18:00:00-03:00", "2026-09-02T19:00:00-03:00", "Trio Regi em reides de cinco estrelas."),
        ("2026-09-09-raid-hour-zacian", "Raid Hour: Zacian", "2026-09-09T18:00:00-03:00", "2026-09-09T19:00:00-03:00", "Zacian (Herói de Muitas Batalhas) em destaque."),
        ("2026-09-16-raid-hour-zamazenta", "Raid Hour: Zamazenta", "2026-09-16T18:00:00-03:00", "2026-09-16T19:00:00-03:00", "Zamazenta (Herói de Muitas Batalhas) em destaque."),
        ("2026-09-23-raid-hour-ultra-beasts", "Raid Hour: Ultra Beasts regionais", "2026-09-23T18:00:00-03:00", "2026-09-23T19:00:00-03:00", "Xurkitree na Ásia-Pacífico, Buzzwole nas Américas/Greenland e Pheromosa na Europa/Oriente Médio/África/Índia."),
        ("2026-09-30-raid-hour-xerneas", "Raid Hour: Xerneas", "2026-09-30T18:00:00-03:00", "2026-09-30T19:00:00-03:00", "Xerneas em destaque nas reides de cinco estrelas."),
    ]
    for row in raid_hours:
        items.append(event(row[0], row[1], row[2], row[3], "raid_hour", ["Raid Hour", "5 estrelas", "Global"], row[4]))

    max_mondays = [
        ("2026-09-07-max-monday-ralts", "Max Monday: Dynamax Ralts", "2026-09-07T06:00:00-03:00", "2026-09-07T21:00:00-03:00", "Ralts Dynamax em destaque nos Power Spots."),
        ("2026-09-14-max-monday-rhyhorn", "Max Monday: Dynamax Rhyhorn", "2026-09-14T06:00:00-03:00", "2026-09-14T21:00:00-03:00", "Rhyhorn Dynamax em destaque nos Power Spots."),
        ("2026-09-21-max-monday-birds", "Max Monday: Articuno, Zapdos e Moltres Dynamax", "2026-09-21T06:00:00-03:00", "2026-09-21T21:00:00-03:00", "As três aves lendárias de Kanto em Max Battles."),
        ("2026-09-28-max-monday-sobble", "Max Monday: Dynamax Sobble", "2026-09-28T06:00:00-03:00", "2026-09-28T21:00:00-03:00", "Sobble Dynamax em destaque nos Power Spots."),
    ]
    for row in max_mondays:
        items.append(event(row[0], row[1], row[2], row[3], "max_monday", ["Max Monday", "Dynamax", "Global"], row[4]))

    five_star = [
        ("2026-09-raids-regi-return", "Reides 5★: Regirock, Regice e Registeel", "2026-09-07T10:00:00-03:00", "2026-09-08T10:00:00-03:00", "Retorno do trio Regi após a janela especial do início de setembro."),
        ("2026-09-raids-zacian", "Reides 5★: Zacian", "2026-09-09T10:00:00-03:00", "2026-09-15T10:00:00-03:00", "Zacian (Herói de Muitas Batalhas) na rotação."),
        ("2026-09-raids-zamazenta", "Reides 5★: Zamazenta", "2026-09-16T10:00:00-03:00", "2026-09-22T10:00:00-03:00", "Zamazenta (Herói de Muitas Batalhas) na rotação."),
        ("2026-09-raids-ultra-beasts", "Reides 5★: Xurkitree / Buzzwole / Pheromosa", "2026-09-23T06:00:00-03:00", "2026-09-29T22:00:00-03:00", "Ultra Beasts regionais: Xurkitree (APAC), Buzzwole (Américas/Greenland) e Pheromosa (Europa/Oriente Médio/África/Índia)."),
        ("2026-09-raids-xerneas", "Reides 5★: Xerneas", "2026-09-30T06:00:00-03:00", "2026-10-06T22:00:00-03:00", "Xerneas fecha setembro e segue no início de outubro."),
    ]
    for row in five_star:
        items.append(event(row[0], row[1], row[2], row[3], "raid_rotation", ["Reide 5★", "Rotação", "Global"], row[4], mode="start"))

    mega = [
        ("2026-09-mega-beedrill-raids", "Mega Reides: Mega Beedrill", "2026-09-08T06:00:00-03:00", "2026-09-15T22:00:00-03:00", "Mega Beedrill na rotação de Mega Reides."),
        ("2026-09-mega-houndoom-raids", "Mega Reides: Mega Houndoom", "2026-09-11T06:00:00-03:00", "2026-09-15T22:00:00-03:00", "Mega Houndoom entra em rotação durante Mega Squads."),
        ("2026-09-mega-venusaur-raids", "Mega Reides: Mega Venusaur", "2026-09-16T06:00:00-03:00", "2026-09-22T22:00:00-03:00", "Mega Venusaur na rotação de Mega Reides."),
        ("2026-09-mega-malamar-raids", "Mega Reides: Mega Malamar", "2026-09-23T06:00:00-03:00", "2026-09-29T22:00:00-03:00", "Mega Malamar na rotação de Mega Reides."),
        ("2026-09-mega-victreebel-raids", "Mega Reides: Mega Victreebel", "2026-09-30T06:00:00-03:00", "2026-10-06T22:00:00-03:00", "Mega Victreebel fecha setembro e segue no início de outubro."),
    ]
    for row in mega:
        items.append(event(row[0], row[1], row[2], row[3], "mega_raid_rotation", ["Mega Reide", "Rotação", "Global"], row[4], mode="start"))

    gbl = [
        ("2026-09-gbl-08-15", "GO Battle League: Mega Editions", "2026-09-08T17:00:00-03:00", "2026-09-15T17:00:00-03:00", "Great League: Mega Edition, Ultra League: Mega Edition e Master League: Mega Edition."),
        ("2026-09-gbl-15-22", "GO Battle League: Great / Ultra Mega / Willpower Cup", "2026-09-15T17:00:00-03:00", "2026-09-22T17:00:00-03:00", "Great League, Ultra League: Mega Edition e Willpower Cup: Great League Edition."),
        ("2026-09-gbl-22-29", "GO Battle League: Ultra / Master Mega / Retro Cup", "2026-09-22T17:00:00-03:00", "2026-09-29T17:00:00-03:00", "Ultra League, Master League: Mega Edition e Retro Cup: Great League Edition."),
        ("2026-09-gbl-29-1006", "GO Battle League: Master / Mega Color Cup", "2026-09-29T17:00:00-03:00", "2026-10-06T17:00:00-03:00", "Master League e Mega Color Cup: Great League Edition."),
    ]
    for row in gbl:
        items.append(event(row[0], row[1], row[2], row[3], "go_battle_league", ["GO Battle League", "PvP", "Twilight Trails"], row[4], source=GBL, mode="start"))

    shadow = [
        ("2026-09-shadow-giratina-05", "Shadow Raids: Giratina (Forma Alterada)", "2026-09-05T00:00:00-03:00", "2026-09-06T23:59:00-03:00", "Giratina Sombroso (Forma Alterada) em Shadow Raids no fim de semana."),
        ("2026-09-shadow-thundurus-12", "Shadow Raids: Thundurus (Forma Encarnada)", "2026-09-12T00:00:00-03:00", "2026-09-13T23:59:00-03:00", "Thundurus Sombroso (Forma Encarnada) em Shadow Raids no fim de semana."),
        ("2026-09-shadow-thundurus-19", "Shadow Raids: Thundurus (Forma Encarnada)", "2026-09-19T00:00:00-03:00", "2026-09-20T23:59:00-03:00", "Thundurus Sombroso (Forma Encarnada) em Shadow Raids no fim de semana."),
        ("2026-09-shadow-thundurus-26", "Shadow Raids: Thundurus (Forma Encarnada)", "2026-09-26T00:00:00-03:00", "2026-09-27T23:59:00-03:00", "Thundurus Sombroso (Forma Encarnada) em Shadow Raids no fim de semana."),
    ]
    for row in shadow:
        items.append(event(row[0], row[1], row[2], row[3], "shadow_raids", ["Shadow Raid", "Fim de semana", "Global"], row[4]))

    return items


def main():
    items = build_events()
    ids = [item["id"] for item in items]
    if len(ids) != len(set(ids)):
        raise RuntimeError("IDs duplicados no calendário de setembro")

    errors = []
    for index, item in enumerate(items):
        for error in validate_event(item, CANDIDATE):
            errors.append(f"{index}:{item['id']}: {error}")
    if errors:
        raise RuntimeError("\n".join(errors))

    doc = load_json(EVENTS_FILE)
    events = doc.setdefault("events", [])
    changed = False
    for item in items:
        changed = upsert(events, item) or changed
    if changed:
        save_json(EVENTS_FILE, doc)
    print(f"setembro_2026={len(items)} changed={changed}")


if __name__ == "__main__":
    main()
