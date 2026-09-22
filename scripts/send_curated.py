import json
import os
import time
from pathlib import Path
from urllib.parse import urlparse

import requests

ENDPOINT = os.getenv("SPIDEY_ENDPOINT", "https://spidey-pokemon-go.onrender.com/enviar").strip()
QUEUE_DIR = Path("queue/curated")


def validar_item(data, path):
    obrigatorios = ["titulo", "mensagem", "source_url", "image_url"]
    faltando = [k for k in obrigatorios if not str(data.get(k, "")).strip()]
    if faltando:
        raise ValueError(f"{path}: faltam campos obrigatorios: {', '.join(faltando)}")

    if data.get("source_verified") is not True:
        raise ValueError(f"{path}: source_verified precisa ser true")

    image_host = (urlparse(data["image_url"]).hostname or "").lower()
    if image_host not in {"raw.githubusercontent.com", "github.com"}:
        raise ValueError(f"{path}: image_url precisa apontar para arte persistida no GitHub")

    coords = data.get("coordenadas", [])
    if coords is not None and not isinstance(coords, list):
        raise ValueError(f"{path}: coordenadas precisa ser uma lista")


def payload_spidey(data):
    return {
        "titulo": data["titulo"],
        "mensagem": data["mensagem"],
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
