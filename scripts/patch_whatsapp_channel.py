from pathlib import Path

CHANNEL_URL = "https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F"

path = Path("bot.py")
text = path.read_text(encoding="utf-8")

# 1) Botao direto para o canal no Discord.
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
        raise SystemExit("Ancora dos botoes nao encontrada")
    text = text.replace(old_buttons, new_buttons, 1)

# 2) Mantem a URL da arte disponivel na pagina de preparacao.
old_image_anchor = '''    url = dados.get("url")
    if url:
'''
new_image_anchor = '''    url = dados.get("url")
    imagem_url = str(dados.get("imagem_url") or "").strip()
    if url:
'''
if 'imagem_url = str(dados.get("imagem_url") or "").strip()' not in text:
    if old_image_anchor not in text:
        raise SystemExit("Ancora da imagem nao encontrada")
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
        raise SystemExit("Ancora JS da imagem nao encontrada")
    text = text.replace(old_js_anchor, new_js_anchor, 1)

# 3) Visual e botao de compartilhamento nativo do Android.
old_css = '''.wa{{background:#25D366;color:#062d16}}.copy{{background:#dcecff;color:#0b2a55}}
'''
new_css = '''.wa{{background:#25D366;color:#062d16}}.copy{{background:#dcecff;color:#0b2a55}}.share{{background:#57e389;color:#062d16}}
'''
if '.share{{background:#57e389' not in text:
    if old_css not in text:
        raise SystemExit("Ancora CSS nao encontrada")
    text = text.replace(old_css, new_css, 1)

old_page = '<button class="btn copy" onclick="copiar()">📋 Copiar texto</button>\n<a class="btn wa" href="{wa_url}">📲 Abrir WhatsApp</a>\n<a class="btn wa" href="https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F">📢 Abrir canal Spidey Pokémon GO</a>'
new_page = '<button class="btn share" onclick="compartilharPost()">🚀 Compartilhar post</button>\n<button class="btn copy" onclick="copiar()">📋 Copiar texto</button>\n<a class="btn wa" href="{wa_url}">📲 Abrir WhatsApp</a>\n<a class="btn wa" href="https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F">📢 Abrir canal Spidey Pokémon GO</a>'
if 'onclick="compartilharPost()"' not in text:
    if old_page not in text:
        raise SystemExit("Ancora da pagina WhatsApp nao encontrada")
    text = text.replace(old_page, new_page, 1)

old_script = '''const texto = {texto_js};
async function copiar(){{await navigator.clipboard.writeText(texto); const b=document.querySelector('.copy'); b.textContent='✅ Texto copiado';}}
async function copiarCoord(valor){{await navigator.clipboard.writeText(valor);}}
'''
new_script = '''const texto = {texto_js};
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
if 'async function compartilharPost()' not in text:
    if old_script not in text:
        raise SystemExit("Ancora do script nao encontrada")
    text = text.replace(old_script, new_script, 1)

old_help = (
    "No WhatsApp, use o botão Abrir canal Spidey Pokémon GO, publique a arte e cole o texto; "
    "quando houver coordenadas, envie cada coordenada separadamente."
)
new_help = (
    "Use Compartilhar post primeiro: no Android ele tenta enviar arte + texto juntos pelo compartilhamento nativo. "
    "Se o WhatsApp não oferecer o Canal como destino, o texto já fica copiado e você pode usar Abrir canal Spidey Pokémon GO. "
    "Quando houver coordenadas, envie cada coordenada separadamente."
)
if old_help in text:
    text = text.replace(old_help, new_help, 1)

path.write_text(text, encoding="utf-8")
print("OK: canal oficial + compartilhamento nativo conectados ao Spidey")
