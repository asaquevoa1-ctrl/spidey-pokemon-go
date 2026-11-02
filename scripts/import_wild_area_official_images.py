#!/usr/bin/env python3
"""Import verified official GO Wild Area art onto the same origin as Spidey."""
from pathlib import Path
from io import BytesIO
from urllib.request import Request, urlopen
from PIL import Image, ImageOps
import hashlib, json

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/'spidey-app'
PREFIX='assets/events/wild-area/official-local-20261102'
SOURCES={
  'machamp': ('https://lh3.googleusercontent.com/EwKELOgmCLzqD8Ev1ZIa7KlcPlKkMexajZTROxHvRSSP4ubiYIfR6jzTJTOZglGPexOdOasxoUPVKOM5yyXbRxS5420m_iaXINV4VvyPsV0=s0-e365', 'machamp-jacket.webp'),
  'safari': ('https://www.pokemon.com/static-assets/content-assets/cms2/img/video-games/_tiles/pokemon-go/2025/11/03/inline/03.png', 'safari-ball.webp'),
  'steel': ('https://lh3.googleusercontent.com/Do3Z7F38dCYS_PaiDBDa1AAAUVSYWzaOxmPNTuy4oRqDSF5zo8jSYoKA-W4bUQN0F7gFAsYk3qXiB8fYDBFcwo2R8ymFsFtDVplXdHC-6SPG=s0-e365', 'solid-as-steel.webp'),
  'dragon': ('https://lh3.googleusercontent.com/5rQaHUrToRsfP6PBUy0eajQUG5TO2nDUFPo5BT4BFo3ee_owtoLfCB4aZi8EUdK0J3-HqM7-98SVbujF4z_tsguLMK_GrHl_InRklcA83fQ=s0-e365', 'daring-as-dragons.webp'),
  'mighty': ('https://lh3.googleusercontent.com/aBzko1zRt10EXht23yahoCr3KrC3NaCO1tBYMDX5IwHkonKWOfAaiiXX6VDlSAUE3ohleRSKa1JRKOpL7OXwpj2DoIs5jq2BOD-X5VkRugl6=s0-e365', 'mighty-latias-latios.webp')
}

def once(s,a,b):
  if s.count(a)!=1: raise RuntimeError('Unexpected count for '+a[:90]+': '+str(s.count(a)))
  return s.replace(a,b)

def fetch(label,url):
  r=Request(url,headers={'User-Agent':'Mozilla/5.0 (Spidey official-media importer)', 'Accept':'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8'})
  with urlopen(r,timeout=45) as f:
    mime=f.headers.get('Content-Type','')
    raw=f.read(12000001)
  if not mime.lower().startswith('image/') or not 8000<len(raw)<12000000: raise RuntimeError(label+' not image: '+mime)
  im=ImageOps.exif_transpose(Image.open(BytesIO(raw)))
  im.load()
  if min(im.size)<150: raise RuntimeError(label+' tiny '+str(im.size))
  im.thumbnail((1400,1100),Image.Resampling.LANCZOS)
  if im.mode not in ('RGB','RGBA'): im=im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
  buf=BytesIO(); im.save(buf,'WEBP',quality=85,method=6)
  blob=buf.getvalue()
  if len(blob)<4000: raise RuntimeError(label+' conversion too small')
  return blob,im.size

def main():
  # Download everything BEFORE modifying a single file.
  verified={k:fetch(k,url) for k,(url,_) in SOURCES.items()}
  index=APP/'index.html'; app=APP/'wild-area-mexico-20261102.js'; swfile=APP/'sw.js'
  t1=ROOT/'tests/wild-area-mexico-premium-20261102.test.cjs'
  t2=ROOT/'tests/wild-mexico-broken-images-20261102.test.cjs'
  html=index.read_text(); js=app.read_text(); sw=swfile.read_text(); a=t1.read_text(); b=t2.read_text()
  for name,(url,filename) in SOURCES.items():
    new=PREFIX+'/'+filename
    html=once(html,'src="'+url+'"','src="'+new+'"')
    if name=='machamp': js=once(js,"const POSTER='"+url+"';", "const POSTER='"+new+"';")
  html=once(html,'wild-area-mexico-20261102.js?v=20261102-wildart1','wild-area-mexico-20261102.js?v=20261102-local1')
  sw=once(sw,"const CACHE = 'spidey-app-20261102-wildfix1';","const CACHE = 'spidey-app-20261102-local1';")
  newitems='\n'.join("  './"+PREFIX+'/'+file+"'," for _,file in SOURCES.values())
  sw=once(sw,"  './assets/events/wild-area/go-safari-ball-fallback-20261102.svg',", "  './assets/events/wild-area/go-safari-ball-fallback-20261102.svg',\n"+newitems)
  # Images are part of installation cache for slow/mobile connections.
  anchor="  './assets/events/wild-area/go-safari-ball-fallback-20261102.svg'\n"
  sw=once(sw,anchor,"  './assets/events/wild-area/go-safari-ball-fallback-20261102.svg',\n"+newitems.rstrip(',')+'\n')
  a=once(a,"assert.match(html,/lh3\\.googleusercontent\\.com\\/EwKELOgm/);", "assert.match(html,/official-local-20261102\\/machamp-jacket\\.webp/);")
  a=once(a,"assert.match(html,/www\\.pokemon\\.com\\/static-assets\\/content-assets\\/cms2\\/img\\/video-games/);", "assert.match(html,/official-local-20261102\\/safari-ball\\.webp/);")
  a=once(a,'spidey-app-20261102-wildfix1','spidey-app-20261102-local1')
  a=once(a,'wild-area-mexico-20261102\\.js\\?v=20261102-wildart1','wild-area-mexico-20261102\\.js\\?v=20261102-local1')
  b=once(b,'spidey-app-20261102-wildfix1','spidey-app-20261102-local1')
  target=APP/PREFIX;target.mkdir(parents=True,exist_ok=True)
  info={}
  for name,(url,filename) in SOURCES.items():
    data,size=verified[name];(target/filename).write_bytes(data)
    info[name]={'path':PREFIX+'/'+filename,'source':url,'sha256':hashlib.sha256(data).hexdigest(),'pixels':size}
  (target/'manifest.json').write_text(json.dumps(info,indent=2,ensure_ascii=False)+'\n')
  index.write_text(html);app.write_text(js);swfile.write_text(sw);t1.write_text(a);t2.write_text(b)
  # Do not alter catalog or previously approved poster bytes.
  decision=ROOT/'SPIDEY_DECISIONS_CURRENT.md'
  with decision.open('a') as f:f.write('\n## 02/11/2026 — Correção de mídia local Wild Area\n- Imagens oficiais Machamp, Bola Safári GO, Aço, Dragão e Poderosos importadas pelo GitHub Actions como WebP local, com checksums e origem no manifesto de assets. Sem URLs externas nas imagens do guia. O pôster antigo permanece no master histórico. Testes estáticos e publicação em GitHub Pages devem ser checados separadamente do Android físico.\n')
  print('Validated '+str(len(info))+' local official assets')
if __name__=='__main__':main()
