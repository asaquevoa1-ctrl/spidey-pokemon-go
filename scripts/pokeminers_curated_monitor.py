import json
import os
import re
import sys
from pathlib import Path

import requests

from scripts.curated_dispatch import gerar_persistir_e_enviar

DISCORD_API = "https://discord.com/api/v10"
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
CHANNEL = os.getenv("POKEMINERS_CHANNEL_ID", "1550962794814373898").strip()
STATE = Path(os.getenv("POKEMINERS_STATE_FILE", "last_pokeminers.txt"))


def full_text(msg):
    parts = []
    content = str(msg.get("content") or "").strip()
    if content:
        parts.append(content)
    for embed in msg.get("embeds") or []:
        for key in ("title", "description"):
            value = str(embed.get(key) or "").strip()
            if value:
                parts.append(value)
        for field in embed.get("fields") or []:
            name = str(field.get("name") or "").strip()
            value = str(field.get("value") or "").strip()
            if name or value:
                parts.append(" — ".join(x for x in (name, value) if x))
    return "\n\n".join(parts).strip()


def is_pokeminers(msg, text):
    author = msg.get("author") or {}
    probe = " ".join((str(author.get("username") or ""), str(author.get("global_name") or ""), text)).lower()
    return any(x in probe for x in ("pokeminers", "miner-bot", "@apk updates", "@forced updates", "@news updates", "@gamemaster updates", "@asset updates"))


def relevant(text):
    t = text.lower()
    return any(m in t for m in (
        "api version", "forced update", "apk update", "@apk updates", "@forced updates",
        "game master", "gamemaster", "master file", "asset update", "text update",
        "remote config", "new version", "version changed", "datamine", "data mine",
        "campfire apk", "apk roll-out", "apk rollout",
    ))


def classify(text):
    t = text.lower()
    if "campfire" in t and "apk" in t:
        return "🔥 CAMPFIRE • NOVA VERSÃO"
    if "forced update" in t or "api version" in t or "version changed" in t:
        return "⚙️ ATUALIZAÇÃO FORÇADA • Pokémon GO"
    if "apk" in t:
        return "📦 APK • Pokémon GO"
    if "game master" in t or "gamemaster" in t or "datamine" in t or "data mine" in t:
        return "🔎 DATAMINE • PokeMiners"
    return "⛏️ POKEMINERS • Nova atualização"


def normalize(text):
    compact = re.sub(r"\n{3,}", "\n\n", text).strip()
    forced = re.search(r"(?:api version changed.*?|forced update.*?)(\d+\.\d+\.\d+)\s*(?:->|→)\s*(\d+\.\d+\.\d+)", compact, re.I | re.S)
    if forced:
        old, new = forced.group(1), forced.group(2)
        return f"O PokeMiners detectou uma atualização forçada da API do Pokémon GO.\n\n📦 Versão anterior: {old}\n🆕 Nova versão: {new}\n⚠️ Tipo: atualização forçada"
    campfire = re.search(r"Found a new Campfire APK on Google Play:\s*([0-9.]+)\s*\(([^)]+)\)", compact, re.I)
    if campfire:
        version, when = campfire.group(1), campfire.group(2)
        return f"O PokeMiners detectou uma nova versão do Campfire na Google Play.\n\n📦 Versão: {version}\n🕒 Data informada: {when}\n📱 Plataforma: Android / Google Play"
    rollout = re.search(r"A new Pokemon Go APK roll-out has started for Google Play, update date is now set to\s*([^\n]+)", compact, re.I)
    if rollout:
        return f"O PokeMiners detectou um novo rollout do APK do Pokémon GO na Google Play.\n\n🕒 Data informada: {rollout.group(1).strip()}\n📱 Plataforma: Android / Google Play"
    return "Nova informação detectada automaticamente no PokeMiners.\n\n" + compact[:3000]


def main():
    if not TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN ausente")
    h = {"Authorization": f"Bot {TOKEN}", "User-Agent": "SpideyPokemonGO/1.0", "Accept": "application/json"}
    ch = requests.get(f"{DISCORD_API}/channels/{CHANNEL}", headers=h, timeout=30)
    ch.raise_for_status()
    guild = str(ch.json().get("guild_id") or "").strip()
    r = requests.get(f"{DISCORD_API}/channels/{CHANNEL}/messages", headers=h, params={"limit": 75}, timeout=30)
    r.raise_for_status()
    messages = r.json()

    relevant_messages = []
    for msg in messages:
        text = full_text(msg)
        if not text or not is_pokeminers(msg, text):
            continue
        # Notícias de PokemonGoLive são responsabilidade exclusiva do monitor Oficial.
        low = text.lower()
        if "@news updates" in low or "found a new news item on pokemongolive" in low or "pokemongo.com/news" in low:
            continue
        if relevant(text):
            relevant_messages.append((msg, text))

    if not relevant_messages:
        print("Nenhuma atualização operacional relevante do PokeMiners.")
        return 0

    last = STATE.read_text(encoding="utf-8").strip() if STATE.exists() else ""
    if not last.isdigit():
        current = max(int(str(m.get("id") or "0")) for m, _ in relevant_messages)
        STATE.write_text(str(current) + "\n", encoding="utf-8")
        print(f"Monitor PokeMiners curado inicializado em {current}.")
        return 0

    unseen = [(m, t) for m, t in relevant_messages if str(m.get("id") or "").isdigit() and int(m["id"]) > int(last)]
    if not unseen:
        print("Nenhuma nova atualização PokeMiners.")
        return 0
    unseen.sort(key=lambda item: int(item[0]["id"]))

    sent = []
    for msg, text in unseen[:5]:
        mid = str(msg["id"])
        source_url = f"https://discord.com/channels/{guild}/{CHANNEL}/{mid}" if guild else None
        payload = {
            "titulo": classify(text),
            "mensagem": normalize(text) + "\n\n🔎 Fonte operacional: PokeMiners #miner-bot",
            "url": source_url,
            "gerar_gpx": False,
            "aprovar": True,
        }
        result = gerar_persistir_e_enviar(payload, f"pokeminers-{mid}")
        print(json.dumps(result, ensure_ascii=False))
        sent.append(int(mid))
    if sent:
        STATE.write_text(str(max(sent)) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERRO POKEMINERS CURADO: {exc}", file=sys.stderr, flush=True)
        raise
