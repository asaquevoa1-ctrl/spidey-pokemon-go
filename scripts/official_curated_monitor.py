import json
import os
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

import requests

from scripts.curated_dispatch import gerar_persistir_e_enviar

NEWS_URL = "https://pokemongo.com/pt-BR/news"
STATE = Path(os.getenv("OFFICIAL_STATE_FILE", "last_news.txt"))
MAX_NOVAS = 5


class NewsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.link = None
        self.textos = []
        self.noticias = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href", "")
        if "/news/" not in href:
            return
        url = urljoin(NEWS_URL, href)
        if url.rstrip("/") == NEWS_URL.rstrip("/"):
            return
        self.link = url
        self.textos = []

    def handle_data(self, data):
        if self.link:
            texto = data.strip()
            if texto:
                self.textos.append(texto)

    def handle_endtag(self, tag):
        if tag != "a" or not self.link:
            return
        titulo = " ".join(self.textos).strip()
        if titulo:
            item = (titulo, self.link)
            if item not in self.noticias:
                self.noticias.append(item)
        self.link = None
        self.textos = []


def buscar_noticias():
    r = requests.get(
        NEWS_URL,
        headers={"User-Agent": "Mozilla/5.0 (SpideyPokemonGO/1.0)"},
        timeout=30,
    )
    r.raise_for_status()
    parser = NewsParser()
    parser.feed(r.text)
    if not parser.noticias:
        raise RuntimeError("Nenhuma notícia encontrada na página oficial do Pokémon GO.")
    return parser.noticias


def main():
    noticias = buscar_noticias()
    topo_url = noticias[0][1]
    ultimo = STATE.read_text(encoding="utf-8").strip() if STATE.exists() else ""

    if not ultimo:
        STATE.write_text(topo_url + "\n", encoding="utf-8")
        print("Monitor oficial inicializado; notícia atual registrada sem republicar.")
        return 0

    urls = [url for _, url in noticias]
    if topo_url == ultimo:
        print("Sem nova notícia oficial.")
        return 0

    if ultimo in urls:
        novas = noticias[: urls.index(ultimo)]
    else:
        # O estado pode ter saído da primeira página. Para não gerar spam,
        # recuperamos apenas a notícia mais recente e avançamos o controle.
        novas = noticias[:1]
        print("Estado anterior não está mais na primeira página; recuperando somente a notícia mais recente.")

    enviadas = 0
    for titulo_fonte, url in reversed(novas[:MAX_NOVAS]):
        payload = {
            "titulo": "📰 OFICIAL • NOTÍCIA",
            "mensagem": f"{titulo_fonte}\n\n📌 Fonte: Pokémon GO oficial",
            "url": url,
            "gerar_gpx": False,
            "aprovar": True,
        }
        result = gerar_persistir_e_enviar(payload, "oficial-" + url)
        print(json.dumps(result, ensure_ascii=False))
        enviadas += 1

    STATE.write_text(topo_url + "\n", encoding="utf-8")
    print(f"Notícias oficiais enfileiradas: {enviadas}.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERRO OFICIAL CURADO: {exc}", file=sys.stderr, flush=True)
        raise
