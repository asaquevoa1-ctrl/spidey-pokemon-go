from __future__ import annotations

import argparse
import py_compile
import tempfile
from pathlib import Path


TRUNCATED_OLD = "ImageFile.LOAD_TRUNCATED_IMAGES = True"
TRUNCATED_NEW = "ImageFile.LOAD_TRUNCATED_IMAGES = False"

IMAGE_OLD = '''            resposta_imagem = requests.get(imagem_url, timeout=30)\n            resposta_imagem.raise_for_status()\n            img = Image.open(io.BytesIO(resposta_imagem.content)).convert("RGB")\n            if img.width < 1000 or img.height < 1200:\n                raise ValueError(f"Arte em baixa resolução: {img.width}x{img.height}; mínimo 1000x1200")\n            arquivo = io.BytesIO()\n            img.save(arquivo, format="PNG", optimize=True)\n'''

IMAGE_NEW = '''            resposta_imagem = requests.get(imagem_url, timeout=30)\n            resposta_imagem.raise_for_status()\n            imagem_original = resposta_imagem.content\n            if not imagem_original:\n                raise ValueError("Arquivo de imagem vazio")\n\n            # Primeiro valida o arquivo completo. JPEG/PNG truncado não segue.\n            with Image.open(io.BytesIO(imagem_original)) as probe:\n                probe.verify()\n\n            img = Image.open(io.BytesIO(imagem_original)).convert("RGB")\n            if img.width < 1000 or img.height < 1200:\n                raise ValueError(f"Arte em baixa resolução: {img.width}x{img.height}; mínimo 1000x1200")\n\n            # Impede o sintoma já visto no Discord: arquivo abre, mas vira uma\n            # tela praticamente preta por corrupção/incompletude dos bytes.\n            amostra = img.resize((64, 64)).convert("L")\n            minimo, maximo = amostra.getextrema()\n            if maximo <= 12 or (maximo - minimo <= 3 and maximo <= 24):\n                raise ValueError("Arte inválida: imagem praticamente preta")\n\n            arquivo = io.BytesIO()\n            img.save(arquivo, format="PNG", optimize=True)\n'''

DISCORD_OLD = '''            gpx_nome=conteudo["gpx_nome"],\n            webhook_url=DISCORD_APPROVAL_WEBHOOK,\n        )\n'''

DISCORD_NEW = '''            gpx_nome=conteudo["gpx_nome"],\n            webhook_url=DISCORD_APPROVAL_WEBHOOK,\n            components=_botoes_aprovacao(token),\n        )\n'''


def aplicar(texto: str) -> str:
    saida = texto

    if TRUNCATED_NEW not in saida:
        if TRUNCATED_OLD not in saida:
            raise RuntimeError("Configuração LOAD_TRUNCATED_IMAGES esperada não encontrada")
        saida = saida.replace(TRUNCATED_OLD, TRUNCATED_NEW, 1)

    if "probe.verify()" not in saida:
        if IMAGE_OLD not in saida:
            raise RuntimeError("Bloco de carregamento de imagem esperado não encontrado")
        saida = saida.replace(IMAGE_OLD, IMAGE_NEW, 1)

    if "components=_botoes_aprovacao(token)" not in saida:
        if DISCORD_OLD not in saida:
            raise RuntimeError("Chamada de aprovação Discord esperada não encontrada")
        saida = saida.replace(DISCORD_OLD, DISCORD_NEW, 1)

    return saida


def validar_resultado(texto: str) -> None:
    obrigatorios = (
        TRUNCATED_NEW,
        "probe.verify()",
        "Arte inválida: imagem praticamente preta",
        "components=_botoes_aprovacao(token)",
        "def rejeitar():",
    )
    faltando = [x for x in obrigatorios if x not in texto]
    if faltando:
        raise RuntimeError(f"Hardening incompleto: {faltando}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", default="bot.py")
    parser.add_argument("--check-only", action="store_true")
    args = parser.parse_args()

    path = Path(args.path)
    original = path.read_text(encoding="utf-8")
    atualizado = aplicar(original)
    validar_resultado(atualizado)

    if args.check_only:
        with tempfile.TemporaryDirectory() as tmp:
            alvo = Path(tmp) / "bot.py"
            alvo.write_text(atualizado, encoding="utf-8")
            py_compile.compile(str(alvo), doraise=True)
        print("BOT_HARDENING_CHECK_OK")
        return 0

    if atualizado != original:
        path.write_text(atualizado, encoding="utf-8")
        py_compile.compile(str(path), doraise=True)
        print("BOT_HARDENING_APPLIED")
    else:
        py_compile.compile(str(path), doraise=True)
        print("BOT_ALREADY_HARDENED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
