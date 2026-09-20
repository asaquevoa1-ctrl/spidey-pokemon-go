import base64
import hashlib
import hmac
import json
import time
import zlib


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _unb64(texto: str) -> bytes:
    padding = "=" * (-len(texto) % 4)
    return base64.urlsafe_b64decode((texto + padding).encode("ascii"))


def criar_token(payload: dict, segredo: str, ttl_segundos: int = 7 * 24 * 3600) -> str:
    if not segredo:
        raise ValueError("Segredo de aprovação ausente")

    dados = dict(payload)
    agora = int(time.time())
    dados["iat"] = agora
    dados["exp"] = agora + int(ttl_segundos)

    bruto = json.dumps(
        dados,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    compactado = zlib.compress(bruto, level=9)
    corpo = _b64(compactado)
    assinatura = hmac.new(
        segredo.encode("utf-8"),
        corpo.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return f"{corpo}.{_b64(assinatura)}"


def ler_token(token: str, segredo: str) -> dict:
    if not segredo:
        raise ValueError("Segredo de aprovação ausente")

    try:
        corpo, assinatura_recebida = token.split(".", 1)
    except ValueError as exc:
        raise ValueError("Token de aprovação inválido") from exc

    assinatura_esperada = hmac.new(
        segredo.encode("utf-8"),
        corpo.encode("ascii"),
        hashlib.sha256,
    ).digest()

    try:
        assinatura_bytes = _unb64(assinatura_recebida)
    except Exception as exc:
        raise ValueError("Assinatura inválida") from exc

    if not hmac.compare_digest(assinatura_bytes, assinatura_esperada):
        raise ValueError("Assinatura inválida")

    try:
        dados = json.loads(zlib.decompress(_unb64(corpo)).decode("utf-8"))
    except Exception as exc:
        raise ValueError("Conteúdo do token inválido") from exc

    if int(dados.get("exp", 0)) < int(time.time()):
        raise ValueError("Token de aprovação expirado")

    return dados
