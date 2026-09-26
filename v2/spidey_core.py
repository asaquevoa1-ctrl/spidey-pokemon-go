import base64
import hashlib
import json
import mimetypes
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parent
QUEUE_DIR = ROOT / "queue"
ASSET_DIR = ROOT / "assets_b64"
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
APPROVAL_CHANNEL = os.getenv("APPROVAL_CHANNEL_ID", "1550963072464715997").strip()
PUBLIC_CHANNEL = os.getenv("PUBLIC_CHANNEL_ID", "1550963136519999658").strip()
API = "https://discord.com/api/v10"
USER_AGENT = "SpideyPokemonGO-V2/1.3"


def now():
    return datetime.now(timezone.utc).isoformat()


def headers():
    return {"Authorization": f"Bot {TOKEN}", "User-Agent": USER_AGENT}


def request(method, url, **kwargs):
    last = None
    for attempt in range(1, 9):
        response = requests.request(method, url, **kwargs)
        last = response
        if response.status_code != 429:
            return response
        try:
            delay = float((response.json() or {}).get("retry_after") or 1.0)
        except Exception:
            delay = 1.0
        print(f"DISCORD_429 tentativa={attempt} espera={delay:.2f}s")
        time.sleep(min(delay + 0.25, 20))
    return last


def valid_image(data):
    return len(data) >= 10000 and (
        data.startswith(b"\xff\xd8\xff")
        or data.startswith(b"\x89PNG\r\n\x1a\n")
        or data.startswith(b"RIFF")
    )


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def local_b64_asset_bytes(stem):
    parts = sorted(ASSET_DIR.glob(f"{stem}.*"))
    if not parts:
        raise RuntimeError(f"asset base64 ausente: {stem}")
    encoded = "".join(part.read_text(encoding="utf-8").strip() for part in parts)
    try:
        data = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise RuntimeError(f"asset base64 inválido: {exc}") from exc
    if not valid_image(data):
        raise RuntimeError("asset base64 não é imagem válida")
    return data


def download_image(url):
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=60)
    response.raise_for_status()
    data = response.content
    if not valid_image(data):
        raise RuntimeError("imagem externa inválida")
    return data


def item_image_bytes(item):
    stem = str(item.get("image_b64_asset") or "").strip()
    if stem:
        data = local_b64_asset_bytes(stem)
        source = f"local_b64_asset:{stem}"
    else:
        url = str(item.get("image_url") or "").strip()
        if not url:
            raise RuntimeError("item sem arte")
        data = download_image(url)
        source = "external_url"

    actual = sha256(data)
    expected = str(item.get("source_art_sha256") or "").strip().lower()
    if expected and actual != expected:
        raise RuntimeError(f"hash da arte-fonte não confere: {actual}")
    print(f"V2_IMAGE_SOURCE {source} sha256={actual}")
    return data


def save(path, item):
    path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def reaction_count(message, emoji):
    for reaction in message.get("reactions") or []:
        if str((reaction.get("emoji") or {}).get("name") or "") == emoji:
            try:
                return int(reaction.get("count") or 0)
            except Exception:
                return 0
    return 0


def get_message(channel, message_id):
    response = request(
        "GET",
        f"{API}/channels/{channel}/messages/{message_id}",
        headers=headers(),
        timeout=30,
    )
    if response.status_code == 404:
        return None
    response.raise_for_status()
    return response.json()


def add_reactions(message_id):
    for emoji in ("✅", "❌"):
        response = request(
            "PUT",
            f"{API}/channels/{APPROVAL_CHANNEL}/messages/{message_id}/reactions/{quote(emoji, safe='')}/@me",
            headers=headers(),
            timeout=30,
        )
        response.raise_for_status()
        time.sleep(0.35)


def verified_approved_image(message, item):
    expected = str(item.get("approved_art_sha256") or "").strip().lower()
    if len(expected) != 64:
        raise RuntimeError("hash aprovado ausente")

    candidates = []
    for attachment in message.get("attachments") or []:
        url = str(attachment.get("url") or "").strip()
        filename = str(attachment.get("filename") or item.get("image_filename") or "spidey.jpg")
        mime = str(attachment.get("content_type") or mimetypes.guess_type(filename)[0] or "image/jpeg")
        if url:
            candidates.append((url, filename, mime, "attachment"))

    for embed in message.get("embeds") or []:
        image = embed.get("image") or {}
        for key in ("url", "proxy_url"):
            url = str(image.get(key) or "").strip()
            if url and not url.startswith("attachment://"):
                filename = str(item.get("image_filename") or "spidey.jpg")
                mime = mimetypes.guess_type(filename)[0] or "image/jpeg"
                candidates.append((url, filename, mime, f"embed_{key}"))

    seen = set()
    for url, filename, mime, origin in candidates:
        if url in seen:
            continue
        seen.add(url)
        try:
            data = download_image(url)
        except Exception as exc:
            print(f"V2_IMAGE_CANDIDATE_FAIL origin={origin} error={exc}")
            continue
        actual = sha256(data)
        if actual == expected:
            print(f"V2_IMAGE_VERIFIED origin={origin} sha256={actual}")
            return data, filename, mime

    # Discord pode omitir o anexo na releitura. Nesse caso, recarrega a arte
    # armazenada no V2 e só aceita bytes idênticos ao hash que foi aprovado.
    data = item_image_bytes(item)
    actual = sha256(data)
    if actual != expected:
        raise RuntimeError("arte armazenada mudou depois da aprovação")
    filename = str(item.get("image_filename") or "spidey.jpg")
    mime = mimetypes.guess_type(filename)[0] or "image/jpeg"
    print(f"V2_IMAGE_VERIFIED origin=item_source sha256={actual}")
    return data, filename, mime


def send_approval(path, item):
    image = item_image_bytes(item)
    image_hash = sha256(image)
    filename = str(item.get("image_filename") or "spidey.jpg")
    mime = mimetypes.guess_type(filename)[0] or "image/jpeg"
    payload = {
        "content": "🧪 **SPIDEY V2 GOLD** • Aguardando aprovação • ✅ aprovar | ❌ rejeitar",
        "embeds": [{
            "title": str(item["title"])[:256],
            "description": str(item.get("description") or "")[:4000],
            "url": item.get("source_url"),
            "color": 0x1478FF,
            "image": {"url": f"attachment://{filename}"},
            "footer": {"text": "V2 mínimo • Gold Standard → aprovação → publicação"},
        }],
        "attachments": [{"id": 0, "filename": filename}],
    }
    response = request(
        "POST",
        f"{API}/channels/{APPROVAL_CHANNEL}/messages",
        headers=headers(),
        data={"payload_json": json.dumps(payload, ensure_ascii=False)},
        files={"files[0]": (filename, image, mime)},
        timeout=90,
    )
    response.raise_for_status()
    sent = response.json()
    message_id = str(sent.get("id") or "")
    if not message_id:
        raise RuntimeError("Discord não retornou message id")
    add_reactions(message_id)
    item.update({
        "status": "sent",
        "approval_message_id": message_id,
        "approved_art_sha256": image_hash,
        "sent_at_utc": now(),
    })
    save(path, item)
    print("V2_SENT", message_id)


def publish(path, item, approval_message):
    image, filename, mime = verified_approved_image(approval_message, item)
    payload = {
        "content": "",
        "embeds": [{
            "title": str(item["title"])[:256],
            "description": str(item.get("description") or "")[:4000],
            "url": item.get("source_url"),
            "color": 0x1478FF,
            "image": {"url": f"attachment://{filename}"},
            "footer": {"text": "Spidey Pokémon GO"},
        }],
        "attachments": [{"id": 0, "filename": filename}],
    }
    response = request(
        "POST",
        f"{API}/channels/{PUBLIC_CHANNEL}/messages",
        headers=headers(),
        data={"payload_json": json.dumps(payload, ensure_ascii=False)},
        files={"files[0]": (filename, image, mime)},
        timeout=90,
    )
    response.raise_for_status()
    public = response.json()
    public_id = str(public.get("id") or "")
    if not public_id:
        raise RuntimeError("Discord não retornou id público")
    item.update({
        "status": "published",
        "public_message_id": public_id,
        "decision_at_utc": now(),
        "published_at_utc": now(),
        "published_art_sha256": sha256(image),
    })
    save(path, item)
    print("V2_PUBLISHED", public_id)


def sync(path, item):
    message_id = str(item.get("approval_message_id") or "")
    if not message_id:
        raise RuntimeError("status sent sem approval_message_id")
    message = get_message(APPROVAL_CHANNEL, message_id)
    if not message:
        print("V2_WAIT_MESSAGE")
        return

    yes = reaction_count(message, "✅")
    no = reaction_count(message, "❌")
    print(f"V2_REACTIONS yes={yes} no={no}")
    human_yes = yes >= 2
    human_no = no >= 2

    if human_yes and human_no:
        item.update({"status": "conflict", "decision_at_utc": now(), "reactions": {"yes": yes, "no": no}})
        save(path, item)
        print("V2_CONFLICT")
        return
    if human_no:
        item.update({"status": "rejected", "decision_at_utc": now(), "reactions": {"yes": yes, "no": no}})
        save(path, item)
        print("V2_REJECTED")
        return
    if human_yes:
        if item.get("publish_enabled") is not True:
            item.update({"status": "approved_hold", "decision_at_utc": now(), "reactions": {"yes": yes, "no": no}})
            save(path, item)
            print("V2_APPROVED_HOLD")
            return
        publish(path, item, message)


def main():
    if not TOKEN:
        raise SystemExit("DISCORD_BOT_TOKEN ausente")
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    queue_files = sorted(QUEUE_DIR.glob("*.json"))
    if len(queue_files) != 1:
        raise SystemExit(f"V2 exige exatamente 1 item no teste; encontrados={len(queue_files)}")

    path = queue_files[0]
    item = json.loads(path.read_text(encoding="utf-8"))
    status = str(item.get("status") or "")
    if status == "ready":
        send_approval(path, item)
    elif status == "sent":
        sync(path, item)
    else:
        print("V2_NOOP", status)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
