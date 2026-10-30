"""Update only verified factual Rocket lineups. No sprites, player data or unofficial spawn claims."""
from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "spidey-app/data/rocket-lineups.json"
DATA_URL = "https://raw.githubusercontent.com/pokelitee/leak-duck/data/rocket_lineups.json"
LEEK_URL = "https://leekduck.com/rocket-lineups/"
KNOWN_TYPES = {
    "Normal": ("Normal", "Lutador"),
    "Fire": ("Fogo", "Água, Pedra e Terrestre"),
    "Water": ("Água", "Elétrico e Planta"),
    "Electric": ("Elétrico", "Terrestre"),
    "Grass": ("Planta", "Fogo, Gelo, Voador, Inseto e Venenoso"),
    "Ice": ("Gelo", "Fogo, Lutador, Pedra e Aço"),
    "Fighting": ("Lutador", "Psíquico, Voador e Fada"),
    "Poison": ("Venenoso", "Terrestre e Psíquico"),
    "Ground": ("Terrestre", "Água, Planta e Gelo"),
    "Flying": ("Voador", "Elétrico, Gelo e Pedra"),
    "Psychic": ("Psíquico", "Inseto, Fantasma e Sombrio"),
    "Bug": ("Inseto", "Fogo, Voador e Pedra"),
    "Rock": ("Pedra", "Água, Planta, Lutador, Terrestre e Aço"),
    "Ghost": ("Fantasma", "Fantasma e Sombrio"),
    "Dragon": ("Dragão", "Gelo, Dragão e Fada"),
    "Dark": ("Sombrio", "Lutador, Inseto e Fada"),
    "Steel": ("Aço", "Fogo, Lutador e Terrestre"),
    "Fairy": ("Fada", "Venenoso e Aço"),
}
PHRASES = {
    "Normal-type Male Grunt": "Normal does not mean weak.",
    "Fire-type Female Grunt": "Do you know how hot Pokémon fire breath can get?",
    "Water-type Female Grunt": "These waters are treacherous!",
    "Water-type Male Grunt": "These waters are treacherous!",
    "Electric-type Female Grunt": "Get ready to be shocked!",
    "Grass-type Male Grunt": "Don't tangle with us!",
    "Ice-type Female Grunt": "You're gonna be frozen in your tracks.",
    "Fighting-type Female Grunt": "This buff physique isn't just for show!",
    "Poison-type Female Grunt": "Coiled and ready to strike!",
    "Ground-type Male Grunt": "You'll be defeated into the ground!",
    "Flying-type Female Grunt": "Battle against my Flying-type Pokémon!",
    "Psychic-type Male Grunt": "Are you scared of psychics that use unseen power?",
    "Bug-type Male Grunt": "Go, my super bug Pokémon!",
    "Rock-type Male Grunt": "Let's rock and roll!",
    "Ghost-type Male Grunt": "Ke...ke...ke...ke...ke...ke!",
    "Dragon-type Female Grunt": "ROAR! ...How'd that sound?",
    "Dark-type Female Grunt": "Wherever there is light, there is also shadow.",
    "Steel-type Male Grunt": "You're no match for my iron will!",
    "Fairy-type Female Grunt": "Check out my cute Pokémon!",
    "Male Grunt": "Winning is for winners.",
    "Female Grunt": "Winning is for winners.",
    "Decoy Female Grunt": "Fooled ya, twerp.",
}
ALLOWED_NAME = re.compile(r"^[\w\s'’\-\.éÉ♀♂:()]{1,90}$", re.UNICODE)


def fetch(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": "SpideyPokemonGO/1.0 (+GitHub community roster verification)", "Accept": "application/json,text/html"})
    with urlopen(req, timeout=20) as r:
        if r.status != 200:
            raise ValueError(f"Fonte respondeu HTTP {r.status}")
        body = r.read(700_000)
        if len(body) >= 700_000:
            raise ValueError("Fonte maior que o limite esperado")
        return body


def normalize(raw: dict) -> list[dict]:
    if not isinstance(raw, dict) or not 20 <= len(raw) <= 35:
        raise ValueError("Elenco incompleto ou com quantidade inesperada")
    if not {"Giovanni", "Cliff", "Arlo", "Sierra"} <= raw.keys():
        raise ValueError("Líderes e Giovanni ausentes")
    members = []
    ids = set()
    for key, slots in raw.items():
        if not isinstance(key, str) or not ALLOWED_NAME.fullmatch(key):
            raise ValueError("Identificador inválido")
        category = "boss" if key == "Giovanni" else "leader" if key in ("Cliff", "Arlo", "Sierra") else "grunt"
        mt = re.fullmatch(r"(\w+)-type (Male|Female) Grunt", key)
        type_name = mt.group(1) if mt else None
        if mt and type_name not in KNOWN_TYPES:
            raise ValueError(f"Tipo novo exige revisão: {type_name}")
        label = key if category != "grunt" else (
            "Recruta isca" if key == "Decoy Female Grunt" else
            "Recruta misterioso" if not mt else
            f"Recruta • {KNOWN_TYPES[type_name][0]} {'♂' if mt.group(2)=='Male' else '♀'}"
        )
        key_id = re.sub(r"[^a-z0-9]+", "-", key.lower()).strip("-")
        if key_id in ids:
            raise ValueError("ID duplicado")
        ids.add(key_id)
        if not isinstance(slots, list) or len(slots) != 3:
            raise ValueError(f"Três posições obrigatórias para {key}")
        compact = []
        for position, entry in enumerate(slots, start=1):
            mons = entry.get("pokemons") if isinstance(entry, dict) else None
            if entry.get("slot") != position or type(entry.get("is_encounter")) is not bool or not isinstance(mons, list) or not 1 <= len(mons) <= 5:
                raise ValueError(f"Posição inválida: {key}/{position}")
            pokemon = []
            for mon in mons:
                if not isinstance(mon, dict) or not isinstance(mon.get("name"), str) or not ALLOWED_NAME.fullmatch(mon["name"]) or type(mon.get("shiny_available")) is not bool:
                    raise ValueError(f"Pokémon inválido em {key}")
                pokemon.append({"name": mon["name"], "shiny_possible": mon["shiny_available"]})
            compact.append({"position": position, "encounter_possible": entry["is_encounter"], "pokemon": pokemon})
        members.append({
            "id": key_id, "source_key": key, "label": label, "group": category,
            "type_key": type_name, "type_label": KNOWN_TYPES[type_name][0] if type_name else None,
            "hint": PHRASES.get(key),
            "tip": (f"Fraqueza do tipo {KNOWN_TYPES[type_name][0]}: {KNOWN_TYPES[type_name][1]}. A composição pode ter tipos secundários.") if type_name else None,
            "slots": compact,
        })
    if len(members) < 20 or sum(m["group"] == "grunt" for m in members) < 18:
        raise ValueError("Faltam recrutas")
    return members


class _PageText(HTMLParser):
    """Visible page text; tag boundaries often split a published update date."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.hidden_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in ("script", "style", "noscript"):
            self.hidden_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style", "noscript") and self.hidden_depth:
            self.hidden_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self.hidden_depth:
            self.parts.append(data)


def source_date(page: str) -> str:
    parser = _PageText()
    parser.feed(page)
    # The source changed from plain "Updated on October 2, 2026" to HTML
    # whose tags break the phrase. Read only visible text and fail closed
    # if the update date is genuinely absent or malformed.
    visible = re.sub(r"\s+", " ", unescape(" ".join(parser.parts)))
    match = re.search(r"\bUpdated\s+on\s+([A-Za-z]+\s+\d{1,2}\s*,?\s*\d{4})\b", visible, re.I)
    if not match:
        raise ValueError("Leek Duck não informou a data da escalação; não publicar nova revisão")
    label = re.sub(r"\s*,\s*", " ", match.group(1)).strip()
    return datetime.strptime(label, "%B %d %Y").date().isoformat()


def verify_page(raw: dict, page: str) -> None:
    normalized = unescape(page).lower()
    if "team go rocket lineups" not in normalized:
        raise ValueError("Página-fonte incorreta")
    for name in ["Giovanni", "Cliff", "Arlo", "Sierra"]:
        if name.lower() not in normalized:
            raise ValueError(f"Página sem {name}")
        for mon in raw[name][0]["pokemons"]:
            if mon["name"].lower() not in normalized:
                raise ValueError(f"Fonte divergente em {name}: {mon['name']}")


def run(raw: dict, page: str, old: dict) -> dict:
    members = normalize(raw)
    verify_page(raw, page)
    date = source_date(page)
    if date < old["source"]["source_updated_on"]:
        raise ValueError("Data de fonte retrocedeu: possível página em cache")
    new = dict(old)
    source = dict(old["source"])
    source["source_updated_on"] = date
    new["source"] = source
    new["members"] = members
    if new["members"] != old["members"] or source != old["source"]:
        new["revision"] = "source-change-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return new


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-only", action="store_true")
    args = parser.parse_args()
    old = json.loads(DEST.read_text(encoding="utf-8"))
    raw = json.loads(fetch(DATA_URL).decode("utf-8"))
    page = fetch(LEEK_URL).decode("utf-8", "replace")
    new = run(raw, page, old)
    if new == old:
        print(f"Rocket: sem mudança desde a revisão {old['revision']}.")
    elif args.check_only:
        print(f"Rocket: nova escalação detectada ({new['source']['source_updated_on']}).")
    else:
        DEST.write_text(json.dumps(new, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Rocket: revisão publicada apenas após verificar as duas fontes; {len(new['members'])} categorias.")


if __name__ == "__main__":
    main()
