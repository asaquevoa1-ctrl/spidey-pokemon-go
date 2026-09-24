import json
import os
from datetime import datetime, timezone
from pathlib import Path

import requests

QUEUE = Path("queue/curated")
CHANNEL = os.getenv("APPROVAL_CHANNEL_ID", "1550963072464715997").strip()
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
API = "https://discord.com/api/v10"

if not TOKEN:
    raise SystemExit("DISCORD_BOT_TOKEN ausente")

HEADERS = {
    "Authorization": f"Bot {TOKEN}",
    "User-Agent": "SpideyPokemonGO/2.0",
}


def reaction_count(message, emoji_name):
    for reaction in message.get("reactions") or []:
        emoji = reaction.get("emoji") or {}
        if str(emoji.get("name") or "") == emoji_name:
            try:
                return int(reaction.get("count") or 0)
            except (TypeError, ValueError):
                return 0
    return 0


def get_message(message_id):
    r = requests.get(
        f"{API}/channels/{CHANNEL}/messages/{message_id}",
        headers=HEADERS,
        timeout=30,
    )
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()


def main():
    changed = 0
    now = datetime.now(timezone.utc).isoformat()

    for path in sorted(QUEUE.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"JSON inválido {path.name}: {exc}")
            continue

        mid = str(data.get("discord_approval_id") or "").strip()
        if not mid:
            continue
        if data.get("status") in {"published", "rejected", "rejected_art", "decision_conflict"}:
            continue

        msg = get_message(mid)
        if not msg:
            continue

        yes = reaction_count(msg, "✅")
        no = reaction_count(msg, "❌")

        new_status = None
        if yes > 1 and no > 1:
            new_status = "decision_conflict"
        elif no > 1:
            new_status = "rejected_art"
            data["needs_art_revision"] = True
        elif yes > 1:
            new_status = "approved"

        if new_status and data.get("status") != new_status:
            data["status"] = new_status
            data["decision_at_utc"] = now
            data["discord_reactions"] = {"approved": yes, "rejected": no}
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed += 1
            print(f"{path.name}: {new_status} (✅ {yes} / ❌ {no})")

    print(f"Estados sincronizados: {changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
