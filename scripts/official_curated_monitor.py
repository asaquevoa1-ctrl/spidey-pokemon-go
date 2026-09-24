import json
import os
import sys
from pathlib import Path

import requests

from scripts.curated_dispatch import gerar_persistir_e_enviar

BASE = os.getenv("SPIDEY_BASE", "https://spidey-pokemon-go.onrender.com").rstrip("/")
STATE = Path(os.getenv("OFFICIAL_STATE_FILE", "last_news.txt"))


def main():
    r = requests.get(f"{BASE}/check-oficial", timeout=60)
    r.raise_for_status()
    data = r.json()
    url = str(data.get("url") or "").strip()
    titulo_fonte = str(data.get("titulo") or "").strip()
    if not url or not titulo_fonte:
        raise RuntimeError(f"Resposta oficial inválida: {data}")

    ultimo = STATE.read_text(encoding="utf-8").strip() if STATE.exists() else ""
    if not ultimo:
        STATE.write_text(url + "\n", encoding="utf-8")
        print("Monitor oficial inicializado; notícia atual registrada sem republicar.")
        return 0
    if url == ultimo:
        print("Sem nova notícia oficial.")
        return 0

    payload = {
        "titulo": "📰 OFICIAL • NOTÍCIA",
        "mensagem": f"{titulo_fonte}\n\n📌 Fonte: Pokémon GO oficial",
        "url": url,
        "gerar_gpx": False,
        "aprovar": True,
    }
    result = gerar_persistir_e_enviar(payload, "oficial-" + url)
    print(json.dumps(result, ensure_ascii=False))
    STATE.write_text(url + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERRO OFICIAL CURADO: {exc}", file=sys.stderr, flush=True)
        raise
