from pathlib import Path

CHANNEL_URL = "https://whatsapp.com/channel/0029VbDnlXB2f3EI6wqIcW2F"

path = Path("bot.py")
text = path.read_text(encoding="utf-8")

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

old_page = '<a class="btn wa" href="{wa_url}">📲 Abrir WhatsApp</a>'
new_page = old_page + f'\n<a class="btn wa" href="{CHANNEL_URL}">📢 Abrir canal Spidey Pokémon GO</a>'

if "📢 Abrir canal Spidey Pokémon GO</a>" not in text:
    if old_page not in text:
        raise SystemExit("Ancora da pagina WhatsApp nao encontrada")
    text = text.replace(old_page, new_page, 1)

old_help = (
    "No WhatsApp, selecione o seu Canal, publique a arte e o texto; "
    "quando houver coordenadas, envie cada coordenada separadamente."
)
new_help = (
    "No WhatsApp, use o botão Abrir canal Spidey Pokémon GO, publique a arte e cole o texto; "
    "quando houver coordenadas, envie cada coordenada separadamente."
)
if old_help in text:
    text = text.replace(old_help, new_help, 1)

path.write_text(text, encoding="utf-8")
print("OK: canal oficial do WhatsApp conectado ao Spidey")
