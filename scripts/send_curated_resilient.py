import json
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import quote
from zoneinfo import ZoneInfo

import requests

from scripts import send_curated as core

_ORIG_GET = requests.get
_ORIG_POST = requests.post
_ORIG_PUT = requests.put
MAX_RETRIES = 8


def _retry_after(response):
    try:
        value = float((response.json() or {}).get("retry_after") or 0)
    except Exception:
        value = 0.0
    if value <= 0:
        try:
            value = float(response.headers.get("Retry-After") or 0)
        except Exception:
            value = 0.0
    return max(value, 0.6)


def _with_rate_limit(fn, *args, **kwargs):
    last = None
    for attempt in range(1, MAX_RETRIES + 1):
        response = fn(*args, **kwargs)
        last = response
        if response.status_code != 429:
            return response
        delay = min(_retry_after(response) + 0.25, 20.0)
        print(f"DISCORD_429 tentativa={attempt}/{MAX_RETRIES} espera={delay:.2f}s")
        time.sleep(delay)
    return last


def _post_retry(*args, **kwargs):
    return _with_rate_limit(_ORIG_POST, *args, **kwargs)


def _put_retry(*args, **kwargs):
    return _with_rate_limit(_ORIG_PUT, *args, **kwargs)


# O sender original continua sendo a fonte de verdade para montagem da mensagem,
# imagem, GPX e validações. Aqui só adicionamos resiliência de transporte.
core.requests.post = _post_retry
core.requests.put = _put_retry


def _descricao_esperada(data):
    descricao = core.mensagem_final(data)
    coords = core._coords_validas(data)
    bloco = core._bloco_coordenadas(coords)
    if bloco:
        descricao += "\n\n" + bloco
    if data.get("gerar_gpx", True) and coords:
        descricao += "\n\n🗺️ GPX anexado."
    return descricao[:4000]


def _mensagens_recentes():
    response = _with_rate_limit(
        _ORIG_GET,
        f"{core.DISCORD_API}/channels/{core.APPROVAL_CHANNEL_ID}/messages",
        headers=core._discord_headers(),
        params={"limit": 100},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    return payload if isinstance(payload, list) else []


def _mesma_aprovacao(message, data):
    embeds = message.get("embeds") or []
    if not embeds:
        return False
    embed = embeds[0] or {}
    return (
        str(embed.get("title") or "") == str(data.get("titulo") or "")[:256]
        and str(embed.get("url") or "") == str(data.get("source_url") or "")
        and str(embed.get("description") or "") == _descricao_esperada(data)
    )


def encontrar_aprovacao_existente(data):
    for message in _mensagens_recentes():
        if _mesma_aprovacao(message, data):
            return message
    return None


def garantir_reacoes(message_id):
    for emoji in ("✅", "❌"):
        response = _put_retry(
            f"{core.DISCORD_API}/channels/{core.APPROVAL_CHANNEL_ID}/messages/{message_id}/reactions/{quote(emoji, safe='')}/@me",
            headers=core._discord_headers(),
            timeout=30,
        )
        response.raise_for_status()
        time.sleep(0.35)


def marcar_enviado(path, data, message_id, reconciled=False):
    data["status"] = "sent"
    data["discord_approval_id"] = str(message_id)
    data["discord_reactions_ready"] = True
    data.pop("discord_reaction_setup_error", None)
    if not data.get("sent_at_utc"):
        data["sent_at_utc"] = datetime.now(ZoneInfo("UTC")).isoformat()
    if reconciled:
        data["approval_reconciled"] = True
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    core.QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    pending = []
    repairs = []

    for path in sorted(core.QUEUE_DIR.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"JSON inválido {path.name}: {exc}")
            continue

        status = str(data.get("status") or "")
        if status == "pending":
            if not str(data.get("_source_id") or "").strip():
                print(f"IGNORADO legado sem _source_id: {path.name}")
                continue
            pending.append((path, data))
        elif status == "sent" and data.get("discord_reactions_ready") is False and data.get("discord_approval_id"):
            repairs.append((path, data))

    failures = []

    for path, data in repairs:
        try:
            garantir_reacoes(str(data["discord_approval_id"]))
            data["discord_reactions_ready"] = True
            data.pop("discord_reaction_setup_error", None)
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"REAÇÕES REPARADAS: {path.name}")
        except Exception as exc:
            failures.append(f"{path.name}: reparo de reações: {exc}")
            print(f"ERRO REAÇÕES: {path.name}: {exc}")

    for path, data in pending:
        try:
            core.validar_item(data, path)

            existing = encontrar_aprovacao_existente(data)
            if existing:
                message_id = str(existing.get("id") or "")
                if not message_id:
                    raise RuntimeError("aprovação existente sem id")
                garantir_reacoes(message_id)
                marcar_enviado(path, data, message_id, reconciled=True)
                print(f"DISCORD APROVAÇÃO RECONCILIADA: {path.name} -> {message_id}")
                continue

            sent = core.enviar_discord(data)
            message_id = str(sent.get("id") or "")
            if not message_id:
                raise RuntimeError("Discord não retornou id da mensagem")
            marcar_enviado(path, data, message_id)
            print(f"DISCORD APROVAÇÃO: {path.name} -> {message_id}")
            time.sleep(0.4)
        except Exception as exc:
            failures.append(f"{path.name}: {exc}")
            print(f"ERRO: {path.name}: {exc}")

    if not pending and not repairs:
        print("Nenhum item curado pendente ou reação para reparar.")

    if failures:
        raise SystemExit("Falhas na fila curada:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
