import base64
import hashlib
import json
import os
import re
from datetime import datetime, timezone
from urllib.parse import quote

import requests

REPO = os.getenv("GITHUB_REPOSITORY", "asaquevoa1-ctrl/spidey-pokemon-go").strip()
BRANCH = os.getenv("SPIDEY_ASSET_BRANCH", "main").strip() or "main"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()


def _slug(texto):
    s = str(texto or "").lower()
    mapa = str.maketrans("áàâãäéèêëíìîïóòôõöúùûüç", "aaaaaeeeeiiiiooooouuuuc")
    s = s.translate(mapa)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:70] or "spidey"


def _github_headers():
    if not GITHUB_TOKEN:
        raise RuntimeError("GITHUB_TOKEN ausente: item não pode ser enfileirado.")
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "SpideyPokemonGO/1.0",
    }


def _queue_path(payload, source_id):
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    key = hashlib.sha256(
        (str(source_id) + "|" + str(payload.get("titulo")) + "|" + str(payload.get("mensagem"))).encode("utf-8")
    ).hexdigest()[:12]
    return f"queue/pending/{stamp}/{_slug(payload.get('titulo'))}-{key}.json"


def _put_json(path, payload):
    headers = _github_headers()
    api = f"https://api.github.com/repos/{REPO}/contents/{quote(path, safe='/')}"
    current = requests.get(api, headers=headers, params={"ref": BRANCH}, timeout=30)
    if current.status_code == 200:
        return False
    if current.status_code != 404:
        raise RuntimeError(f"GitHub consulta fila HTTP {current.status_code}: {current.text[:500]}")

    raw = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
    body = {
        "message": f"Spidey: enfileirar conteúdo {path.rsplit('/',1)[-1]}",
        "content": base64.b64encode(raw).decode("ascii"),
        "branch": BRANCH,
    }
    r = requests.put(api, headers=headers, json=body, timeout=60)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"GitHub fila HTTP {r.status_code}: {r.text[:700]}")
    return True


def gerar_persistir_e_enviar(payload, source_id):
    """Fila ÚNICA do Spidey.

    Este módulo NÃO gera arte e NÃO envia para aprovação.
    Ele somente persiste o conteúdo detectado em queue/pending.

    A arte final deve ser produzida no ChatGPT usando o padrão visual já
    aprovado e o logo oficial do Spidey. Só depois a arte pronta pode seguir
    para o Discord.
    """
    titulo = str(payload.get("titulo") or "📰 NOTÍCIA • Pokémon GO").strip()
    mensagem = str(payload.get("mensagem") or "").strip()
    if not mensagem:
        raise RuntimeError("Mensagem vazia")

    item = dict(payload)
    item.update({
        "titulo": titulo,
        "mensagem": mensagem,
        "_source_id": str(source_id),
        "status": "aguardando_arte_chatgpt",
        "pipeline": "chatgpt_spidey_oficial",
        "arte_obrigatoria": True,
        "arte_padrao_spidey": True,
        "usar_logo_oficial": True,
        "proibir_render_arte": True,
        "proibir_fallback": True,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
    })

    path = _queue_path(item, source_id)
    criado = _put_json(path, item)
    return {
        "status": "enfileirado" if criado else "ja_enfileirado",
        "etapa": "aguardando_arte_chatgpt",
        "queue_path": path,
        "arte": False,
        "discord": False,
    }
