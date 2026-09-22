import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests

ENDPOINT = os.getenv("SPIDEY_ENDPOINT", "https://spidey-pokemon-go.onrender.com/enviar").strip()
QUEUE_DIR = Path("queue/curated")
BRASILIA_TZ = ZoneInfo("America/Sao_Paulo")
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
        raise ValueError(
            "plataforma de afiliado bloqueada para WhatsApp pelas regras atuais do programa"
        )

    if plataforma not in AFILIADOS_WHATSAPP_PERMITIDOS:
        raise ValueError(
            "plataforma de afiliado ainda nao validada pelo Spidey para publicacao no WhatsApp"
        )


def bloco_monetizacao(data):
    monet = data.get("monetizacao") or {}
    if not monet or not bool(monet.get("ativo", False)):
        return ""

    tipo = str(monet.get("tipo") or "").strip().lower()
    parceiro = str(monet.get("parceiro") or "").strip()
    texto = str(monet.get("texto") or "").strip()
    url = str(monet.get("url") or "").strip()

    if tipo not in MONETIZACAO_TIPOS:
        raise ValueError(
            "monetizacao.tipo precisa ser afiliado, patrocinio ou apoio"
        )
    if not parceiro:
        raise ValueError("monetizacao.parceiro e obrigatorio quando ativo=true")
    if not texto:
        raise ValueError("monetizacao.texto e obrigatorio quando ativo=true")
    if not _url_publica(url):
        raise ValueError("monetizacao.url precisa ser uma URL http/https valida")

    if tipo == "afiliado":
        validar_afiliado_whatsapp(monet)
        cabecalho = "💰 LINK DE AFILIADO"
        transparencia = (
            "🔎 Transparência: este link pode gerar uma comissão para o Spidey, "
            "sem custo extra para você."
        )
    elif tipo == "patrocinio":
        cabecalho = "🤝 CONTEÚDO PATROCINADO"
        transparencia = (
            "🔎 Transparência: esta ação comercial é identificada separadamente "
            "do conteúdo editorial."
        )
    else:
        cabecalho = "🤝 APOIO AO SPIDEY"
        transparencia = (
            "🔎 Transparência: este é um bloco de apoio ao projeto, separado "
            "do conteúdo editorial."
        )

    return (
        f"{cabecalho}\n"
        f"{parceiro} • {texto}\n"
        f"🔗 {url}\n"
        f"{transparencia}"
    )


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
    obrigatorios = ["titulo", "mensagem", "source_url", "image_url"]
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


def payload_spidey(data):
    return {
        "titulo": data["titulo"],
        "mensagem": mensagem_final(data),
        "url": data["source_url"],
        "imagem_url": data["image_url"],
        "coordenadas": data.get("coordenadas", []),
        "gerar_gpx": bool(data.get("gerar_gpx", True)),
        "gpx_nome": data.get("gpx_nome", "spidey-evento.gpx"),
        "gerar_arte": False,
        "aprovar": True,
    }


def enviar_com_retry(payload):
    ultimo_erro = None
    for tentativa, espera in enumerate((0, 5, 10, 20), start=1):
        if espera:
            time.sleep(espera)
        try:
            response = requests.post(ENDPOINT, json=payload, timeout=180)
            if response.status_code in {502, 503, 504}:
                ultimo_erro = RuntimeError(f"HTTP {response.status_code}: {response.text[:300]}")
                print(f"Render temporariamente indisponivel; tentativa {tentativa}/4.")
                continue
            response.raise_for_status()
            return response
        except requests.RequestException as exc:
            ultimo_erro = exc
            print(f"Falha de rede; tentativa {tentativa}/4: {exc}")
    raise ultimo_erro or RuntimeError("Falha desconhecida no envio ao Spidey")


def main():
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    pending = []

    for path in sorted(QUEUE_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("status", "pending") != "pending":
            continue
        pending.append((path, data))

    if not pending:
        print("Nenhum item curado pendente.")
        return

    failures = []
    for path, data in pending:
        try:
            validar_item(data, path)
            response = enviar_com_retry(payload_spidey(data))
            result = response.json()
            if result.get("status") != "enviado" or result.get("etapa") != "aguardando_aprovacao":
                raise RuntimeError(f"resposta inesperada: {result}")
            if result.get("modo_arte") != "fornecida":
                raise RuntimeError(f"arte nao foi tratada como fornecida: {result}")

            data["status"] = "sent"
            data["spidey_result"] = result
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"ENVIADO: {path.name}")
        except Exception as exc:
            failures.append(f"{path.name}: {exc}")
            print(f"ERRO: {path.name}: {exc}")

    if failures:
        raise SystemExit("Falhas na fila curada:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
