import base64
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from urllib.parse import quote

import requests

REPO = os.getenv("GITHUB_REPOSITORY", "asaquevoa1-ctrl/spidey-pokemon-go").strip()
BRANCH = os.getenv("SPIDEY_ASSET_BRANCH", "main").strip() or "main"
SPIDEY_BASE = os.getenv("SPIDEY_BASE", "https://spidey-pokemon-go.onrender.com").rstrip("/")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()


def _slug(texto):
    s = str(texto or "").lower()
    mapa = str.maketrans("áàâãäéèêëíìîïóòôõöúùûüç", "aaaaaeeeeiiiiooooouuuuc")
    s = s.translate(mapa)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return (s[:70] or "spidey")


def _github_headers():
    if not GITHUB_TOKEN:
        raise RuntimeError("GITHUB_TOKEN ausente: arte não pode ser persistida.")
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "SpideyPokemonGO/1.0",
    }


def _asset_path(payload, source_id):
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    key = hashlib.sha256(
        (str(source_id) + "|" + str(payload.get("titulo")) + "|" + str(payload.get("mensagem"))).encode("utf-8")
    ).hexdigest()[:12]
    return f"assets/auto-curated/{stamp}/{_slug(payload.get('titulo'))}-{key}.png"


def _persistir_png(png, path):
    headers = _github_headers()
    api = f"https://api.github.com/repos/{REPO}/contents/{quote(path, safe='/')}"
    sha = None
    current = requests.get(api, headers=headers, params={"ref": BRANCH}, timeout=30)
    if current.status_code == 200:
        sha = current.json().get("sha")
    elif current.status_code != 404:
        raise RuntimeError(f"GitHub consulta asset HTTP {current.status_code}: {current.text[:500]}")

    body = {
        "message": f"Spidey: persistir arte curada {path.rsplit('/',1)[-1]}",
        "content": base64.b64encode(png).decode("ascii"),
        "branch": BRANCH,
    }
    if sha:
        body["sha"] = sha
    r = requests.put(api, headers=headers, json=body, timeout=60)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"GitHub persistência HTTP {r.status_code}: {r.text[:700]}")
    return f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{path}"


def gerar_persistir_e_enviar(payload, source_id):
    """ÚNICO caminho automático para aprovação com arte.

    1) gera arte padrão oficial no motor Spidey;
    2) persiste PNG no GitHub;
    3) envia /enviar com gerar_arte=False para reaproveitar exatamente a mesma imagem.
    """
    titulo = str(payload.get("titulo") or "📰 NOTÍCIA • Pokémon GO").strip()
    mensagem = str(payload.get("mensagem") or "").strip()
    if not mensagem:
        raise RuntimeError("Mensagem vazia")

    art = requests.post(
        f"{SPIDEY_BASE}/gerar-arte-padrao",
        json={"titulo": titulo, "mensagem": mensagem},
        timeout=210,
    )
    if art.status_code != 200 or not art.headers.get("content-type", "").startswith("image/"):
        raise RuntimeError(f"Arte padrão indisponível HTTP {art.status_code}: {art.text[:700]}")
    png = art.content
    if len(png) < 50000:
        raise RuntimeError(f"Arte padrão inválida/pequena: {len(png)} bytes")

    path = _asset_path(payload, source_id)
    image_url = _persistir_png(png, path)

    final = dict(payload)
    final.update({
        "imagem_url": image_url,
        "gerar_arte": False,
        "usar_premium": False,
        "permitir_fallback": False,
        "arte_padrao_spidey": True,
        "aprovar": True,
    })
    r = requests.post(f"{SPIDEY_BASE}/enviar", json=final, timeout=150)
    try:
        data = r.json()
    except ValueError:
        raise RuntimeError(f"Spidey /enviar HTTP {r.status_code}: {r.text[:700]}")
    if r.status_code != 200 or data.get("status") != "enviado" or data.get("etapa") != "aguardando_aprovacao":
        raise RuntimeError(f"Spidey recusou envio HTTP {r.status_code}: {json.dumps(data, ensure_ascii=False)[:900]}")
    if data.get("modo_arte") != "fornecida" or not data.get("arte"):
        raise RuntimeError(f"Spidey não reutilizou a arte persistida: {data}")
    data["asset_url"] = image_url
    data["asset_path"] = path
    return data


def main():
    payload = json.load(sys.stdin)
    source_id = payload.pop("_source_id", None) or hashlib.sha256(
        json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()[:16]
    result = gerar_persistir_e_enviar(payload, source_id)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
