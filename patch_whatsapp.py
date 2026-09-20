from pathlib import Path

p = Path("bot.py")
s = p.read_text(encoding="utf-8")

s = s.replace(
    "from urllib.parse import urljoin",
    "from urllib.parse import quote, urljoin",
)

alvo = '''def _botoes_aprovacao(token):
    aprovar = f"{PUBLIC_BASE_URL}/aprovar?t={token}"
    rejeitar = f"{PUBLIC_BASE_URL}/rejeitar?t={token}"
    return [
        {
            "type": 1,
            "components": [
                {"type": 2, "style": 5, "label": "✅ Aprovar", "url": aprovar},
                {"type": 2, "style": 5, "label": "❌ Rejeitar", "url": rejeitar},
            ],
        }
    ]
'''

novo = alvo + '''\n\ndef _botao_whatsapp(token):
    preparar = f"{PUBLIC_BASE_URL}/whatsapp?t={token}"
    return [
        {
            "type": 1,
            "components": [
                {
                    "type": 2,
                    "style": 5,
                    "label": "📲 Preparar WhatsApp",
                    "url": preparar,
                }
            ],
        }
    ]
'''

if "def _botao_whatsapp(token):" not in s:
    if alvo not in s:
        raise SystemExit("bloco _botoes_aprovacao nao encontrado")
    s = s.replace(alvo, novo, 1)

# O fluxo atual já exige aprovação automaticamente para títulos G47IX.
if 'exige_aprovacao = dados.get(' not in s:
    raise SystemExit("regra de aprovacao automatica G47IX nao encontrada")

trecho = '''        gpx_nome=conteudo["gpx_nome"],
        webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
    )
    tokens_processados.add(token_id)
'''
troca = '''        gpx_nome=conteudo["gpx_nome"],
        webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
        components=_botao_whatsapp(token),
    )
    tokens_processados.add(token_id)
'''
if "components=_botao_whatsapp(token)" not in s:
    if trecho not in s:
        raise SystemExit("bloco de publicacao aprovada nao encontrado")
    s = s.replace(trecho, troca, 1)

marcador = '''@app.route("/rejeitar", methods=["GET"])
def rejeitar():
'''
rota = '''@app.route("/whatsapp", methods=["GET"])
def whatsapp():
    token = request.args.get("t", "")
    segredo = _segredo_aprovacao()
    try:
        dados = ler_token(token, segredo)
    except ValueError as erro:
        return _html_resultado("Link inválido", str(erro), "#ff5a67"), 400

    titulo = str(dados.get("titulo") or "Spidey Pokémon GO")
    mensagem = str(dados.get("mensagem") or "").strip()
    coordenadas = _coordenadas_explicitas(dados.get("coordenadas"))
    if coordenadas:
        mensagem += "\\n\\n📍 Coordenadas:\\n" + formatar_coordenadas(coordenadas)
    url = dados.get("url")
    if url:
        mensagem += f"\\n\\n🔗 Fonte: {url}"

    texto = f"{titulo}\\n\\n{mensagem}".strip()
    wa_url = "https://wa.me/?text=" + quote(texto)
    texto_js = json.dumps(texto, ensure_ascii=False)
    texto_html = (
        texto.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )

    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spidey • WhatsApp</title>
<style>
body{{margin:0;background:#07192f;color:#fff;font-family:Arial,sans-serif;padding:20px}}
.card{{max-width:620px;margin:auto;background:#102a4d;border-radius:24px;padding:24px;box-shadow:0 18px 60px #0008}}
h1{{margin:8px 0 16px;color:#57e389}}textarea{{width:100%;min-height:260px;box-sizing:border-box;border:0;border-radius:16px;padding:16px;font-size:16px;line-height:1.45;background:#f7fbff;color:#10213b}}
.btn{{display:block;text-align:center;text-decoration:none;border:0;border-radius:16px;padding:15px;margin-top:12px;font-weight:700;font-size:17px;cursor:pointer}}
.wa{{background:#25D366;color:#062d16}}.copy{{background:#dcecff;color:#0b2a55}}
small{{display:block;margin-top:16px;color:#b9c9df;line-height:1.4}}
</style>
</head>
<body><div class="card"><div style="font-size:40px">🕷️</div><h1>Pronto para o WhatsApp</h1>
<textarea id="texto" readonly>{texto_html}</textarea>
<button class="btn copy" onclick="copiar()">📋 Copiar texto</button>
<a class="btn wa" href="{wa_url}">📲 Abrir WhatsApp</a>
<small>A arte aprovada continua na publicação do Discord. No WhatsApp, selecione o seu Canal e publique a arte junto com este texto.</small>
</div>
<script>
const texto = {texto_js};
async function copiar(){{await navigator.clipboard.writeText(texto); const b=document.querySelector('.copy'); b.textContent='✅ Texto copiado';}}
</script></body></html>"""


'''
if '@app.route("/whatsapp", methods=["GET"])' not in s:
    if marcador not in s:
        raise SystemExit("marcador /rejeitar nao encontrado")
    s = s.replace(marcador, rota + marcador, 1)

p.write_text(s, encoding="utf-8")
print("bot.py atualizado")
