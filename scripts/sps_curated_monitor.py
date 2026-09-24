import json
import re
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts import discord_source_monitor as individual
from scripts import sps_weekly_monitor as weekly
from scripts.curated_dispatch import gerar_persistir_e_enviar

MAX_INDIVIDUAIS_POR_RODADA = 12
MAX_PAGINAS_BACKLOG = 20
LIMITE_PAGINA = 100


def remover_coordenadas_do_corpo(texto):
    """Remove coordenadas cruas do corpo; elas seguem em campo estruturado/GPX."""
    limpo = individual.COORD_RE.sub("", texto or "")
    limpo = re.sub(r"[ \t]+\n", "\n", limpo)
    limpo = re.sub(r"\n{3,}", "\n\n", limpo)
    return limpo.strip()


def buscar_desde_cursor(ultimo: str) -> list[dict]:
    """Busca todas as mensagens mais novas que o cursor, paginando o Discord.

    O Discord devolve mensagens da mais nova para a mais antiga. O monitor antigo
    lia apenas 50 itens; após uma interrupção longa o cursor podia sair dessa
    janela e eventos intermediários eram perdidos. Aqui seguimos páginas de 100
    até reencontrar o cursor. Se o cursor existir e não for reencontrado dentro
    do limite de segurança, abortamos sem avançar estado para nunca pular dados.
    """
    if not individual.BOT_TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN ausente")

    headers = {
        "Authorization": f"Bot {individual.BOT_TOKEN}",
        "User-Agent": "SpideyPokemonGO/2.0",
        "Accept": "application/json",
    }
    encontrados: list[dict] = []
    before = ""
    cursor_encontrado = not bool(ultimo)

    for pagina in range(1, MAX_PAGINAS_BACKLOG + 1):
        params = {"limit": LIMITE_PAGINA}
        if before:
            params["before"] = before
        r = requests.get(
            f"{individual.DISCORD_API}/channels/{individual.CHANNEL_ID}/messages",
            headers=headers,
            params=params,
            timeout=30,
        )
        r.raise_for_status()
        lote = r.json()
        if not lote:
            cursor_encontrado = True
            break

        for msg in lote:
            mid = str(msg.get("id") or "").strip()
            if ultimo and mid == ultimo:
                cursor_encontrado = True
                break
            encontrados.append(msg)

        if cursor_encontrado:
            break
        if len(lote) < LIMITE_PAGINA:
            # Chegamos ao início do histórico disponível. O cursor antigo pode
            # ter sido removido; neste caso o backlog coletado é a melhor fonte.
            cursor_encontrado = True
            break
        before = str(lote[-1].get("id") or "").strip()
        if not before:
            break
        print(f"SPS backlog: página {pagina} lida; cursor ainda não encontrado.", flush=True)

    if ultimo and not cursor_encontrado:
        raise RuntimeError(
            "Cursor SPS não encontrado após paginação de segurança; estado não foi avançado para evitar perda."
        )

    return encontrados


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
        "media_policy": "source_first",
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
        "media_policy": "source_first",
    }
    result = gerar_persistir_e_enviar(payload, f"sps-weekly-{msg.get('id')}")
    print(json.dumps(result, ensure_ascii=False))
    return True


def processar_individuais() -> int:
    ultimo = individual.ler_estado()
    mensagens = buscar_desde_cursor(ultimo)
    if not mensagens:
        print("Nenhum novo evento SPS.")
        return 0

    # Discord veio novo->antigo. Voltamos para antigo->novo e avançamos o
    # cursor inclusive sobre mensagens vazias/semanais, que antes podiam ficar
    # eternamente na frente do cursor individual.
    cronologicos = list(reversed(mensagens))
    processados = 0
    examinados = 0

    for msg in cronologicos:
        if processados >= MAX_INDIVIDUAIS_POR_RODADA:
            break
        mid = str(msg.get("id") or "").strip()
        if not mid:
            continue
        examinados += 1
        texto = individual.texto_mensagem(msg)

        if not texto:
            print(f"SPS ignorado sem texto: {mid}", flush=True)
            individual.salvar_estado(mid)
            continue

        if individual.eh_semanal(texto):
            print(f"SPS semanal deixado para monitor semanal: {mid}", flush=True)
            individual.salvar_estado(mid)
            continue

        print(f"SPS detectado: {mid} | {individual.titulo_evento(texto)}", flush=True)
        try:
            enviar_individual(msg, texto)
        except Exception as exc:
            # Não avança além de um item que falhou: preserva exatamente o ponto
            # de retomada e evita perda silenciosa. A próxima rodada tentará de novo.
            print(f"ERRO SPS item {mid}: {exc}", file=sys.stderr, flush=True)
            break

        individual.salvar_estado(mid)
        processados += 1

    print(
        f"SPS: examinados={examinados}, enfileirados={processados}, "
        f"cursor={individual.ler_estado() or 'vazio'}.",
        flush=True,
    )
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
