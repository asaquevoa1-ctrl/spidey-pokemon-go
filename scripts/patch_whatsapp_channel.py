from pathlib import Path

CHANNEL_URL = "https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F"

path = Path("bot.py")
text = path.read_text(encoding="utf-8")

# 1) Botão direto para o canal no Discord.
old_buttons = '''                {
                    "type": 2,
                    "style": 5,
                    "label": "📲 Preparar WhatsApp",
                    "url": preparar,
                }
'''
first_button_with_comma = old_buttons[:-1] + ",\n"
new_buttons = first_button_with_comma + f'''                {{
                    "type": 2,
                    "style": 5,
                    "label": "📢 Abrir canal Spidey",
                    "url": "{CHANNEL_URL}",
                }}
'''
if "📢 Abrir canal Spidey" not in text:
    if old_buttons not in text:
        raise SystemExit("Âncora dos botões não encontrada")
    text = text.replace(old_buttons, new_buttons, 1)

# 2) Mantém a URL da arte disponível na página de preparação.
old_image_anchor = '''    url = dados.get("url")
    if url:
'''
new_image_anchor = '''    url = dados.get("url")
    imagem_url = str(dados.get("imagem_url") or "").strip()
    if url:
'''
if 'imagem_url = str(dados.get("imagem_url") or "").strip()' not in text:
    if old_image_anchor not in text:
        raise SystemExit("Âncora da imagem não encontrada")
    text = text.replace(old_image_anchor, new_image_anchor, 1)

old_js_anchor = '''    texto_js = json.dumps(texto, ensure_ascii=False)
    texto_html = (
'''
new_js_anchor = '''    texto_js = json.dumps(texto, ensure_ascii=False)
    imagem_js = json.dumps(imagem_url, ensure_ascii=False)
    texto_html = (
'''
if 'imagem_js = json.dumps(imagem_url, ensure_ascii=False)' not in text:
    if old_js_anchor not in text:
        raise SystemExit("Âncora JS da imagem não encontrada")
    text = text.replace(old_js_anchor, new_js_anchor, 1)

# 3) Troca o compartilhamento nativo (que não expõe Canais no aparelho)
# por um fluxo de um toque: copiar texto -> baixar arte -> abrir canal.
text = text.replace(
    '.wa{{background:#25D366;color:#062d16}}.copy{{background:#dcecff;color:#0b2a55}}.share{{background:#57e389;color:#062d16}}',
    '.wa{{background:#25D366;color:#062d16}}.copy{{background:#dcecff;color:#0b2a55}}.launch{{background:#57e389;color:#062d16}}.download{{background:#f5c84c;color:#2f2600}}',
    1,
)

old_page = '''<button class="btn share" onclick="compartilharPost()">🚀 Compartilhar post</button>
<button class="btn copy" onclick="copiar()">📋 Copiar texto</button>
<a class="btn wa" href="{wa_url}">📲 Abrir WhatsApp</a>
<a class="btn wa" href="https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F">📢 Abrir canal Spidey Pokémon GO</a>'''
new_page = '''<button class="btn launch" onclick="prepararCanal()">🚀 Preparar e abrir canal</button>
<button class="btn download" onclick="baixarArte()">🖼️ Baixar arte</button>
<button class="btn copy" onclick="copiar()">📋 Copiar texto</button>
<a class="btn wa" href="https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F">📢 Abrir canal Spidey Pokémon GO</a>'''
if old_page in text:
    text = text.replace(old_page, new_page, 1)
elif 'onclick="prepararCanal()"' not in text:
    raise SystemExit("Âncora da página WhatsApp não encontrada")

old_script_start = '''const texto = {texto_js};
const imagemUrl = {imagem_js};
async function copiar(){{await navigator.clipboard.writeText(texto); const b=document.querySelector('.copy'); b.textContent='✅ Texto copiado';}}
async function compartilharPost(){{
  const b=document.querySelector('.share');
  try {{
    await navigator.clipboard.writeText(texto);
  }} catch (_) {{}}
  try {{
    if (imagemUrl) {{
      const r = await fetch(imagemUrl, {{cache:'no-store'}});
      if (!r.ok) throw new Error('Falha ao carregar arte');
      const blob = await r.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const file = new File([blob], `spidey-post.${{ext}}`, {{type: blob.type || 'image/jpeg'}});
      const dadosShare = {{title:'Spidey Pokémon GO', text:texto, files:[file]}};
      if (navigator.canShare && navigator.canShare({{files:[file]}})) {{
        await navigator.share(dadosShare);
        b.textContent='✅ Compartilhamento aberto';
        return;
      }}
    }}
    if (navigator.share) {{
      await navigator.share({{title:'Spidey Pokémon GO', text:texto}});
      b.textContent='✅ Compartilhamento aberto';
      return;
    }}
    b.textContent='📋 Texto copiado — abra o canal';
    window.location.href='https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F';
  }} catch (e) {{
    if (e && e.name === 'AbortError') return;
    b.textContent='📋 Texto copiado — abra o canal';
    window.location.href='https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F';
  }}
}}
async function copiarCoord(valor){{await navigator.clipboard.writeText(valor);}}
'''
new_script = '''const texto = {texto_js};
const imagemUrl = {imagem_js};
const canalUrl = 'https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F';
async function copiar(){{
  await navigator.clipboard.writeText(texto);
  const b=document.querySelector('.copy');
  b.textContent='✅ Texto copiado';
}}
async function baixarArte(){{
  const b=document.querySelector('.download');
  if (!imagemUrl) {{ b.textContent='⚠️ Arte indisponível'; return false; }}
  try {{
    const r = await fetch(imagemUrl, {{cache:'no-store'}});
    if (!r.ok) throw new Error('Falha ao carregar arte');
    const blob = await r.blob();
    const ext = blob.type.includes('png') ? 'png' : 'jpg';
    const nome = `spidey-post.${{ext}}`;
    const obj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = obj;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(obj), 5000);
    b.textContent='✅ Arte baixada';
    return true;
  }} catch (_) {{
    b.textContent='⚠️ Toque para tentar baixar de novo';
    return false;
  }}
}}
async function prepararCanal(){{
  const b=document.querySelector('.launch');
  b.textContent='⏳ Preparando...';
  try {{ await navigator.clipboard.writeText(texto); }} catch (_) {{}}
  await baixarArte();
  b.textContent='✅ Texto copiado + arte pronta';
  setTimeout(()=>{{ window.location.href=canalUrl; }}, 650);
}}
async function copiarCoord(valor){{await navigator.clipboard.writeText(valor);}}
'''
if old_script_start in text:
    text = text.replace(old_script_start, new_script, 1)
elif 'async function prepararCanal()' not in text:
    raise SystemExit("Âncora do script de compartilhamento não encontrada")

old_help = (
    "A arte aprovada continua na publicação do Discord. Use Compartilhar post primeiro: no Android ele tenta enviar arte + texto juntos pelo compartilhamento nativo. "
    "Se o WhatsApp não oferecer o Canal como destino, o texto já fica copiado e você pode usar Abrir canal Spidey Pokémon GO. "
    "Quando houver coordenadas, envie cada coordenada separadamente."
)
new_help = (
    "Use Preparar e abrir canal: o Spidey copia o texto, baixa a arte e abre diretamente o canal. "
    "No WhatsApp, anexe a imagem recém-baixada e cole o texto. Quando houver coordenadas, envie cada coordenada separadamente."
)
if old_help in text:
    text = text.replace(old_help, new_help, 1)

# 4) No post publicado, usa links Markdown como caminho principal.
# Webhooks do Discord podem descartar componentes; links no embed são confiáveis.
old_publish = '''    mensagem_publicada = conteudo["mensagem_original"]
    if conteudo["gpx_bytes"]:
        mensagem_publicada += "\\n\\n🗺️ Arquivo GPX anexado."

    mandar_discord(
        f"✅ APROVADO • {conteudo['titulo']}",
        mensagem_publicada,
        url=conteudo["url"],
        imagem_bytes=conteudo["imagem_bytes"],
        gpx_bytes=conteudo["gpx_bytes"],
        gpx_nome=conteudo["gpx_nome"],
        webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
        components=_botao_whatsapp(token),
    )
'''
new_publish = f'''    mensagem_publicada = conteudo["mensagem_original"]
    if conteudo["gpx_bytes"]:
        mensagem_publicada += "\\n\\n🗺️ Arquivo GPX anexado."

    preparar_whatsapp = f"{{PUBLIC_BASE_URL}}/whatsapp?t={{token}}"
    mensagem_publicada += (
        f"\\n\\n📲 [PREPARAR WHATSAPP]({{preparar_whatsapp}})"
        f"\\n📢 [ABRIR CANAL SPIDEY]({CHANNEL_URL})"
    )

    mandar_discord(
        f"✅ APROVADO • {{conteudo['titulo']}}",
        mensagem_publicada,
        url=conteudo["url"],
        imagem_bytes=conteudo["imagem_bytes"],
        gpx_bytes=conteudo["gpx_bytes"],
        gpx_nome=conteudo["gpx_nome"],
        webhook_url=DISCORD_PUBLICADOS_WEBHOOK,
    )
'''
if "📲 [PREPARAR WHATSAPP]" not in text:
    if old_publish not in text:
        raise SystemExit("Âncora da publicação final não encontrada")
    text = text.replace(old_publish, new_publish, 1)

path.write_text(text, encoding="utf-8")
print("OK: fluxo WhatsApp com links confiáveis aplicado")