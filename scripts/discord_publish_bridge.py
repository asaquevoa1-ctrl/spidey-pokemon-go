import json
import os
import re

import requests

APPROVAL_CHANNEL_ID = os.getenv("APPROVAL_CHANNEL_ID", "1550963072464715997").strip()
PUBLIC_CHANNEL_ID = os.getenv("PUBLIC_CHANNEL_ID", "1550963136519999658").strip()
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
API = "https://discord.com/api/v10"
COORD_RE = re.compile(r"^-?\d{1,2}(?:\.\d+)?,-?\d{1,3}(?:\.\d+)?$")

if not TOKEN:
    raise SystemExit("DISCORD_BOT_TOKEN ausente")

AUTH = {
    "Authorization": f"Bot {TOKEN}",
    "User-Agent": "SpideyPokemonGO/1.0",
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


def send_plain(text):
    r = requests.post(
        f"{API}/channels/{PUBLIC_CHANNEL_ID}/messages",
        headers={**AUTH, "Content-Type": "application/json"},
        json={"content": text[:2000]},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def send_full(m):
    embeds = [clean_embed(e) for e in (m.get("embeds") or [])[:10]]
    components = clean_components(m.get("components") or [])
    payload = {
        "content": str(m.get("content") or "")[:2000],
        "embeds": embeds,
    }
    if components:
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

    published_signatures = {sig for m in published if (sig := signature(m))}
    copied = 0
    active_new = False

    for m in sorted(approval, key=lambda x: int(x["id"])):
        embeds = m.get("embeds") or []
        title = str((embeds[0] if embeds else {}).get("title") or "").strip()
        content = str(m.get("content") or "").strip()

        if title.startswith("✅ APROVADO"):
            sig = signature(m)
            if sig and sig not in published_signatures:
                sent = send_full(m)
                published_signatures.add(sig)
                copied += 1
                active_new = True
                print(f"PUBLICADO {m['id']} -> {sent.get('id')}")
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

    print(f"Concluído. Novas mensagens publicadas: {copied}")


if __name__ == "__main__":
    main()
