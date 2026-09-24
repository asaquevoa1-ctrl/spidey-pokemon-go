import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts import discord_source_monitor as individual
from scripts import sps_weekly_monitor as weekly
from scripts.curated_dispatch import gerar_persistir_e_enviar


def enviar_individual(msg, texto):
    coords = individual.extrair_coordenadas(texto)
    nome = individual.titulo_evento(texto)
    corpo = individual.traduzir_basico(texto)
    payload = {
        "titulo": f"📍 EVENTO • {nome}",
        "mensagem": corpo + "\n\n🔎 Fonte operacional: SPS",
        "url": individual.url_mensagem(msg),
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
        "gerar_gpx": False,
        "aprovar": True,
    }
    result = gerar_persistir_e_enviar(payload, f"sps-weekly-{msg.get('id')}")
    print(json.dumps(result, ensure_ascii=False))
    return True


def main():
    # Reutiliza toda a leitura/classificação/antirrepetição já validada,
    # trocando SOMENTE o antigo gerador de arte pelo pipeline curado oficial.
    individual.enviar = enviar_individual
    weekly.enviar = enviar_semanal
    print("=== SPS individual ===")
    individual.main()
    print("=== SPS semanal ===")
    weekly.main()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERRO SPS CURADO: {exc}", file=sys.stderr, flush=True)
        raise
