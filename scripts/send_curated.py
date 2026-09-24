import io
import json
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote, urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from PIL import Image, ImageFile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from spidey_geo import criar_gpx

ImageFile.LOAD_TRUNCATED_IMAGES = False

QUEUE_DIR = Path("queue/curated")
BRASILIA_TZ = ZoneInfo("America/Sao_Paulo")
DISCORD_API = "https://discord.com/api/v10"
DISCORD_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
APPROVAL_CHANNEL_ID = os.getenv("APPROVAL_CHANNEL_ID", "1550963072464715997").strip()
MONETIZACAO_TIPOS = {"afiliado", "patrocinio", "apoio"}
AFILIADOS_WHATSAPP_PERMITIDOS = {"shopee"}
AFILIADOS_WHATSAPP_BLOQUEADOS = {"mercadolivre", "mercado_livre", "mercado-livre"}


def _parse_local(value, timezone_name):
    dt = datetime.fromisoformat(str(value))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo(timezone_name))
    else:
        dt = dt.astimezone(ZoneInfo(timezone_name))
    return dt


def _fmt_hora(dt):
    if dt.minute == 0:
        return f"{dt.hour}h"
    return f"{dt.hour}h{dt.minute:02d}"


def _sufixo_dia(data, referencia):
    if data == referencia:
        return ""
    if data == referencia - timedelta(days=1):
        return " do dia anterior"
    if data == referencia + timedelta(days=1):
        return " do dia seguinte"
    return f" em {data.strftime('%d/%m')}"


def _fmt_faixa(inicio, fim=None, referencia=None):
    referencia = referencia or inicio.date()
    inicio_txt = _fmt_hora(inicio) + _sufixo_dia(inicio.date(), referencia)
    if not fim:
        return inicio_txt
    fim_txt = _fmt_hora(fim) + _sufixo_dia(fim.date(), referencia)
    return f"{inicio_txt} às {fim_txt}"


def bloco_horarios(data):
    horarios = data.get("horarios") or []
    if not horarios:
        return ""

    processados = []
    for item in horarios:
        localidade = str(item.get("localidade") or "Local").strip()
        timezone_name = str(item.get("timezone") or "").strip()
        inicio_raw = item.get("inicio")
        fim_raw = item.get("fim")
        if not timezone_name or not inicio_raw:
            raise ValueError(f"horario invalido para {localidade}: timezone e inicio sao obrigatorios")

        try:
            inicio_local = _parse_local(inicio_raw, timezone_name)
            fim_local = _parse_local(fim_raw, timezone_name) if fim_raw else None
        except (ValueError, ZoneInfoNotFoundError) as exc:
            raise ValueError(f"horario invalido para {localidade}: {exc}") from exc

        inicio_br = inicio_local.astimezone(BRASILIA_TZ)
        fim_br = fim_local.astimezone(BRASILIA_TZ) if fim_local else None
        processados.append(
            {
                "localidade": localidade,
                "timezone": timezone_name,
                "inicio_local": inicio_local,
                "fim_local": fim_local,
                "inicio_br": inicio_br,
                "fim_br": fim_br,
            }
        )

    if len(processados) == 1:
        item = processados[0]
        ref = item["inicio_local"].date()
        local = _fmt_faixa(item["inicio_local"], item["fim_local"], ref)
        brasil = _fmt_faixa(item["inicio_br"], item["fim_br"], ref)
        return (
            f"⏰ Horário local ({item['localidade']}): {local}\n"
            f"🇧🇷 Horário do Brasil (Brasília): {brasil}"
        )

    padroes_locais = {
        (
            item["inicio_local"].hour,
            item["inicio_local"].minute,
            item["fim_local"].hour if item["fim_local"] else None,
            item["fim_local"].minute if item["fim_local"] else None,
        )
        for item in processados
    }

    linhas = []
    if len(padroes_locais) == 1:
        primeiro = processados[0]
        local = _fmt_faixa(
            primeiro["inicio_local"],
            primeiro["fim_local"],
            primeiro["inicio_local"].date(),
        )
        linhas.append(f"⏰ Horário local: {local} em cada cidade")
    else:
        linhas.append("⏰ Horários locais:")
        for item in processados:
            ref = item["inicio_local"].date()
            local = _fmt_faixa(item["inicio_local"], item["fim_local"], ref)
            linhas.append(f"• {item['localidade']}: {local}")

    linhas.append("🇧🇷 Horários no Brasil (Brasília):")
    for item in processados:
        ref = item["inicio_local"].date()
        brasil = _fmt_faixa(item["inicio_br"], item["fim_br"], ref)
        linhas.append(f"• {item['localidade']}: {brasil}")

    return "\n".join(linhas)


def _url_publica(valor):
    try:
        parsed = urlparse(str(valor).strip())
    except Exception:
        return False
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def _normalizar_plataforma(valor):
    return str(valor or "").strip().lower().replace(" ", "")


def validar_afiliado_whatsapp(monet):
    plataforma = _normalizar_plataforma(monet.get("plataforma"))
    if not plataforma:
        raise ValueError("monetizacao.plataforma e obrigatoria para links de afiliado")
    if plataforma in AFILIADOS_WHATSAPP_BLOQUEADOS:
        raise ValueError("plataforma de afiliado bloqueada para WhatsApp pelas regras atuais do programa")
    if plataforma not in AFILIADOS_WHATSAPP_PERMITIDOS:
        raise ValueError("plataforma de afiliado ainda nao validada pelo Spidey para publicacao no WhatsApp")


def bloco_monetizacao(data):
    monet = data.get("monetizacao") or {}
    if not monet or not bool(monet.get("ativo", False)):
        return ""

    tipo = str(monet.get("tipo") or "").strip().lower()
    parceiro = str(monet.get("parceiro") or "").strip()
    texto = str(monet.get("texto") or "").strip()
    url = str(monet.get("url") or "").strip()

    if tipo not in MONETIZACAO_TIPOS:
        raise ValueError("monetizacao.tipo precisa ser afiliado, patrocinio ou apoio")
    if not parceiro:
        raise ValueError("monetizacao.parceiro e obrigatorio quando ativo=true")
    if not texto:
        raise ValueError("monetizacao.texto e obrigatorio quando ativo=true")
    if not _url_publica(url):
        raise ValueError("monetizacao.url precisa ser uma URL http/https valida")

    if tipo == "afiliado":
        validar_afiliado_whatsapp(monet)
        cabecalho = "💰 LINK DE AFILIADO"
        transparencia = "🔎 Transparência: este link pode gerar uma comissão para o Spidey, sem custo extra para você."
    elif tipo == "patrocinio":
        cabecalho = "🤝 CONTEÚDO PATROCINADO"
        transparencia = "🔎 Transparência: esta ação comercial é identificada separadamente do conteúdo editorial."
    else:
        cabecalho = "🤝 APOIO AO SPIDEY"
        transparencia = "🔎 Transparência: este é um bloco de apoio ao projeto, separado do conteúdo editorial."

    return f"{cabecalho}\n{parceiro} • {texto}\n🔗 {url}\n{transparencia}"


def mensagem_final(data):
    partes = []
    bloco = bloco_horarios(data)
    if bloco:
        partes.append(bloco)
    partes.append(str(data["mensagem"]).strip())
    comercial = bloco_monetizacao(data)
    if comercial:
        partes.append("──────────────\n" + comercial)
    return "\n\n".join(parte for parte in partes if parte)


def validar_item(data, path):
    obrigatorios = ["titulo", "mensagem", "source_url", "image_url", "_source_id"]
    faltando = [k for k in obrigatorios if not str(data.get(k, "")).strip()]
    if faltando:
        raise ValueError(f"{path}: faltam campos obrigatorios: {', '.join(faltando)}")
    if data.get("source_verified") is not True:
        raise ValueError(f"{path}: source_verified precisa ser true")
    if not _url_publica(data["source_url"]):
        raise ValueError(f"{path}: source_url precisa ser uma URL http/https valida")
    image_host = (urlparse(data["image_url"]).hostname or "").lower()
    if image_host not in {"raw.githubusercontent.com", "github.com"}:
        raise ValueError(f"{path}: image_url precisa apontar para arte persistida no GitHub")
    coords = data.get("coordenadas", [])
    if coords is not None and not isinstance(coords, list):
        raise ValueError(f"{path}: coordenadas precisa ser uma lista")
    horarios = data.get("horarios", [])
    if horarios is not None and not isinstance(horarios, list):
        raise ValueError(f"{path}: horarios precisa ser uma lista")
    if horarios:
        bloco_horarios(data)
    monetizacao = data.get("monetizacao")
    if monetizacao is not None and not isinstance(monetizacao, dict):
        raise ValueError(f"{path}: monetizacao precisa ser um objeto")
    if monetizacao:
        bloco_monetizacao(data)


def _discord_headers():
    if not DISCORD_TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN ausente")
    return {"Authorization": f"Bot {DISCORD_TOKEN}", "User-Agent": "SpideyPokemonGO/2.0"}


def _baixar_arte(url):
    r = requests.get(url, headers={"User-Agent": "SpideyPokemonGO/2.0"}, timeout=45)
    r.raise_for_status()
    raw = r.content
    if len(raw) < 8000:
        raise ValueError("arte muito pequena/corrompida")
    with Image.open(io.BytesIO(raw)) as probe:
        probe.verify()
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    if img.width < 1000 or img.height < 1200:
        raise ValueError(f"arte em baixa resolução: {img.width}x{img.height}")
    amostra = img.resize((64, 64)).convert("L")
    minimo, maximo = amostra.getextrema()
    if maximo <= 12 or (maximo - minimo <= 3 and maximo <= 24):
        raise ValueError("arte praticamente preta")
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=94, optimize=True)
    return out.getvalue()


def _coords_validas(data):
    saida = []
    vistos = set()
    for item in data.get("coordenadas") or []:
        try:
            if isinstance(item, dict):
                lat = float(item["lat"])
                lon = float(item.get("lon", item.get("lng")))
            else:
                lat = float(item[0])
                lon = float(item[1])
        except (KeyError, TypeError, ValueError, IndexError):
            continue
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            continue
        chave = (round(lat, 7), round(lon, 7))
        if chave not in vistos:
            vistos.add(chave)
            saida.append(chave)
    return saida


def _bloco_coordenadas(coords):
    if not coords:
        return ""
    linhas = []
    for i, (lat, lon) in enumerate(coords, start=1):
        prefixo = f"{i}. " if len(coords) > 1 else ""
        linhas.append(f"{prefixo}{lat:.6f}, {lon:.6f}")
    return "📍 Coordenadas:\n" + "\n".join(linhas)


def enviar_discord(data):
    arte = _baixar_arte(data["image_url"])
    coords = _coords_validas(data)
    gpx = criar_gpx(coords, data.get("titulo") or "Spidey Pokémon GO") if data.get("gerar_gpx", True) and coords else None
    gpx_nome = str(data.get("gpx_nome") or "spidey-evento.gpx")

    descricao = mensagem_final(data)
    bloco_coords = _bloco_coordenadas(coords)
    if bloco_coords:
        descricao += "\n\n" + bloco_coords
    if gpx:
        descricao += "\n\n🗺️ GPX anexado."

    embed = {
        "title": str(data["titulo"])[:256],
        "description": descricao[:4000],
        "url": data["source_url"],
        "color": 20735,
        "image": {"url": "attachment://spidey-card.jpg"},
        "footer": {"text": "Spidey • reaja com ✅ para aprovar ou ❌ para reprovar"},
    }
    payload = {
        "content": "🕷️ **Aguardando aprovação** • ✅ aprovar | ❌ reprovar",
        "embeds": [embed],
    }
    files = [("files[0]", ("spidey-card.jpg", arte, "image/jpeg"))]
    attachments = [{"id": 0, "filename": "spidey-card.jpg"}]
    if gpx:
        files.append(("files[1]", (gpx_nome, gpx, "application/gpx+xml")))
        attachments.append({"id": 1, "filename": gpx_nome})
    payload["attachments"] = attachments

    r = requests.post(
        f"{DISCORD_API}/channels/{APPROVAL_CHANNEL_ID}/messages",
        headers=_discord_headers(),
        data={"payload_json": json.dumps(payload, ensure_ascii=False)},
        files=files,
        timeout=90,
    )
    r.raise_for_status()
    sent = r.json()
    mid = str(sent["id"])

    for emoji in ("✅", "❌"):
        rr = requests.put(
            f"{DISCORD_API}/channels/{APPROVAL_CHANNEL_ID}/messages/{mid}/reactions/{quote(emoji, safe='')}/@me",
            headers=_discord_headers(),
            timeout=30,
        )
        rr.raise_for_status()
    return sent


def main():
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    pending = []
    for path in sorted(QUEUE_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("status") != "pending":
            continue
        if not str(data.get("_source_id") or "").strip():
            print(f"IGNORADO legado sem _source_id: {path.name}")
            continue
        pending.append((path, data))

    if not pending:
        print("Nenhum item curado pendente.")
        return

    failures = []
    for path, data in pending:
        try:
            validar_item(data, path)
            sent = enviar_discord(data)
            data["status"] = "sent"
            data["discord_approval_id"] = str(sent.get("id") or "")
            data["sent_at_utc"] = datetime.now(BRASILIA_TZ).astimezone(ZoneInfo("UTC")).isoformat()
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"DISCORD APROVAÇÃO: {path.name} -> {data['discord_approval_id']}")
            time.sleep(0.4)
        except Exception as exc:
            failures.append(f"{path.name}: {exc}")
            print(f"ERRO: {path.name}: {exc}")

    if failures:
        raise SystemExit("Falhas na fila curada:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
