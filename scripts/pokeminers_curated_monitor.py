import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

from scripts.curated_dispatch import gerar_persistir_e_enviar

DISCORD_API = "https://discord.com/api/v10"
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
CHANNEL = os.getenv("POKEMINERS_CHANNEL_ID", "1550962794814373898").strip()
STATE = Path(os.getenv("POKEMINERS_STATE_FILE", "last_pokeminers.txt"))
MAX_ENVIOS = 5
MAX_PAGINAS = 20
LIMITE_PAGINA = 100


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


def first_image_url(msg):
    for attachment in msg.get("attachments") or []:
        url = str(attachment.get("url") or "").strip()
        ctype = str(attachment.get("content_type") or "").lower()
        name = str(attachment.get("filename") or "").lower()
        if url and (ctype.startswith("image/") or name.endswith((".png", ".jpg", ".jpeg", ".webp"))):
            return url
    for embed in msg.get("embeds") or []:
        for key in ("image", "thumbnail"):
            url = str((embed.get(key) or {}).get("url") or "").strip()
            if url:
                return url
    return None


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


def discord_headers():
    if not TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN ausente")
    return {"Authorization": f"Bot {TOKEN}", "User-Agent": "SpideyPokemonGO/2.0", "Accept": "application/json"}


def snowflake_datetime(message_id):
    try:
        ms = (int(str(message_id)) >> 22) + 1420070400000
        return datetime.fromtimestamp(ms / 1000, tz=timezone.utc)
    except Exception:
        return None


def buscar_novas(last, headers):
    novas = []
    after = str(last or "").strip()
    for pagina in range(1, MAX_PAGINAS + 1):
        params = {"limit": LIMITE_PAGINA}
        if after:
            params["after"] = after
        r = requests.get(f"{DISCORD_API}/channels/{CHANNEL}/messages", headers=headers, params=params, timeout=30)
        r.raise_for_status()
        lote = [m for m in r.json() if str(m.get("id") or "").isdigit()]
        if not lote:
            break
        lote.sort(key=lambda m: int(m["id"]))
        novas.extend(lote)
        maior = str(lote[-1]["id"])
        if maior == after or len(lote) < LIMITE_PAGINA:
            break
        after = maior
        print(f"PokeMiners backlog: página {pagina} lida até {after}.", flush=True)
    else:
        raise RuntimeError("Backlog PokeMiners excedeu o limite de segurança; cursor não foi saltado.")
    # A API pode repetir bordas entre páginas; removemos por ID e preservamos ordem.
    unicos = {str(m["id"]): m for m in novas}
    return [unicos[k] for k in sorted(unicos, key=int)]


def main():
    headers = discord_headers()
    ch = requests.get(f"{DISCORD_API}/channels/{CHANNEL}", headers=headers, timeout=30)
    ch.raise_for_status()
    ch_data = ch.json()
    guild = str(ch_data.get("guild_id") or "").strip()
    nome_canal = str(ch_data.get("name") or "(sem nome)")

    latest_r = requests.get(f"{DISCORD_API}/channels/{CHANNEL}/messages", headers=headers, params={"limit": 1}, timeout=30)
    latest_r.raise_for_status()
    latest_rows = latest_r.json()
    latest_id = str((latest_rows[0] if latest_rows else {}).get("id") or "").strip()
    latest_dt = snowflake_datetime(latest_id)
    age_h = (datetime.now(timezone.utc) - latest_dt).total_seconds() / 3600 if latest_dt else None
    age_txt = f"{age_h:.1f}h" if age_h is not None else "desconhecida"
    print(f"PokeMiners origem: canal={nome_canal!r} id={CHANNEL} newest={latest_id or 'vazio'} idade={age_txt}", flush=True)
    if age_h is not None and age_h > 24:
        print(f"ALERTA POKEMINERS: canal sem mensagem nova há {age_h:.1f}h.", file=sys.stderr, flush=True)

    last = STATE.read_text(encoding="utf-8").strip() if STATE.exists() else ""
    if not last.isdigit():
        if latest_id:
            STATE.write_text(latest_id + "\n", encoding="utf-8")
            print(f"Monitor PokeMiners inicializado em {latest_id} sem republicar histórico.")
        else:
            print("Canal PokeMiners vazio; estado não alterado.")
        return 0

    messages = buscar_novas(last, headers)
    if not messages:
        print("Nenhuma mensagem nova no canal PokeMiners.")
        return 0

    checkpoint = int(last)
    enviados = 0
    examinados = 0

    for msg in messages:
        if enviados >= MAX_ENVIOS:
            break
        mid = str(msg["id"])
        text = full_text(msg)
        examinados += 1

        if not text or not is_pokeminers(msg, text):
            checkpoint = max(checkpoint, int(mid))
            continue

        low = text.lower()
        if "@news updates" in low or "found a new news item on pokemongolive" in low or "pokemongo.com/news" in low:
            checkpoint = max(checkpoint, int(mid))
            continue

        if not relevant(text):
            checkpoint = max(checkpoint, int(mid))
            continue

        source_url = f"https://discord.com/channels/{guild}/{CHANNEL}/{mid}" if guild else None
        payload = {
            "titulo": classify(text),
            "mensagem": normalize(text) + "\n\n🔎 Fonte operacional: PokeMiners #miner-bot",
            "url": source_url,
            "image_url": first_image_url(msg),
            "gerar_gpx": False,
            "aprovar": True,
            "media_policy": "source_first",
        }
        try:
            result = gerar_persistir_e_enviar(payload, f"pokeminers-{mid}")
        except Exception:
            STATE.write_text(str(checkpoint) + "\n", encoding="utf-8")
            raise
        print(json.dumps(result, ensure_ascii=False))
        checkpoint = max(checkpoint, int(mid))
        enviados += 1

    STATE.write_text(str(checkpoint) + "\n", encoding="utf-8")
    print(f"PokeMiners: examinados={examinados}; enfileirados={enviados}; cursor={checkpoint}.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERRO POKEMINERS CURADO: {exc}", file=sys.stderr, flush=True)
        raise