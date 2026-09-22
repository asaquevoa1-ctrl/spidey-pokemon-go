import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

import requests

DISCORD_API = "https://discord.com/api/v10"
SPIDEY_ENDPOINT = os.getenv("SPIDEY_ENDPOINT", "https://spidey-pokemon-go.onrender.com/enviar")
BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
CHANNEL_ID = os.getenv("SPS_CHANNEL_ID", "1550962861998866564").strip()
STATE_FILE = Path(os.getenv("SPS_STATE_FILE", "last_sps_weekly.txt"))


def normalizar(texto: str) -> str:
    base = unicodedata.normalize("NFKD", texto or "")
    return "".join(c for c in base if not unicodedata.combining(c)).lower()


def texto_mensagem(msg: dict) -> str:
    partes = [str(msg.get("content") or "").strip()]
    for embed in msg.get("embeds") or []:
        partes.extend([
            str(embed.get("title") or "").strip(),
            str(embed.get("description") or "").strip(),
        ])
        for campo in embed.get("fields") or []:
            partes.extend([
                str(campo.get("name") or "").strip(),
                str(campo.get("value") or "").strip(),
            ])
    return "\n".join(p for p in partes if p).strip()


def imagens(msg: dict) -> list[dict]:
    saida = []
    for anexo in msg.get("attachments") or []:
        url = str(anexo.get("url") or "").strip()
        tipo = str(anexo.get("content_type") or "").lower()
        nome = str(anexo.get("filename") or "").lower()
        if url and (tipo.startswith("image/") or nome.endswith((".png", ".jpg", ".jpeg", ".webp"))):
            saida.append(anexo)
    return saida


def ocr_primeira_imagem(msg: dict) -> str:
    anexos = imagens(msg)
    if not anexos or not shutil.which("tesseract"):
        return ""
    anexo = anexos[0]
    resposta = requests.get(anexo["url"], timeout=45)
    resposta.raise_for_status()
    nome = str(anexo.get("filename") or "imagem.png")
    sufixo = Path(urlparse(nome).path).suffix or ".png"
    with tempfile.NamedTemporaryFile(suffix=sufixo) as arquivo:
        arquivo.write(resposta.content)
        arquivo.flush()
        proc = subprocess.run(
            ["tesseract", arquivo.name, "stdout", "-l", "eng", "--psm", "6"],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
    return proc.stdout.strip() if proc.returncode == 0 else ""


def semanal(texto: str) -> bool:
    t = normalizar(texto)
    semana = any(x in t for x in (
        "go weekly", "this week in pokemon go", "events this week", "weekly events",
        "weekly event", "eventos da semana", "agenda da semana", "esta semana",
    ))
    conteudo = any(x in t for x in (
        "raid", "spotlight", "research", "community", "max monday",
        "showcase tuesday", "battle thursday", "friendship friday", "scenic sunday",
    ))
    return semana and conteudo


def ler_estado() -> str:
    try:
        return STATE_FILE.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return ""


def salvar_estado(message_id: str) -> None:
    STATE_FILE.write_text(message_id + "\n", encoding="utf-8")


def buscar() -> list[dict]:
    if not BOT_TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN ausente")
    r = requests.get(
        f"{DISCORD_API}/channels/{CHANNEL_ID}/messages",
        headers={"Authorization": f"Bot {BOT_TOKEN}"},
        params={"limit": 50},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def url_mensagem(msg: dict) -> str | None:
    guild = str(msg.get("guild_id") or "").strip()
    mid = str(msg.get("id") or "").strip()
    return f"https://discord.com/channels/{guild}/{CHANNEL_ID}/{mid}" if guild and mid else None


def limpar_texto(texto: str) -> str:
    linhas = [re.sub(r"\s+", " ", l).strip() for l in texto.splitlines() if l.strip()]
    limpo = "\n".join(linhas)
    return limpo[:3600].rstrip()


def enviar(msg: dict, texto: str) -> bool:
    payload = {
        "titulo": "🗓️ AGENDA • Eventos da semana • SPS",
        "mensagem": (
            "📅 Agenda semanal detectada automaticamente na fonte SPS.\n\n"
            + limpar_texto(texto)
            + "\n\n🔎 Fonte operacional: SPS\n🕷️ Publicação somente após aprovação."
        ),
        "url": url_mensagem(msg),
        "gerar_gpx": False,
        "gerar_arte": True,
        "permitir_fallback": False,
        "aprovar": True,
    }
    r = requests.post(SPIDEY_ENDPOINT, json=payload, timeout=180)
    if r.status_code == 503:
        print("SPS semanal localizado, mas arte premium ainda indisponível.", flush=True)
        print(r.text[:500], flush=True)
        return False
    r.raise_for_status()
    data = r.json()
    ok = data.get("status") == "enviado" and data.get("etapa") == "aguardando_aprovacao"
    if not ok:
        raise RuntimeError(f"Resposta inesperada: {json.dumps(data, ensure_ascii=False)}")
    print("OK: SPS semanal enviado para aprovação.", flush=True)
    return True


def main() -> int:
    mensagens = buscar()
    if not mensagens:
        print("Canal de entrada Discord ainda sem mensagens.")
        return 0

    ultimo = ler_estado()
    for msg in mensagens:
        mid = str(msg.get("id") or "").strip()
        if mid == ultimo:
            break
        if not mid:
            continue

        texto = texto_mensagem(msg)
        if not semanal(texto) and imagens(msg):
            ocr = ocr_primeira_imagem(msg)
            if ocr:
                texto = "\n".join(x for x in (texto, ocr) if x).strip()

        if semanal(texto):
            print(f"SPS semanal detectado: {mid}")
            if enviar(msg, texto):
                salvar_estado(mid)
            return 0

    print("Nenhum novo resumo semanal do SPS.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as erro:
        print(f"ERRO SPS: {erro}", file=sys.stderr, flush=True)
        raise
