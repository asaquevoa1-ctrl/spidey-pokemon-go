import json
import os
import re
import sys
import unicodedata
from pathlib import Path

import requests

DISCORD_API = "https://discord.com/api/v10"
BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
CHANNEL_ID = os.getenv("DISCORD_SOURCE_CHANNEL_ID", "1550962861998866564").strip()
SPIDEY_ENDPOINT = os.getenv("SPIDEY_ENDPOINT", "https://spidey-pokemon-go.onrender.com/enviar")
STATE_FILE = Path(os.getenv("DISCORD_SOURCE_STATE_FILE", "last_discord_source.txt"))

COORD_RE = re.compile(r"(?<!\d)(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})(?!\d)")


def normalizar(texto: str) -> str:
    base = unicodedata.normalize("NFKD", texto or "")
    return "".join(c for c in base if not unicodedata.combining(c)).lower()


def blocos(msg: dict) -> list[dict]:
    out = [msg]
    for snapshot in msg.get("message_snapshots") or []:
        out.append(snapshot.get("message") or snapshot)
    return out


def texto_mensagem(msg: dict) -> str:
    partes = []
    for bloco in blocos(msg):
        conteudo = str(bloco.get("content") or "").strip()
        if conteudo:
            partes.append(conteudo)
        for embed in bloco.get("embeds") or []:
            for campo in ("title", "description"):
                valor = str(embed.get(campo) or "").strip()
                if valor:
                    partes.append(valor)
            for field in embed.get("fields") or []:
                nome = str(field.get("name") or "").strip()
                valor = str(field.get("value") or "").strip()
                if nome or valor:
                    partes.append(" — ".join(x for x in (nome, valor) if x))
    return "\n".join(partes).strip()


def eh_semanal(texto: str) -> bool:
    t = normalizar(texto)
    return any(x in t for x in (
        "go weekly", "this week in pokemon go", "events this week",
        "weekly events", "weekly event", "eventos da semana",
        "agenda da semana", "esta semana",
    ))


def extrair_coordenadas(texto: str) -> list[list[float]]:
    saida = []
    vistos = set()
    for lat_s, lon_s in COORD_RE.findall(texto or ""):
        lat, lon = float(lat_s), float(lon_s)
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            continue
        chave = (round(lat, 7), round(lon, 7))
        if chave in vistos:
            continue
        vistos.add(chave)
        saida.append([lat, lon])
    return saida


def titulo_evento(texto: str) -> str:
    for linha in texto.splitlines():
        linha = re.sub(r"^[#>*\s]+", "", linha).strip()
        linha = re.sub(r"<:[^:>]+:\d+>", "", linha).strip()
        if linha and not linha.startswith("<@"):
            return linha[:120]
    return "Evento detectado no SPS"


def traduzir_basico(texto: str) -> str:
    trocas = {
        "Monday": "Segunda-feira",
        "Tuesday": "Terça-feira",
        "Wednesday": "Quarta-feira",
        "Thursday": "Quinta-feira",
        "Friday": "Sexta-feira",
        "Saturday": "Sábado",
        "Sunday": "Domingo",
        "January": "janeiro",
        "February": "fevereiro",
        "March": "março",
        "April": "abril",
        "May": "maio",
        "June": "junho",
        "July": "julho",
        "August": "agosto",
        "September": "setembro",
        "October": "outubro",
        "November": "novembro",
        "December": "dezembro",
        "Local Time": "horário local",
        "Location": "Local",
    }
    limpo = re.sub(r"<@&\d+>", "", texto)
    limpo = re.sub(r"<:[^:>]+:\d+>", "", limpo)
    limpo = re.sub(r"\[Velocity\]\([^)]*\)", "", limpo, flags=re.I)
    for origem, destino in trocas.items():
        limpo = limpo.replace(origem, destino)
    limpo = re.sub(r"[ \t]+", " ", limpo)
    limpo = re.sub(r"\n{3,}", "\n\n", limpo).strip()
    return limpo[:3300]


def slug(texto: str) -> str:
    s = normalizar(texto)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return (s[:60] or "evento-sps") + ".gpx"


def ler_estado() -> str:
    try:
        return STATE_FILE.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return ""


def salvar_estado(mid: str) -> None:
    STATE_FILE.write_text(mid + "\n", encoding="utf-8")


def buscar() -> list[dict]:
    if not BOT_TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN ausente")
    r = requests.get(
        f"{DISCORD_API}/channels/{CHANNEL_ID}/messages",
        headers={
            "Authorization": f"Bot {BOT_TOKEN}",
            "User-Agent": "SpideyPokemonGO/1.0",
            "Accept": "application/json",
        },
        params={"limit": 50},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def url_mensagem(msg: dict) -> str | None:
    guild = str(msg.get("guild_id") or "").strip()
    mid = str(msg.get("id") or "").strip()
    if guild and mid:
        return f"https://discord.com/channels/{guild}/{CHANNEL_ID}/{mid}"
    return None


def enviar(msg: dict, texto: str) -> bool:
    coords = extrair_coordenadas(texto)
    nome = titulo_evento(texto)
    corpo = traduzir_basico(texto)
    payload = {
        "titulo": f"📍 EVENTO • {nome}",
        "mensagem": (
            "Evento detectado automaticamente a partir de uma mensagem encaminhada do SPS.\n\n"
            + corpo
            + "\n\n🔎 Fonte operacional: SPS\n🕷️ O Spidey só publica depois da sua aprovação."
        ),
        "url": url_mensagem(msg),
        "coordenadas": coords,
        "gerar_gpx": bool(coords),
        "gpx_nome": slug(nome),
        "gerar_arte": True,
        "permitir_fallback": False,
        "aprovar": True,
    }
    r = requests.post(SPIDEY_ENDPOINT, json=payload, timeout=180)
    if r.status_code == 503:
        print("Evento SPS detectado, mas aguardando arte premium; item mantido pendente.", flush=True)
        print(r.text[:500], flush=True)
        return False
    r.raise_for_status()
    data = r.json()
    ok = data.get("status") == "enviado" and data.get("etapa") == "aguardando_aprovacao"
    if not ok:
        raise RuntimeError(f"Resposta inesperada do Spidey: {json.dumps(data, ensure_ascii=False)}")
    print(
        f"OK: evento SPS enviado para aprovação: {nome} | coords={len(coords)} | gpx={bool(coords)} | arte={data.get('arte')}",
        flush=True,
    )
    return True


def main() -> int:
    mensagens = buscar()
    if not mensagens:
        print("Canal entrada-discord vazio.")
        return 0

    ultimo = ler_estado()
    for msg in mensagens:
        mid = str(msg.get("id") or "").strip()
        if not mid:
            continue
        if mid == ultimo:
            break
        texto = texto_mensagem(msg)
        if not texto or eh_semanal(texto):
            continue
        print(f"Fonte Discord detectada: {mid} | {titulo_evento(texto)}", flush=True)
        if enviar(msg, texto):
            salvar_estado(mid)
        return 0

    print("Nenhum novo evento individual no entrada-discord.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as erro:
        print(f"ERRO FONTE DISCORD: {erro}", file=sys.stderr, flush=True)
        raise
