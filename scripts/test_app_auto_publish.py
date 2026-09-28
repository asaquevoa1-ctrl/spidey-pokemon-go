from scripts.app_auto_publish_v2 import validate_event, validate_stamp


BASE_VALIDATION = {
    "source_verified": True,
    "facts_complete": True,
    "schedule_verified": True,
    "art_verified": True,
    "cross_checked": True,
}


def event_payload():
    return {
        "id": "test-event",
        "slug": "test-event",
        "title": "Evento de teste",
        "source": {
            "name": "Pokémon GO",
            "url": "https://pokemongo.com/news/test",
            "confidence": "official",
        },
        "art": {
            "url": "https://example.com/art.png",
            "sha256": "a" * 64,
            "width": 1024,
            "height": 1536,
            "standard": "spidey-premium-v1",
        },
        "schedule": {
            "local_timezone": "Asia/Taipei",
            "start_local": "2026-10-01T10:00:00+08:00",
            "end_local": "2026-10-01T18:00:00+08:00",
            "brazil_timezone": "America/Sao_Paulo",
            "start_brazil": "2026-09-30T23:00:00-03:00",
            "end_brazil": "2026-10-01T07:00:00-03:00",
        },
        "locations": [],
        "gpx": {"enabled": False},
    }


def stamp_payload():
    return {
        "id": "test-stamp",
        "slug": "test-stamp",
        "title": "Stamp Rally de teste",
        "source": {
            "name": "Pokémon GO",
            "url": "https://pokemongo.com/news/test-stamp",
            "confidence": "official",
        },
        "stops": [
            {
                "id": "test-stop",
                "city": "Taipei",
                "country": "Taiwan",
                "latitude": None,
                "longitude": None,
                "coordinate_type": "venue_reference",
                "coordinate_confidence": "unconfirmed",
                "gpx_enabled": False,
            }
        ],
    }


def run():
    candidate = {"validation": dict(BASE_VALIDATION)}

    errors = validate_event(event_payload(), candidate)
    assert not errors, f"Evento oficial válido foi bloqueado: {errors}"

    calendar_only = event_payload()
    calendar_only.pop("art")
    calendar_only["presentation"] = {"requires_art": False}
    calendar_validation = {"validation": {**BASE_VALIDATION, "art_verified": False}}
    errors = validate_event(calendar_only, calendar_validation)
    assert not errors, f"Evento de calendário sem arte dedicada foi bloqueado: {errors}"

    secondary = event_payload()
    secondary["source"]["confidence"] = "verified"
    bad_candidate = {"validation": {**BASE_VALIDATION, "cross_checked": False}}
    errors = validate_event(secondary, bad_candidate)
    assert any("cross_checked" in item for item in errors), errors

    bad_gpx = event_payload()
    bad_gpx["locations"] = [{
        "label": "Referência de país",
        "latitude": 20.5937,
        "longitude": 78.9629,
        "coordinate_type": "country_reference",
    }]
    bad_gpx["gpx"] = {"enabled": True}
    errors = validate_event(bad_gpx, candidate)
    assert any("GPX habilitado sem coordenada exata" in item for item in errors), errors

    errors = validate_stamp(stamp_payload(), candidate)
    assert not errors, f"Stamp com venue oficial e GPX bloqueado deveria poder aparecer: {errors}"

    bad_stamp = stamp_payload()
    bad_stamp["stops"][0]["gpx_enabled"] = True
    errors = validate_stamp(bad_stamp, candidate)
    assert any("GPX só pode ser habilitado" in item for item in errors), errors

    exact_stamp = stamp_payload()
    exact_stamp["stops"][0].update({
        "latitude": 25.0330,
        "longitude": 121.5654,
        "coordinate_type": "exact_pokestop",
        "coordinate_confidence": "confirmed",
        "gpx_enabled": True,
    })
    errors = validate_stamp(exact_stamp, candidate)
    assert not errors, f"PokéStop exata confirmada foi bloqueada: {errors}"

    print("app_auto_publish v2 gate tests: OK")


if __name__ == "__main__":
    run()
