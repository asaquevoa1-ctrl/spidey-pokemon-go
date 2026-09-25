import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import requests

from send_curated import _baixar_arte

QUEUE = Path("queue/curated")
CHANNEL = os.getenv("APPROVAL_CHANNEL_ID", "1550963072464715997").strip()
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
API = "https://discord.com/api/v10"
TERMINAL_STATUSES = {"published", "rejected", "rejected_art", "decision_conflict", "blocked_art_standard"}
BINDING_VERSION = "spidey-approval-binding-v1"
BINDING_FIELDS = (
    "approval_binding_version",
    "approved_revision",
    "approved_image_url",
    "approved_discord_approval_id",
    "approved_art_sha256",
    "approved_at_utc",
)

HEADERS = {
    "Authorization": f"Bot {TOKEN}",
    "User-Agent": "SpideyPokemonGO/2.0",
}


def status_terminal(status):
    return str(status or "").strip() in TERMINAL_STATUSES


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


def _approval_image_bytes(message):
    for att in message.get("attachments") or []:
        url = str(att.get("url") or "").strip()
        content_type = str(att.get("content_type") or "").lower()
        filename = str(att.get("filename") or "").lower()
        if not url:
            continue
        if not (content_type.startswith("image/") or filename.endswith((".jpg", ".jpeg", ".png", ".webp"))):
            continue
        r = requests.get(url, headers={"User-Agent": "SpideyPokemonGO/2.0"}, timeout=60)
        r.raise_for_status()
        return r.content
    raise ValueError("mensagem de aprovação sem anexo de imagem")


def _current_revision(data):
    try:
        revision = int(data.get("art_revision") or 1)
    except (TypeError, ValueError) as exc:
        raise ValueError("art_revision inválida") from exc
    if revision < 1:
        raise ValueError("art_revision inválida")
    return revision


def _build_approval_binding(data, message, message_id, now):
    if str(data.get("status") or "").strip() not in {"sent", "approved"}:
        raise ValueError(f"status inválido para aprovação: {data.get('status')!r}")
    if data.get("needs_art_revision") is True:
        raise ValueError("item ainda marcado para revisão de arte")

    image_url = str(data.get("image_url") or "").strip()
    if not image_url:
        raise ValueError("image_url ausente")

    normalized_current_art = _baixar_arte(image_url)
    approval_attachment = _approval_image_bytes(message)
    current_hash = hashlib.sha256(normalized_current_art).hexdigest()
    approval_hash = hashlib.sha256(approval_attachment).hexdigest()
    if current_hash != approval_hash:
        raise ValueError("arte atual não é o arquivo exibido na mensagem aprovada")

    return {
        "approval_binding_version": BINDING_VERSION,
        "approved_revision": _current_revision(data),
        "approved_image_url": image_url,
        "approved_discord_approval_id": str(message_id),
        "approved_art_sha256": approval_hash,
        "approved_at_utc": now,
    }


def _clear_approval_binding(data):
    changed = False
    for key in BINDING_FIELDS:
        if key in data:
            data.pop(key, None)
            changed = True
    return changed


def main():
    if not TOKEN:
        raise SystemExit("DISCORD_BOT_TOKEN ausente")

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
        if status_terminal(data.get("status")):
            continue

        msg = get_message(mid)
        if not msg:
            continue

        yes = reaction_count(msg, "✅")
        no = reaction_count(msg, "❌")
        dirty = False
        new_status = None

        if yes > 1 and no > 1:
            new_status = "decision_conflict"
            dirty = _clear_approval_binding(data) or dirty
            if data.pop("approval_binding_error", None) is not None:
                dirty = True
        elif no > 1:
            new_status = "rejected_art"
            if data.get("needs_art_revision") is not True:
                data["needs_art_revision"] = True
                dirty = True
            dirty = _clear_approval_binding(data) or dirty
            if data.pop("approval_binding_error", None) is not None:
                dirty = True
        elif yes > 1:
            try:
                binding = _build_approval_binding(data, msg, mid, now)
            except Exception as exc:
                new_status = "decision_conflict"
                dirty = _clear_approval_binding(data) or dirty
                reason = str(exc)
                if data.get("approval_binding_error") != reason:
                    data["approval_binding_error"] = reason
                    dirty = True
                print(f"{path.name}: BLOQUEADO vínculo de aprovação inválido: {reason}")
            else:
                new_status = "approved"
                if data.get("needs_art_revision") is not False:
                    data["needs_art_revision"] = False
                    dirty = True
                if data.pop("approval_binding_error", None) is not None:
                    dirty = True
                for key, value in binding.items():
                    if data.get(key) != value:
                        data[key] = value
                        dirty = True

        if new_status:
            if data.get("status") != new_status:
                data["status"] = new_status
                dirty = True
            data["decision_at_utc"] = now
            reactions = {"approved": yes, "rejected": no}
            if data.get("discord_reactions") != reactions:
                data["discord_reactions"] = reactions
                dirty = True

        if dirty:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed += 1
            print(f"{path.name}: {data.get('status')} (✅ {yes} / ❌ {no})")

    print(f"Estados sincronizados: {changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
