from send_curated import bloco_horarios, bloco_monetizacao, mensagem_final


def testar_rio():
    texto = bloco_horarios(
        {
            "horarios": [
                {
                    "localidade": "Rio de Janeiro",
                    "timezone": "America/Sao_Paulo",
                    "inicio": "2026-09-26T10:00:00",
                    "fim": "2026-09-26T18:00:00",
                }
            ]
        }
    )
    assert "Horário local (Rio de Janeiro): 10h às 18h" in texto, texto
    assert "Horário do Brasil (Brasília): 10h às 18h" in texto, texto


def testar_seattle():
    texto = bloco_horarios(
        {
            "horarios": [
                {
                    "localidade": "Seattle",
                    "timezone": "America/Los_Angeles",
                    "inicio": "2026-09-22T18:40:00",
                    "fim": "2026-09-22T22:00:00",
                }
            ]
        }
    )
    assert "Horário local (Seattle): 18h40 às 22h" in texto, texto
    assert "Horário do Brasil (Brasília): 22h40 às 2h do dia seguinte" in texto, texto


def testar_brisbane():
    texto = bloco_horarios(
        {
            "horarios": [
                {
                    "localidade": "Brisbane",
                    "timezone": "Australia/Brisbane",
                    "inicio": "2026-09-26T10:00:00",
                    "fim": "2026-09-26T18:00:00",
                }
            ]
        }
    )
    assert "Horário local (Brisbane): 10h às 18h" in texto, texto
    assert "Horário do Brasil (Brasília): 21h do dia anterior às 5h" in texto, texto


def testar_multicidade():
    texto = bloco_horarios(
        {
            "horarios": [
                {
                    "localidade": "Rio de Janeiro",
                    "timezone": "America/Sao_Paulo",
                    "inicio": "2026-09-26T10:00:00",
                    "fim": "2026-09-26T18:00:00",
                },
                {
                    "localidade": "Lisboa",
                    "timezone": "Europe/Lisbon",
                    "inicio": "2026-09-26T10:00:00",
                    "fim": "2026-09-26T18:00:00",
                },
                {
                    "localidade": "Brisbane",
                    "timezone": "Australia/Brisbane",
                    "inicio": "2026-09-26T10:00:00",
                    "fim": "2026-09-26T18:00:00",
                },
            ]
        }
    )
    assert "Horário local: 10h às 18h em cada cidade" in texto, texto
    assert "Rio de Janeiro: 10h às 18h" in texto, texto
    assert "Lisboa: 6h às 14h" in texto, texto
    assert "Brisbane: 21h do dia anterior às 5h" in texto, texto


def testar_monetizacao_inativa():
    assert bloco_monetizacao({}) == ""
    assert bloco_monetizacao({"monetizacao": {"ativo": False}}) == ""


def testar_afiliado_shopee():
    data = {
        "mensagem": "Notícia editorial.",
        "monetizacao": {
            "ativo": True,
            "tipo": "afiliado",
            "plataforma": "shopee",
            "parceiro": "Shopee",
            "texto": "Oferta relevante para a comunidade.",
            "url": "https://shopee.com.br/exemplo",
        },
    }
    comercial = bloco_monetizacao(data)
    assert "LINK DE AFILIADO" in comercial, comercial
    assert "comissão" in comercial, comercial
    final = mensagem_final(data)
    assert final.startswith("Notícia editorial."), final
    assert "──────────────" in final, final
    assert final.index("Notícia editorial.") < final.index("LINK DE AFILIADO"), final


def testar_mercado_livre_bloqueado():
    data = {
        "monetizacao": {
            "ativo": True,
            "tipo": "afiliado",
            "plataforma": "mercadolivre",
            "parceiro": "Mercado Livre",
            "texto": "Oferta",
            "url": "https://mercadolivre.com.br/exemplo",
        }
    }
    try:
        bloco_monetizacao(data)
    except ValueError as exc:
        assert "bloqueada para WhatsApp" in str(exc), exc
    else:
        raise AssertionError("Mercado Livre deveria ser bloqueado para WhatsApp")


def testar_plataforma_nao_validada_bloqueada():
    data = {
        "monetizacao": {
            "ativo": True,
            "tipo": "afiliado",
            "plataforma": "amazon",
            "parceiro": "Amazon",
            "texto": "Oferta",
            "url": "https://amazon.com.br/exemplo",
        }
    }
    try:
        bloco_monetizacao(data)
    except ValueError as exc:
        assert "ainda nao validada" in str(exc), exc
    else:
        raise AssertionError("Plataforma ainda não validada deveria ser bloqueada")


def testar_patrocinio():
    comercial = bloco_monetizacao(
        {
            "monetizacao": {
                "ativo": True,
                "tipo": "patrocinio",
                "parceiro": "Parceiro Exemplo",
                "texto": "Mensagem comercial claramente identificada.",
                "url": "https://example.org/campanha",
            }
        }
    )
    assert "CONTEÚDO PATROCINADO" in comercial, comercial
    assert "separadamente" in comercial, comercial


def main():
    testar_rio()
    testar_seattle()
    testar_brisbane()
    testar_multicidade()
    testar_monetizacao_inativa()
    testar_afiliado_shopee()
    testar_mercado_livre_bloqueado()
    testar_plataforma_nao_validada_bloqueada()
    testar_patrocinio()
    print("OK: fusos, virada de dia e regras de monetizacao validados")


if __name__ == "__main__":
    main()
