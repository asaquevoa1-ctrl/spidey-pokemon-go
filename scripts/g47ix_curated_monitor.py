import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import requests

from scripts.curated_dispatch import gerar_persistir_e_enviar

STATE = Path(os.getenv("G47IX_STATE_FILE", "last_g47ix.txt"))
FX_URL = "https://api.fxtwitter.com/2/profile/g47ix/statuses?count=20"


def normalizar(value):
    value = unicodedata.normalize("NFKD", value or "")
    return "".join(ch for ch in value if not unicodedata.combining(ch)).lower()


def traduzir_ptbr(value):
    if not value:
        return value
    base = f" {normalizar(value)} "
    marcadores = (" the ", " and ", " will ", " available ", " you ", " shiny ", " event ", " raids ", " research ")
    if sum(m in base for m in marcadores) < 2:
        return value
    try:
        r = requests.get(
            "https://translate.googleapis.com/translate_a/single",
            params={"client": "gtx", "sl": "auto", "tl": "pt", "dt": "t", "q": value},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15,
        )
        r.raise_for_status()
        payload = r.json()
        translated = "".join(part[0] for part in (payload[0] or []) if part and isinstance(part, list) and part[0]).strip()
        return translated or value
    except Exception as exc:
        print(f"Tradução automática indisponível: {exc}", file=sys.stderr)
        return value


def classificar(texto):
    base = normalizar(texto)
    codigo = ["promo code", "redeem code", "codigo promocional", " codigo ", " code "]
    evento = ["community day", "raid day", "research day", "hatch day", "spotlight hour", "raid hour", "go fest", "city safari", "safari zone", "event", "evento", "max battle day"]
    atualizacao = ["update", "updated", "new feature", "feature update", "move update", "balance", "season", "temporada", "version", "versao", "mudanca", "changes"]
    irrelevante = ["giveaway", "retweet", "repost", "follow me", "subscribe", "merch", "store", "meme", "personal post"]
    pokemon = ["pokemon go", "pokemongo", "raid", "research", "pokestop", "gym", "trainer", "shadow", "mega", "dynamax", "gigantamax", "community day", "spotlight", "team go rocket", "gbl", "battle league", "pikachu", "xurkitree", "pheromosa", "buzzwole", "shiny", "tour"]
    if any(x in base for x in codigo):
        return "codigo"
    if any(x in base for x in evento) or re.search(r"\bcd\b", base):
        return "evento"
    if any(x in base for x in atualizacao):
        return "atualizacao"
    if any(x in base for x in irrelevante) and not any(x in base for x in pokemon):
        return "irrelevante"
    if not any(x in base for x in pokemon):
        return "irrelevante"
    return "noticia"


def main():
    r = requests.get(FX_URL, headers={"User-Agent": "Mozilla/5.0"}, timeout=60)
    if r.status_code != 200:
        print(f"FxTwitter indisponível HTTP {r.status_code}; próxima rodada tentará novamente.")
        return 0
    data = r.json()
    posts = [x for x in (data.get("results") or []) if isinstance(x, dict) and x.get("type") == "status" and str(x.get("id", "")).isdigit()]
    if not posts:
        print("FxTwitter sem publicações utilizáveis.")
        return 0
    post = max(posts, key=lambda x: int(x["id"]))
    post_id = str(post["id"])
    text = str(post.get("text") or "").strip()
    created_ts = post.get("created_timestamp")
    if not created_ts:
        created_ts = ((int(post_id) >> 22) + 1288834974657) / 1000
    if float(created_ts) > 10_000_000_000:
        created_ts = float(created_ts) / 1000
    age_hours = max(0, (datetime.now(timezone.utc).timestamp() - float(created_ts)) / 3600)

    ultimo = STATE.read_text(encoding="utf-8").strip() if STATE.exists() else ""
    if not ultimo:
        STATE.write_text(post_id + "\n", encoding="utf-8")
        print("Monitor G47IX curado inicializado sem republicar.")
        return 0
    if int(post_id) <= int(ultimo):
        print("Nenhuma publicação nova do G47IX.")
        return 0
    if age_hours > 48:
        STATE.write_text(post_id + "\n", encoding="utf-8")
        print(f"Publicação antiga ({age_hours:.1f}h), registrada sem enviar.")
        return 0

    categoria = classificar(text)
    if categoria == "irrelevante":
        STATE.write_text(post_id + "\n", encoding="utf-8")
        print("Publicação G47IX irrelevante, registrada sem enviar.")
        return 0

    resumo = traduzir_ptbr(text)
    icone, rotulo = {
        "evento": ("📅", "EVENTO"),
        "codigo": ("🎁", "CÓDIGO"),
        "atualizacao": ("🔄", "ATUALIZAÇÃO"),
        "noticia": ("📰", "NOTÍCIA"),
    }[categoria]
    url = post.get("url") or f"https://x.com/g47ix/status/{post_id}"
    payload = {
        "titulo": f"{icone} G47IX • {rotulo}",
        "mensagem": f"{resumo}\n\n📌 Fonte: G47IX",
        "url": url,
        "gerar_gpx": False,
        "aprovar": True,
    }
    result = gerar_persistir_e_enviar(payload, f"g47ix-{post_id}")
    print(json.dumps(result, ensure_ascii=False))
    STATE.write_text(post_id + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERRO G47IX CURADO: {exc}", file=sys.stderr, flush=True)
        raise
