from pathlib import Path


def patch_pokeminers():
    p = Path('.github/workflows/spidey-pokeminers.yml')
    s = p.read_text(encoding='utf-8')
    if 'from scripts.curated_dispatch import gerar_persistir_e_enviar' not in s:
        s = s.replace(
            'from pathlib import Path\n',
            'from pathlib import Path\nfrom scripts.curated_dispatch import gerar_persistir_e_enviar\n',
            1,
        )
    s = s.replace(
        '          DISCORD_BOT_TOKEN: ${{ secrets.DISCORD_BOT_TOKEN }}\n',
        '          DISCORD_BOT_TOKEN: ${{ secrets.DISCORD_BOT_TOKEN }}\n          GITHUB_TOKEN: ${{ github.token }}\n          SPIDEY_BASE: "https://spidey-pokemon-go.onrender.com"\n',
        1,
    )
    s = s.replace(
        '                  "gerar_arte": False,\n                  "aprovar": True,\n',
        '                  "aprovar": True,\n',
    )
    old = '''              _, data = request_json(endpoint, method="POST", payload=payload, timeout=120)\n              if data.get("status") != "enviado" or data.get("etapa") != "aguardando_aprovacao":\n                  raise RuntimeError("Resposta inesperada do Spidey: " + json.dumps(data, ensure_ascii=False))\n'''
    new = '''              data = gerar_persistir_e_enviar(payload, f"pokeminers-{mid}")\n              if data.get("status") != "enviado" or data.get("etapa") != "aguardando_aprovacao":\n                  raise RuntimeError("Resposta inesperada do Spidey: " + json.dumps(data, ensure_ascii=False))\n'''
    if old in s:
        s = s.replace(old, new, 1)
    p.write_text(s, encoding='utf-8')


def patch_g47ix():
    p = Path('.github/workflows/spidey-g47ix.yml')
    s = p.read_text(encoding='utf-8')
    s = s.replace(
        '          SPIDEY: https://spidey-pokemon-go.onrender.com/enviar\n          STATE_FILE: last_g47ix.txt\n',
        '          SPIDEY: https://spidey-pokemon-go.onrender.com/enviar\n          SPIDEY_BASE: https://spidey-pokemon-go.onrender.com\n          GITHUB_TOKEN: ${{ github.token }}\n          STATE_FILE: last_g47ix.txt\n',
        1,
    )
    s = s.replace(
        '              "gerar_arte": True,\n              "permitir_fallback": False,\n              "aprovar": True\n',
        '              "aprovar": True\n',
        1,
    )
    a = s.find('          HTTP_CODE="$(curl \\\n', s.find('          PAYLOAD="$(python3'))
    b = s.find('          salvar_estado "Spidey: atualiza ultima publicacao G47IX"', a)
    if a != -1 and b != -1:
        bloco = '''          RESULT="$(printf '%s' "$PAYLOAD" | python3 scripts/curated_dispatch.py)"\n          echo "$RESULT"\n\n          python3 - "$RESULT" <<'PY'\n          import json\n          import sys\n\n          data = json.loads(sys.argv[1])\n          if data.get("status") != "enviado":\n              raise SystemExit("Spidey nao confirmou o envio")\n          if not data.get("arte"):\n              raise SystemExit("Spidey confirmou envio sem arte; estado nao deve avancar")\n          if data.get("modo_arte") != "fornecida":\n              raise SystemExit(f"Arte nao foi reutilizada: {data.get('modo_arte')}")\n          print("Arte curada persistida confirmada.")\n          PY\n\n'''
        s = s[:a] + bloco + s[b:]
    p.write_text(s, encoding='utf-8')


def patch_oficial():
    p = Path('.github/workflows/spidey-check.yml')
    s = p.read_text(encoding='utf-8')
    s = s.replace(
        '      - name: Verificar noticia oficial\n        shell: bash\n',
        '      - name: Verificar noticia oficial\n        shell: bash\n        env:\n          GITHUB_TOKEN: ${{ github.token }}\n          SPIDEY_BASE: https://spidey-pokemon-go.onrender.com\n',
        1,
    )
    s = s.replace(
        '              "gerar_arte": True,\n              "aprovar": True\n',
        '              "aprovar": True\n',
        1,
    )
    start = s.find('          RESULT="$(curl \\\n', s.find('          PAYLOAD="$(python -'))
    end = s.find('          echo "$RESULT"\n', start)
    if start != -1 and end != -1:
        end += len('          echo "$RESULT"\n')
        s = s[:start] + '          RESULT="$(printf \'%s\' "$PAYLOAD" | python scripts/curated_dispatch.py)"\n\n          echo "$RESULT"\n' + s[end:]
    p.write_text(s, encoding='utf-8')


def patch_sps_individual():
    p = Path('scripts/discord_source_monitor.py')
    s = p.read_text(encoding='utf-8')
    s = s.replace('from free_art import criar_card_gratis\n', 'from scripts.curated_dispatch import gerar_persistir_e_enviar\n', 1)
    old = '''    imagem_url = criar_arte_e_publicar_asset(msg, nome, corpo, coords)\n    if not imagem_url:\n        return False\n\n    payload = {\n'''
    if old in s:
        s = s.replace(old, '    payload = {\n', 1)
    s = s.replace('        "imagem_url": imagem_url,\n        "gerar_arte": False,\n', '', 1)
    old2 = '''    r = requests.post(SPIDEY_ENDPOINT, json=payload, timeout=180)\n    r.raise_for_status()\n    data = r.json()\n'''
    new2 = '''    data = gerar_persistir_e_enviar(payload, f"sps-{msg.get('id')}")\n'''
    if old2 in s:
        s = s.replace(old2, new2, 1)
    s = s.replace(' | arte=gratis_spidey",', ' | arte=curada_spidey",')
    p.write_text(s, encoding='utf-8')

    p = Path('.github/workflows/spidey-discord-source.yml')
    s = p.read_text(encoding='utf-8')
    s = s.replace('      # Arte gerada localmente com Pillow a partir da imagem-fonte encaminhada.\n', '')
    s = s.replace('        run: python -m pip install --quiet requests Pillow\n', '        run: python -m pip install --quiet requests\n')
    s = s.replace(
        '          GH_TOKEN: ${{ github.token }}\n',
        '          GH_TOKEN: ${{ github.token }}\n          GITHUB_TOKEN: ${{ github.token }}\n          SPIDEY_BASE: "https://spidey-pokemon-go.onrender.com"\n',
        1,
    )
    p.write_text(s, encoding='utf-8')


def patch_sps_weekly():
    p = Path('scripts/sps_weekly_monitor.py')
    s = p.read_text(encoding='utf-8')
    insert = 'from scripts.curated_dispatch import gerar_persistir_e_enviar\n'
    if insert not in s:
        anchor = 'import requests\n'
        s = s.replace(anchor, anchor + '\n' + insert, 1)
    s = s.replace('        "gerar_arte": True,\n        "permitir_fallback": False,\n', '', 1)
    old = '''    r = requests.post(SPIDEY_ENDPOINT, json=payload, timeout=180)\n    if r.status_code == 503:\n        print("SPS semanal localizado, mas arte premium ainda indisponível.", flush=True)\n        print(r.text[:500], flush=True)\n        return False\n    r.raise_for_status()\n    data = r.json()\n'''
    new = '''    data = gerar_persistir_e_enviar(payload, f"sps-weekly-{msg.get('id')}")\n'''
    if old in s:
        s = s.replace(old, new, 1)
    p.write_text(s, encoding='utf-8')

    p = Path('.github/workflows/spidey-sps-weekly.yml')
    s = p.read_text(encoding='utf-8')
    if 'GITHUB_TOKEN: ${{ github.token }}' not in s:
        marker = '          DISCORD_BOT_TOKEN: ${{ secrets.DISCORD_BOT_TOKEN }}\n'
        s = s.replace(marker, marker + '          GITHUB_TOKEN: ${{ github.token }}\n          SPIDEY_BASE: "https://spidey-pokemon-go.onrender.com"\n', 1)
    p.write_text(s, encoding='utf-8')


patch_pokeminers()
patch_g47ix()
patch_oficial()
patch_sps_individual()
patch_sps_weekly()
