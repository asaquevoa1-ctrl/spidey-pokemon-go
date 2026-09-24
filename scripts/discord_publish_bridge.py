import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

APPROVAL_CHANNEL_ID = os.getenv("APPROVAL_CHANNEL_ID", "1550963072464715997").strip()
PUBLIC_CHANNEL_ID = os.getenv("PUBLIC_CHANNEL_ID", "1550963136519999658").strip()
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
API = "https://discord.com/api/v10"
QUEUE_DIR = Path("queue/curated")
COORD_RE = re.compile(r"^-?\d{1,2}(?:\.\d+)?,-?\d{1,3}(?:\.\d+)?$")
TEST_MARKERS = ("🧪 TESTE TÉCNICO • E2E SPIDEY",)
APPROVAL_MARKER = "Aguardando aprovação"
TERMINAL_REJECTED = {"rejected", "rejected_art", "decision_conflict", "blocked_art_standard"}

if not TOKEN:
    raise SystemExit("DISCORD_BOT_TOKEN ausente")

AUTH = {
    "Authorization": f"Bot {TOKEN}",
    "User-Agent": "SpideyPokemonGO/2.0",
}


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


def reaction_count(message, emoji_name):
    for reaction in message.get("reactions") or []:
        emoji = reaction.get("emoji") or {}
        if str(emoji.get("name") or "") == emoji_name:
            try:
                return int(reaction.get("count") or 0)
            except (TypeError, ValueError):
                return 0
    return 0


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


def marcar_publicado(path, data, public_message_id, reconciled=False):
    data["status"] = "published"
    data["discord_public_id"] = str(public_message_id or "")
    data["published_at_utc"] = datetime.now(timezone.utc).isoformat()
    if reconciled:
        data["publication_reconciled"] = True
    else:
        data.pop("publication_reconciled", None)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def send_plain(text):
    r = requests.post(
        f"{API}/channels/{PUBLIC_CHANNEL_ID}/messages",
        headers={**AUTH, "Content-Type": "application/json"},
        json={"content": text[:2000]},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


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


def main():
    approval = get_messages(APPROVAL_CHANNEL_ID)
    published = get_messages(PUBLIC_CHANNEL_ID)
    published_by_signature = {sig: m for m in published if (sig := signature(m))}
    queue_by_approval = carregar_fila_por_aprovacao()
    copied = 0
    reconciled = 0
    active_new = False

    for m in sorted(approval, key=lambda x: int(x["id"])):
        mid = str(m.get("id") or "").strip()
        embeds = m.get("embeds") or []
        title = str((embeds[0] if embeds else {}).get("title") or "").strip()
        content = str(m.get("content") or "").strip()

        if any(marker in title or marker in content for marker in TEST_MARKERS):
            active_new = False
            continue

        if APPROVAL_MARKER.lower() in content.lower() and embeds:
            sig = signature(m)
            queue_entry = queue_by_approval.get(mid)

            # Fluxo Premium v1: a fila editorial é a fonte de verdade. A reação
            # só vira aprovação/reprovação depois que sync_approval_state gravar.
            if queue_entry:
                path, data = queue_entry
                status = str(data.get("status") or "").strip()
                if status == "published" or status in TERMINAL_REJECTED:
                    active_new = False
                    continue
                if status != "approved":
                    active_new = False
                    continue

                existing = published_by_signature.get(sig) if sig else None
                if existing:
                    marcar_publicado(path, data, existing.get("id"), reconciled=True)
                    reconciled += 1
                    active_new = False
                    print(f"RECONCILIADO {mid} -> {existing.get('id')}")
                    continue

                sent = send_full(m, strip_approval=True)
                if sig:
                    published_by_signature[sig] = sent
                marcar_publicado(path, data, sent.get("id"), reconciled=False)
                copied += 1
                active_new = True
                print(f"APROVADO {mid} -> {sent.get('id')}")
                continue

            # Compatibilidade com aprovações antigas que não têm item na fila.
            rejeicoes = reaction_count(m, "❌")
            aprovacoes = reaction_count(m, "✅")
            if rejeicoes > 1:
                print(f"REPROVADO LEGADO {mid}")
                active_new = False
                continue
            if aprovacoes > 1:
                existing = published_by_signature.get(sig) if sig else None
                if sig and not existing:
                    sent = send_full(m, strip_approval=True)
                    published_by_signature[sig] = sent
                    copied += 1
                    active_new = True
                    print(f"APROVADO LEGADO {mid} -> {sent.get('id')}")
                else:
                    active_new = False
                continue
            active_new = False
            continue

        # Compatibilidade com o fluxo antigo já existente no histórico.
        if title.startswith("✅ APROVADO"):
            sig = signature(m)
            existing = published_by_signature.get(sig) if sig else None
            if sig and not existing:
                sent = send_full(m)
                published_by_signature[sig] = sent
                copied += 1
                active_new = True
                print(f"PUBLICADO LEGADO {mid} -> {sent.get('id')}")
            else:
                active_new = False
            continue

        if active_new and COORD_RE.fullmatch(content.replace(" ", "")):
            raw = content.replace(" ", "")
            sent = send_plain(raw)
            copied += 1
            print(f"COORD {raw} -> {sent.get('id')}")
            continue

        if content or embeds:
            active_new = False

    print(f"Concluído. Novas mensagens publicadas: {copied}; reconciliadas: {reconciled}")


if __name__ == "__main__":
    main()
