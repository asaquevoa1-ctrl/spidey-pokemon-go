"""Publish verified official news headlines in Spidey's News tab without waiting for artwork.

This is deliberately NOT a calendar event authoring bot: no guessed dates, bonuses,
spawns, routes, artwork approvals or push notifications. Complements the curated pipeline.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit

import requests

from scripts.official_curated_monitor import buscar_noticias

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "spidey-app/data/events.json"
MONTHS = {month: index for index, month in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1
)}
MONTHS.update({"out": 10, "dez": 12, "set": 9, "ago": 8, "mai": 5, "abr": 4, "mar": 3, "fev": 2, "jan": 1, "jun": 6, "jul": 7, "nov": 11})
TAG_PATTERN = re.compile(r"<[^>]+>")
DATE_PATTERN = re.compile(r"\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|out(?:ubro)?|set(?:embro)?|ago(?:sto)?|mai(?:o)?|abr(?:il)?|fev(?:ereiro)?|dez(?:embro)?)\s+(\d{1,2}),?\s+(20\d{2})\b", re.I)


def canonical(url: str) -> str:
    """Normalize official article identities across locales; never trust foreign domains."""
    parsed = urlsplit(url)
    if parsed.scheme != "https" or (parsed.hostname or "").lower() not in {"pokemongo.com", "www.pokemongo.com"}:
        return ""
    path = re.sub(r"^/(?:pt-BR|en|es-MX|ja|fr|de|ko)/news/", "/news/", parsed.path, flags=re.I)
    if not path.startswith("/news/") or len(path) < 8 or path.endswith("/news/"):
        return ""
    return "pokemongo.com" + path.rstrip("/").lower()


class PublishedMeta(HTMLParser):
    def __init__(self):
        super().__init__()
        self.dates = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        key = (values.get('property') or values.get('name') or values.get('itemprop') or '').lower()
        if tag == 'meta' and key in {'article:published_time', 'datepublished', 'date_created', 'pubdate', 'publish_date'}:
            self.dates.append(values.get('content') or '')
        if tag == 'time' and values.get('datetime'):
            self.dates.append(values['datetime'])


def date_from_article_html(source: str) -> date | None:
    """Only article metadata/JSON-LD, not event dates mentioned in the body."""
    parser = PublishedMeta()
    parser.feed(source)
    values = list(parser.dates)
    values.extend(re.findall(r'"datePublished"\s*:\s*"([^\"]+)"', source))
    values.extend(re.findall(r'"date_published"\s*:\s*"([^\"]+)"', source))
    for value in values:
        m = re.match(r'^\s*(20\d{2}-\d{2}-\d{2})(?:T|\s|$)', value)
        if not m:
            continue
        try:
            return date.fromisoformat(m.group(1))
        except ValueError:
            continue
    return None


def fetch_publication_date(url: str) -> date | None:
    if not canonical(url):
        return None
    r = requests.get(url, headers={'User-Agent': 'SpideyPokemonGO/1.0 (+verified official news)'}, timeout=15)
    r.raise_for_status()
    if len(r.content) > 1_200_000:
        raise ValueError('Artigo oficial com resposta grande demais')
    return date_from_article_html(r.text)


def date_from_index(label: str) -> date | None:
    match = DATE_PATTERN.search(html.unescape(label))
    if not match:
        return None
    month = MONTHS.get(match.group(1)[:3].lower())
    try:
        return date(int(match.group(3)), month, int(match.group(2))) if month else None
    except (ValueError, TypeError):
        return None


def known_articles(events: list[dict]) -> set[str]:
    urls = set()
    for entry in events:
        for s in [entry.get("source"), entry.get("news", {}).get("source"), *(entry.get("verification_sources") or [])]:
            if isinstance(s, dict):
                value = canonical(str(s.get("url", "")))
                if value:
                    urls.add(value)
    return urls


def news_record(title: str, url: str, published: date, checked: date) -> dict:
    key = canonical(url)
    if not key:
        raise ValueError("Nonofficial news URL")
    digest = hashlib.sha256(key.encode()).hexdigest()[:12]
    title = re.sub(r"\s+", " ", html.unescape(TAG_PATTERN.sub("", title))).strip()
    if len(title) < 12 or len(title) > 230:
        raise ValueError("Invalid official headline")
    # Authored summary deliberately makes no new gameplay claims.
    summary = "Novo comunicado oficial do Pokémon GO. Confira os detalhes na fonte; horários, recompensas e participação só entram no Calendário depois de verificação."
    return {
        "id": "official-news-auto-" + digest,
        "slug": "official-news-auto-" + digest,
        "content_type": "news",
        "title": title,
        "summary": summary,
        "category": "official_update",
        "tags": ["Novidade", "Pokémon GO oficial", "Atualização automática"],
        "source": {"name": "Pokémon GO • comunicado oficial", "url": url, "confidence": "official"},
        "calendar": {"mode": "hidden"},
        "presentation": {"requires_art": False, "fallback_visual": "none"},
        "news": {
            "title": title,
            "summary": summary,
            "published_on": published.isoformat(),
            "label": "OFICIAL • NOVO"
        },
        "notes": [
            "Esta notícia foi identificada automaticamente na página de notícias do Pokémon GO.",
            "A fonte é oficial, mas o Spidey ainda não verificou individualmente o cronograma, os Pokémon, as recompensas ou os bônus desta publicação.",
            "Não confundir uma notícia detectada com evento confirmado no calendário; utilize o link do comunicado para consultar o texto completo."
        ],
        "notifications": {"enabled": False, "reason": "A notícia não tem horário de evento validado."},
        "status": "published",
        "verified_at": checked.isoformat(),
        "updated_at": datetime.combine(checked, datetime.min.time(), tzinfo=timezone.utc).isoformat(),
        "audit": {"classification": "official_headline_only", "editorial_detail_pending": True,
                  "automatic_index_discovery": True, "not_a_calendar_event": True}
    }


def sync(events: list[dict], headlines: list[tuple[str, str]], checked: date,
         days: int = 21, max_new: int = 7, date_lookup=None) -> tuple[list[dict], dict]:
    if len(events) < 50:
        raise ValueError("Catálogo possivelmente truncado — não sobrescrever")
    if not 2 <= len(headlines) <= 100:
        raise ValueError("Índice de notícias incompleto — manter catálogo atual")
    copy = list(events)
    identities = known_articles(events)
    new = []
    observed = set()
    duplicates = 0
    undated = 0
    meta_checked = 0
    for label, url in headlines:
        key = canonical(url)
        if not key or key in observed:
            continue
        observed.add(key)
        if key in identities:
            duplicates += 1
            continue
        when = date_from_index(label)
        if when is None and callable(date_lookup) and meta_checked < 14:
            meta_checked += 1
            try:
                when = date_lookup(url)
            except (requests.RequestException, ValueError) as exc:
                print('Fonte oficial sem data confirmável em metadados:', canonical(url), type(exc).__name__)
        if when is None:
            undated += 1
            continue
        if when < checked - timedelta(days=days) or when > checked + timedelta(days=1):
            continue
        name = DATE_PATTERN.sub("", label, count=1).strip(" ,:\u2022-")
        if len(name) < 12:
            continue
        entry = news_record(name, url, when, checked)
        if any(e["id"] == entry["id"] for e in copy + new):
            continue
        new.append(entry)
        if len(new) >= max_new:
            break
    # Fail closed: an undated index is a broken parser, not 'no new news'.
    if len(observed) >= 5 and undated >= max(4, len(observed) * .7):
        raise ValueError("Índice oficial mudou de formato: maioria das datas não reconhecida")
    # Keep curated content and approved art intact; append *only* trusted news records.
    copy.extend(new)
    return copy, {"new": len(new), "already_covered": duplicates, "undated": undated,
                  "names": [x["title"] for x in new]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    if not isinstance(catalog.get("events"), list):
        raise ValueError("Catálogo sem lista de eventos")
    new_events, report = sync(catalog["events"], buscar_noticias(), datetime.now(timezone.utc).date(), date_lookup=fetch_publication_date)
    print(json.dumps(report, ensure_ascii=False))
    if new_events == catalog["events"]:
        print("Sem novos comunicados a publicar.")
        return
    if args.dry_run:
        print("Dry run: catálogo intacto.")
        return
    catalog["events"] = new_events
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Notícias oficiais no Spidey; eventos/calendário/arte existentes intactos.")


if __name__ == "__main__":
    main()
