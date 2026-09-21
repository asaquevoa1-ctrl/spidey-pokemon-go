import json
import os
import re
import sys
import unicodedata
from pathlib import Path

import requests

DISCORD_API = "https://discord.com/api/v10"
SPIDEY_ENDPOINT = os.getenv(
    "SPIDEY_ENDPOINT",
    "https://spidey-pokemon-go.onrender.com/enviar",
)
BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
CHANNEL_ID = os.getenv("SPS_CHANNEL_ID", "").strip()
STATE_FILE = Path(os.getenv("SPS_STATE_FILE", "last_sps_weekly.txt"))


def _sem_acentos(texto: str) -> str:
    normalizado = unicodedata.normalize("NFKD", texto or "")
    return "".join(c for c in normalizado if not unicodedata.combining(c)).lower()


def _texto_mensagem(msg: dict) -> str:
    partes = []
    conteudo = str(msg.get("content") or "").strip()
    if conteudo:
        partes.append(conteudo)

    for embed in msg.get("embeds") or []:
        titulo = str(embed.get("title") or "").strip()
        descricao = str(embed.get("description") or "").strip()
        if titulo:
            partes.append(titulo)
        if descricao:
            partes.append(descricao)
        for campo in embed.get("fields") or []:
            nome = str(campo.get("name") or "").strip()
            valor = str(campo.get("value") or "").strip()
            bloco = " — ".join(p for p in (nome, valor) if p)
            if bloco:
                partes.append(bloco)

    return "\n\n".join(partes).strip()


def _parece_eventos_da_semana(texto: str) -> bool:
    t = _sem_acentos(texto)
    marcadores_semana = (
        "events this week",
        "event this week",
        "this week's events",
        "this week in pokemon go",
        "weekly events",
        "weekly event",
        "eventos da semana",
        "eventos desta semana",
        "agenda da semana",
        "esta semana",
    )
    tem_semana = any(m in t for m in marcadores_semana)
    tem_evento = any(m in t for m in ("event", "evento", "raid", "spotlight", "research", "community"))

    # Datas comuns em posts semanais, sem exigir um formato específico.
    datas = re.findall(
        r"\b(?:mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|"
        r"segunda|terca|quarta|quinta|sexta|sabado|domingo|sep|sept|oct|nov|dec|"
        r"set|out|nov|dez|\d{1,2}[/-]\d{1,2})\b",
        t,
    )
    return tem_semana and tem_evento and len(datas) >= 1


def _ler_ultimo_id() -> str:
    try:
        return STATE_FILE.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return ""


def _salvar_ultimo_id(message_id: str) -> None:
    STATE_FILE.write_text(str(message_id).strip() + "\n", encoding="utf-8")


def _buscar_mensagens() -> list[dict]:
    if not BOT_TOKEN or not CHANNEL_ID:
        print(
            "SPS monitor aguardando configuração: DISCORD_BOT_TOKEN e SPS_CHANNEL_ID.",
            flush=True,
        )
        return []

    resposta = requests.get(
        f"{DISCORD_API}/channels/{CHANNEL_ID}/messages",
        params={"limit": 50},
        headers={"Authorization": f"Bot {BOT_TOKEN}"},
        timeout=30,
    )
    resposta.raise_for_status()
    dados = resposta.json()
    if not isinstance(dados, list):
        raise RuntimeError("Discord não retornou uma lista de mensagens.")
    return dados


def _url_mensagem(msg: dict) -> str | None:
    message_id = str(msg.get("id") or "").strip()
    guild_id = str(msg.get("guild_id") or "").strip()
    if guild_id and CHANNEL_ID and message_id:
        return f"https://discord.com/channels/{guild_id}/{CHANNEL_ID}/{message_id}"
    return None


def _montar_payload(msg: dict, texto: str) -> dict:
    limpo = re.sub(r"\n{3,}", "\n\n", texto).strip()
    if len(limpo) > 3300:
        limpo = limpo[:3297].rstrip() + "..."

    mensagem = (
        "📅 Resumo semanal detectado automaticamente no SPS.\n\n"
        f"{limpo}\n\n"
        "🔎 Fonte operacional: SPS\n"
        "🕷️ O Spidey só publica depois da sua aprovação."
    )

    return {
        "titulo": "🗓️ AGENDA • Eventos da semana • SPS",
        "mensagem": mensagem,
        "url": _url_mensagem(msg),
        "gerar_gpx": False,
        "gerar_arte": True,
        "permitir_fallback": False,
        "aprovar": True,
    }


def _enviar_spidey(payload: dict) -> bool:
    resposta = requests.post(SPIDEY_ENDPOINT, json=payload, timeout=150)

    # Sem arte premium, o Spidey deve segurar o post e tentar novamente depois.
    if resposta.status_code == 503:
        try:
            diagnostico = resposta.json()
        except ValueError:
            diagnostico = resposta.text[:500]
        print(f"SPS encontrado, mas aguardando arte premium: {diagnostico}", flush=True)
        return False

    resposta.raise_for_status()
    dados = resposta.json()
    ok = (
        dados.get("status") == "enviado"
        and dados.get("etapa") == "aguardando_aprovacao"
        and dados.get("arte") is True
    )
    if not ok:
        raise RuntimeError(f"Resposta inesperada do Spidey: {json.dumps(dados, ensure_ascii=False)}")
    print("OK: eventos da semana do SPS enviados para aprovação com arte.", flush=True)
    return True


def main() -> int:
    mensagens = _buscar_mensagens()
    if not mensagens:
        return 0

    ultimo_id = _ler_ultimo_id()

    # A API do Discord retorna da mais nova para a mais antiga.
    for msg in mensagens:
        message_id = str(msg.get("id") or "").strip()
        if not message_id or message_id == ultimo_id:
            if message_id == ultimo_id:
                break
            continue

        texto = _texto_mensagem(msg)
        if not texto or not _parece_eventos_da_semana(texto):
            continue

        print(f"SPS semanal detectado: {message_id}", flush=True)
        if _enviar_spidey(_montar_payload(msg, texto)):
            _salvar_ultimo_id(message_id)
        return 0

    print("Nenhum novo resumo semanal do SPS.", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as erro:
        print(f"ERRO SPS: {erro}", file=sys.stderr, flush=True)
        raise
