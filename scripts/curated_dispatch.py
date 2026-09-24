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
    """Fila única de entrada do Spidey.

    Este módulo não cria arte e não envia conteúdo para aprovação. Ele apenas
    persiste o item detectado em queue/pending. O estágio seguinte usa a mídia
    real da fonte, valida a imagem e monta o card com identidade discreta do
    Spidey antes de enviar para o Discord.

    O valor de status `aguardando_arte_chatgpt` é mantido temporariamente como
    chave de compatibilidade com itens e automações já existentes. A etapa
    editorial oficial é `aguardando_curadoria_midia`.
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
        "etapa_editorial": "aguardando_curadoria_midia",
        "pipeline": "source_media_spidey",
        "media_policy": str(payload.get("media_policy") or "source_first"),
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
        "etapa": "aguardando_curadoria_midia",
        "queue_path": path,
        "arte": False,
        "discord": False,
    }
