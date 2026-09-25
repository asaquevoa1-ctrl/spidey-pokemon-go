import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

try:
    from .send_curated import _baixar_arte
except ImportError:
    from send_curated import _baixar_arte

APPROVAL_CHANNEL_ID = os.getenv("APPROVAL_CHANNEL_ID", "1550963072464715997").strip()
PUBLIC_CHANNEL_ID = os.getenv("PUBLIC_CHANNEL_ID", "1550963136519999658").strip()
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
API = "https://discord.com/api/v10"
QUEUE_DIR = Path("queue/curated")
COORD_RE = re.compile(r"^-?\d{1,2}(?:\.\d+)?,-?\d{1,3}(?:\.\d+)?$")
TEST_MARKERS = ("🧪 TESTE TÉCNICO • E2E SPIDEY",)
APPROVAL_MARKER = "Aguardando aprovação"
TERMINAL_REJECTED = {"rejected", "rejected_art", "decision_conflict", "blocked_art_standard"}
BINDING_VERSION = "spidey-approval-binding-v1"

AUTH = {
    "Authorization": f"Bot {TOKEN}",
    "User-Agent": "SpideyPokemonGO/2.0",
}


def status_publicavel(status):
    """Somente uma decisão editorial explicitamente aprovada pode ir ao canal público."""
    return str(status or "").strip() == "approved"


def get_messages(channel_id, limit=100):
    r = requests.get(
        f"{API}/channels/{channel_id}/messages",
        headers=AUTH,
        params={"limit": limit},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def clean_embed(e):
    out = {}
    for k in ("title", "description", "url", "color", "timestamp"):
        if e.get(k) is not None:
            out[k] = e[k]
    if e.get("footer"):
        footer = e["footer"]
        text = str(footer.get("text") or "")
        if "reaja com" not in text.lower():
            out["footer"] = {k: footer[k] for k in ("text", "icon_url") if footer.get(k)}
    if e.get("author"):
        author = e["author"]
        out["author"] = {k: author[k] for k in ("name", "url", "icon_url") if author.get(k)}
    if e.get("thumbnail", {}).get("url"):
        out["thumbnail"] = {"url": e["thumbnail"]["url"]}
    if e.get("image", {}).get("url"):
        out["image"] = {"url": e["image"]["url"]}
    if e.get("fields"):
        out["fields"] = [
            {
                "name": str(f.get("name", ""))[:256],
                "value": str(f.get("value", ""))[:1024],
                "inline": bool(f.get("inline", False)),
            }
            for f in e["fields"][:25]
        ]
    return out


def clean_components(components):
    rows = []
    for row in components or []:
        buttons = []
        for c in row.get("components") or []:
            if c.get("type") == 2 and c.get("style") == 5 and c.get("url"):
                b = {
                    "type": 2,
                    "style": 5,
                    "label": str(c.get("label") or "Abrir")[:80],
                    "url": c["url"],
                }
                if c.get("emoji"):
                    emoji = c["emoji"]
                    b["emoji"] = {k: emoji[k] for k in ("id", "name", "animated") if emoji.get(k) is not None}
                buttons.append(b)
        if buttons:
            rows.append({"type": 1, "components": buttons[:5]})
    return rows[:5]


def signature(m):
    embeds = m.get("embeds") or []
    if not embeds:
        return None
    e = embeds[0]
    return (
        str(e.get("title") or "").strip(),
        str(e.get("description") or "").strip(),
        str(e.get("url") or "").strip(),
    )


def _message_image_bytes(message):
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
    raise ValueError("mensagem sem anexo de imagem")


def _message_image_sha256(message):
    return hashlib.sha256(_message_image_bytes(message)).hexdigest()


def _current_art_sha256(data):
    image_url = str(data.get("image_url") or "").strip()
    if not image_url:
        raise ValueError("image_url ausente")
    return hashlib.sha256(_baixar_arte(image_url)).hexdigest()


def validar_vinculo_aprovacao(data, message, message_id):
    if not status_publicavel(data.get("status")):
        return False, "status não aprovado"
    if data.get("needs_art_revision") is True:
        return False, "needs_art_revision=true"
    if str(data.get("approval_binding_version") or "") != BINDING_VERSION:
        return False, "binding de aprovação ausente ou antigo"

    try:
        current_revision = int(data.get("art_revision") or 1)
        approved_revision = int(data.get("approved_revision"))
    except (TypeError, ValueError):
        return False, "revisão aprovada inválida"
    if current_revision != approved_revision:
        return False, f"revisão atual R{current_revision} difere da aprovada R{approved_revision}"

    current_image = str(data.get("image_url") or "").strip()
    approved_image = str(data.get("approved_image_url") or "").strip()
    if not current_image or current_image != approved_image:
        return False, "image_url atual difere da image_url aprovada"

    current_mid = str(data.get("discord_approval_id") or "").strip()
    approved_mid = str(data.get("approved_discord_approval_id") or "").strip()
    if not current_mid or current_mid != str(message_id) or approved_mid != str(message_id):
        return False, "mensagem aprovada não é a mensagem corrente da revisão"

    approved_hash = str(data.get("approved_art_sha256") or "").strip().lower()
    if len(approved_hash) != 64:
        return False, "hash da arte aprovada ausente"

    try:
        current_hash = _current_art_sha256(data)
        approval_hash = _message_image_sha256(message)
    except Exception as exc:
        return False, f"não foi possível validar arte: {exc}"

    if current_hash != approved_hash:
        return False, "arquivo atual da arte mudou após a aprovação"
    if approval_hash != approved_hash:
        return False, "anexo da mensagem aprovada não corresponde ao hash aprovado"

    return True, approved_hash


def carregar_fila_por_aprovacao():
    por_id = {}
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    for path in sorted(QUEUE_DIR.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"JSON inválido {path.name}: {exc}")
            continue
        mid = str(data.get("discord_approval_id") or "").strip()
        if mid:
            por_id[mid] = (path, data)
    return por_id


def marcar_bloqueio(path, data, reason):
    if data.get("publication_block_reason") == reason:
        return
    data["publication_block_reason"] = reason
    data["publication_blocked_at_utc"] = datetime.now(timezone.utc).isoformat()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def marcar_publicado(path, data, public_message_id, approved_hash, reconciled=False):
    data["status"] = "published"
    data["discord_public_id"] = str(public_message_id or "")
    data["published_at_utc"] = datetime.now(timezone.utc).isoformat()
    data["published_revision"] = data.get("approved_revision")
    data["published_image_url"] = data.get("approved_image_url")
    data["published_approval_id"] = data.get("approved_discord_approval_id")
    data["published_art_sha256"] = approved_hash
    data.pop("publication_block_reason", None)
    data.pop("publication_blocked_at_utc", None)
    if reconciled:
        data["publication_reconciled"] = True
    else:
        data.pop("publication_reconciled", None)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def send_full(m, strip_approval=False):
    embeds = [clean_embed(e) for e in (m.get("embeds") or [])[:10]]
    components = clean_components(m.get("components") or [])
    content = str(m.get("content") or "")[:2000]
    if strip_approval and APPROVAL_MARKER.lower() in content.lower():
        content = ""
    payload = {"content": content, "embeds": embeds}
    if components and not strip_approval:
        payload["components"] = components

    files = []
    attachments_meta = []
    image_filename = None
    for att in (m.get("attachments") or [])[:10]:
        url = att.get("url")
        filename = str(att.get("filename") or "arquivo")
        if not url:
            continue
        data = requests.get(url, timeout=60)
        data.raise_for_status()
        idx = len(files)
        ctype = att.get("content_type") or "application/octet-stream"
        files.append((f"files[{idx}]", (filename, data.content, ctype)))
        attachments_meta.append({"id": idx, "filename": filename})
        if image_filename is None and str(ctype).startswith("image/"):
            image_filename = filename

    if image_filename and embeds:
        embeds[0]["image"] = {"url": f"attachment://{image_filename}"}

    if files:
        payload["attachments"] = attachments_meta
        r = requests.post(
            f"{API}/channels/{PUBLIC_CHANNEL_ID}/messages",
            headers=AUTH,
            data={"payload_json": json.dumps(payload, ensure_ascii=False)},
            files=files,
            timeout=90,
        )
    else:
        r = requests.post(
            f"{API}/channels/{PUBLIC_CHANNEL_ID}/messages",
            headers={**AUTH, "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
    r.raise_for_status()
    return r.json()


def encontrar_publicacao_existente(published, sig, approved_hash):
    if not sig:
        return None
    for message in published:
        if signature(message) != sig:
            continue
        try:
            if _message_image_sha256(message) == approved_hash:
                return message
        except Exception as exc:
            print(f"RECONCILIAÇÃO IGNORADA {message.get('id')}: {exc}")
    return None


def main():
    if not TOKEN:
        raise SystemExit("DISCORD_BOT_TOKEN ausente")

    approval = get_messages(APPROVAL_CHANNEL_ID)
    published = get_messages(PUBLIC_CHANNEL_ID)
    queue_by_approval = carregar_fila_por_aprovacao()
    copied = 0
    reconciled = 0

    for m in sorted(approval, key=lambda x: int(x["id"])):
        mid = str(m.get("id") or "").strip()
        embeds = m.get("embeds") or []
        title = str((embeds[0] if embeds else {}).get("title") or "").strip()
        content = str(m.get("content") or "").strip()

        if any(marker in title or marker in content for marker in TEST_MARKERS):
            continue

        if APPROVAL_MARKER.lower() in content.lower() and embeds:
            sig = signature(m)
            queue_entry = queue_by_approval.get(mid)
            if not queue_entry:
                print(f"BLOQUEADO LEGADO {mid}: aprovação sem item editorial corrente")
                continue

            path, data = queue_entry
            status = str(data.get("status") or "").strip()
            if status == "published" or status in TERMINAL_REJECTED:
                continue
            if not status_publicavel(status):
                continue

            valid, detail = validar_vinculo_aprovacao(data, m, mid)
            if not valid:
                reason = f"publicação bloqueada: {detail}"
                marcar_bloqueio(path, data, reason)
                print(f"BLOQUEADO {mid}: {detail}")
                continue

            approved_hash = detail
            existing = encontrar_publicacao_existente(published, sig, approved_hash)
            if existing:
                marcar_publicado(path, data, existing.get("id"), approved_hash, reconciled=True)
                reconciled += 1
                print(f"RECONCILIADO {mid} -> {existing.get('id')}")
                continue

            sent = send_full(m, strip_approval=True)
            published.append(sent)
            marcar_publicado(path, data, sent.get("id"), approved_hash, reconciled=False)
            copied += 1
            print(f"APROVADO {mid} -> {sent.get('id')}")
            continue

        if title.startswith("✅ APROVADO"):
            print(f"BLOQUEADO LEGADO {mid}: publicação automática antiga desativada")
            continue

    print(f"Concluído. Novas mensagens publicadas: {copied}; reconciliadas: {reconciled}")


if __name__ == "__main__":
    main()
