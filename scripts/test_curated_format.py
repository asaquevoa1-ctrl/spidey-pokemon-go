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


def testar_afiliado():
    data = {
        "mensagem": "Notícia editorial.",
        "monetizacao": {
            "ativo": True,
            "tipo": "afiliado",
            "parceiro": "Loja Exemplo",
            "texto": "Confira a oferta para a comunidade.",
            "url": "https://example.com/spidey",
        },
    }
    comercial = bloco_monetizacao(data)
    assert "LINK DE AFILIADO" in comercial, comercial
    assert "comissão" in comercial, comercial
    final = mensagem_final(data)
    assert final.startswith("Notícia editorial."), final
    assert "──────────────" in final, final
    assert final.index("Notícia editorial.") < final.index("LINK DE AFILIADO"), final


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
    testar_afiliado()
    testar_patrocinio()
    print("OK: fusos, virada de dia e monetizacao validados")


if __name__ == "__main__":
    main()
