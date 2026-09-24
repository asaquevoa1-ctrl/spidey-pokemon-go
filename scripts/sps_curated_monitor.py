import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts import discord_source_monitor as individual
from scripts import sps_weekly_monitor as weekly
from scripts.curated_dispatch import gerar_persistir_e_enviar

MAX_INDIVIDUAIS_POR_RODADA = 8


def remover_coordenadas_do_corpo(texto):
    """Remove coordenadas cruas do texto; elas seguem em campo estruturado/GPX."""
    limpo = individual.COORD_RE.sub("", texto or "")
    limpo = re.sub(r"[ \t]+\n", "\n", limpo)
    limpo = re.sub(r"\n{3,}", "\n\n", limpo)
    return limpo.strip()


def enviar_individual(msg, texto):
    coords = individual.extrair_coordenadas(texto)
    nome = individual.titulo_evento(texto)
    corpo = remover_coordenadas_do_corpo(individual.traduzir_basico(texto))
    payload = {
        "titulo": f"📍 EVENTO • {nome}",
        "mensagem": corpo + "\n\n🔎 Fonte operacional: SPS",
        "url": individual.url_mensagem(msg),
        "image_url": individual.primeira_imagem_url(msg),
        "coordenadas": coords,
        "gerar_gpx": bool(coords),
        "gpx_nome": individual.slug(nome),
        "aprovar": True,
    }
    result = gerar_persistir_e_enviar(payload, f"sps-{msg.get('id')}")
    print(json.dumps(result, ensure_ascii=False))
    return True


def enviar_semanal(msg, texto):
    payload = {
        "titulo": "🗓️ AGENDA • Eventos da semana • SPS",
        "mensagem": (
            "📅 Agenda semanal detectada automaticamente na fonte SPS.\n\n"
            + weekly.limpar_texto(texto)
            + "\n\n🔎 Fonte operacional: SPS"
        ),
        "url": weekly.url_mensagem(msg),
        "image_url": individual.primeira_imagem_url(msg),
        "gerar_gpx": False,
        "aprovar": True,
    }
    result = gerar_persistir_e_enviar(payload, f"sps-weekly-{msg.get('id')}")
    print(json.dumps(result, ensure_ascii=False))
    return True


def processar_individuais() -> int:
    mensagens = individual.buscar()
    if not mensagens:
        print("Canal SPS vazio.")
        return 0

    ultimo = individual.ler_estado()
    pendentes = []
    for msg in mensagens:  # Discord entrega do mais novo para o mais antigo.
        mid = str(msg.get("id") or "").strip()
        if not mid:
            continue
        if mid == ultimo:
            break
        texto = individual.texto_mensagem(msg)
        if not texto or individual.eh_semanal(texto):
            continue
        pendentes.append((msg, texto))

    if not pendentes:
        print("Nenhum novo evento individual SPS.")
        return 0

    # Processa do mais antigo para o mais novo. Se houver backlog maior que o
    # limite, o estado para no último realmente processado e a próxima rodada
    # continua dali, sem pular eventos intermediários.
    cronologicos = list(reversed(pendentes))
    processados = 0
    for msg, texto in cronologicos[:MAX_INDIVIDUAIS_POR_RODADA]:
        mid = str(msg.get("id"))
        print(f"SPS detectado: {mid} | {individual.titulo_evento(texto)}", flush=True)
        if enviar_individual(msg, texto):
            individual.salvar_estado(mid)
            processados += 1

    print(f"SPS individuais processados nesta rodada: {processados}.")
    return processados


def main():
    print("=== SPS individual ===")
    processar_individuais()
    print("=== SPS semanal ===")
    weekly.enviar = enviar_semanal
    weekly.main()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERRO SPS CURADO: {exc}", file=sys.stderr, flush=True)
        raise
