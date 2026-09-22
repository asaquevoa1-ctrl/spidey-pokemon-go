import json
import os
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
            response = requests.post(ENDPOINT, json=payload_spidey(data), timeout=180)
            response.raise_for_status()
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
