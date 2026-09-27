import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

API = "https://discord.com/api/v10"
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
CHANNEL = os.getenv("POKEMINERS_CHANNEL_ID", "1550962794814373898").strip()
OUT = Path("v2/inbox/test_e.json")
USER_AGENT = "SpideyPokemonGO-V2-TestE/1.0"
NEWS_MARKERS = (
    "@news updates",
    "found a new news item on pokemongolive",
    "pokemongo.com/news",
)


def now():
    return datetime.now(timezone.utc).isoformat()


def headers():
    if not TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN ausente")
    return {"Authorization": f"Bot {TOKEN}", "User-Agent": USER_AGENT, "Accept": "application/json"}


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
    return "pokeminers" in probe or "miner-bot" in probe or "@news updates" in probe


def is_news(text):
    low = text.lower()
    return any(marker in low for marker in NEWS_MARKERS)


def extract(text):
    title_match = re.search(r"(?:^|\n)\s*Title:\s*(.+?)(?:\n|$)", text, re.I)
    title = title_match.group(1).strip() if title_match else "Nova notícia oficial Pokémon GO"
    url_match = re.search(
        r"https?://(?:www\.)?pokemongo\.com/(?:[A-Za-z]{2}(?:-[A-Za-z]{2})?/)?news/[^\s<>\]\)]+",
        text,
        re.I,
    )
    url = url_match.group(0).rstrip(".,") if url_match else ""
    return title, url


def newest_news():
    h = headers()
    before = None
    for _ in range(10):
        params = {"limit": 100}
        if before:
            params["before"] = before
        r = requests.get(f"{API}/channels/{CHANNEL}/messages", headers=h, params=params, timeout=30)
        r.raise_for_status()
        rows = r.json()
        if not rows:
            break
        for msg in rows:  # Discord entrega do mais novo para o mais antigo
            text = full_text(msg)
            if text and is_pokeminers(msg, text) and is_news(text):
                return msg, text
        before = str(rows[-1].get("id") or "")
        if len(rows) < 100 or not before:
            break
    return None, ""


def main():
    msg, text = newest_news()
    if not msg:
        raise RuntimeError("nenhuma notícia real do PokeMiners encontrada nas últimas 1000 mensagens")

    mid = str(msg.get("id") or "")
    title, source_url = extract(text)
    author = msg.get("author") or {}
    payload = {
        "source": "PokeMiners",
        "source_channel_id": CHANNEL,
        "source_message_id": mid,
        "source_timestamp": str(msg.get("timestamp") or ""),
        "source_author": str(author.get("username") or author.get("global_name") or ""),
        "raw_text": text,
        "title": title,
        "source_url": source_url,
        "status": "captured",
        "captured_at_utc": now(),
        "test_stage": "E1_ENTRADA_ONLY",
        "art_generated": False,
        "approval_sent": False,
        "published": False,
    }

    if OUT.exists():
        old = json.loads(OUT.read_text(encoding="utf-8"))
        if str(old.get("source_message_id") or "") == mid:
            print(f"TEST_E_ENTRY_ALREADY_CAPTURED id={mid} title={title!r}")
            return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"TEST_E_ENTRY_CAPTURED id={mid} title={title!r} url={source_url!r}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
