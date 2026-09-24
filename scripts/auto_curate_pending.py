import html, io, json, os, re, unicodedata
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

PENDING = Path("queue/pending")
CURATED = Path("queue/curated")
ASSETS = Path("assets/generated")
REPO = os.getenv("GITHUB_REPOSITORY", "asaquevoa1-ctrl/spidey-pokemon-go")
BRANCH = os.getenv("SPIDEY_ASSET_BRANCH", "main")
UA = "Mozilla/5.0 (SpideyPokemonGO/2.0)"
W, H = 1080, 1350
GENERIC = {"pokemon","pokemongo","noticia","evento","event","update","oficial","g47ix",
           "trainer","trainers","pikachu","raid","raids","research","timed","shiny",
           "city","safari","coming","available","details","fonte","source","game"}
STOP = {"para","com","uma","das","dos","que","por","mais","como","esta","the","and","for",
        "with","this","that","from","will","are","you","your","next","into","have","get",
        "has","not","yet","now","two","days","visit","show","comments","just","is","in",
        "to","of","on","a","an","or","at","be","it","we","our","ao","aos","na","no","em"}

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.images=[]; self.description=""; self.in_p=False; self.parts=[]; self.paragraphs=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=="meta":
            k=(a.get("property") or a.get("name") or "").lower(); v=(a.get("content") or "").strip()
            if k in {"og:image","twitter:image","twitter:image:src"} and v: self.images.append(html.unescape(v))
            if k in {"description","og:description","twitter:description"} and v and not self.description:
                self.description=html.unescape(v).strip()
        elif tag=="p": self.in_p=True; self.parts=[]
    def handle_data(self, data):
        if self.in_p and data.strip(): self.parts.append(data.strip())
    def handle_endtag(self, tag):
        if tag=="p" and self.in_p:
            t=re.sub(r"\s+"," "," ".join(self.parts)).strip()
            if len(t)>=35: self.paragraphs.append(t)
            self.in_p=False; self.parts=[]

def get(url, **kw):
    h=dict(kw.pop("headers",{})); h.setdefault("User-Agent",UA)
    return requests.get(url,headers=h,**kw)

def noacc(t):
    return "".join(c for c in unicodedata.normalize("NFKD",str(t or "")) if not unicodedata.combining(c))

def words(t):
    return {w for w in re.findall(r"[a-z0-9]{4,}",noacc(t).lower()) if w not in STOP|GENERIC and not w.isdigit()}

def kind(x):
    s=str(x.get("_source_id") or "")
    return "OFICIAL" if s.startswith("oficial-") else "G47IX" if s.startswith("g47ix-") else "POKEMINERS" if s.startswith("pokeminers-") else "SPS" if s.startswith("sps-") else "SPIDEY"

def duplicate(a,b):
    if (kind(a)=="OFICIAL")== (kind(b)=="OFICIAL"): return False
    return any(len(w)>=6 for w in words(a.get("mensagem")) & words(b.get("mensagem")))

def clean_msg(t):
    return re.sub(r"\n*\s*📌\s*Fonte:.*$","",str(t or ""),flags=re.I|re.S).strip()

def english(t):
    s=f" {noacc(t).lower()} "
    return sum(x in s for x in (" the "," and "," is "," are "," will "," available "," visit "," stores "," due "," event "," storm "," rescheduled "))>=2

def translate(t):
    if not english(t): return t
    try:
        r=get("https://translate.googleapis.com/translate_a/single",
              params={"client":"gtx","sl":"auto","tl":"pt","dt":"t","q":t},timeout=20)
        r.raise_for_status(); p=r.json()
        out="".join(x[0] for x in (p[0] or []) if isinstance(x,list) and x and x[0]).strip()
        if out and out!=t: return out
    except Exception as e: print("TRADUCAO_GOOGLE:",e)
    try:
        r=get("https://api.mymemory.translated.net/get",
              params={"q":t[:4500],"langpair":"en|pt-BR"},timeout=25)
        r.raise_for_status(); out=str((r.json().get("responseData") or {}).get("translatedText") or "").strip()
        if out and out.lower()!=t.lower(): return html.unescape(out)
    except Exception as e: print("TRADUCAO_MYMEMORY:",e)
    return t

def page(url):
    r=get(url,timeout=30,allow_redirects=True); r.raise_for_status()
    p=Page(); p.feed(r.text); return p

def urls(t):
    return [u.rstrip(".,") for u in re.findall(r"https?://[^\s<>\]\)]+",str(t or ""))]

def pogo_url(u):
    return str(u or "").strip().replace("/pt_BR/","/pt-BR/")

def page_candidates(item):
    out=[pogo_url(u) for u in urls(item.get("mensagem")) if "pokemongo.com/" in u]
    u=pogo_url(item.get("url"))
    if "pokemongo.com/" in u: out.append(u)
    for base in list(out):
        if "/pt-BR/" in base: out.append(base.replace("/pt-BR/","/en/"))
        elif "pokemongo.com/news/" in base: out.append(base.replace("pokemongo.com/news/","pokemongo.com/en/news/"))
    return list(dict.fromkeys(out))

def recursive_images(obj):
    out=[]
    def walk(x):
        if isinstance(x,dict):
            for v in x.values(): walk(v)
        elif isinstance(x,list):
            for v in x: walk(v)
        elif isinstance(x,str) and x.startswith("http"):
            l=x.lower()
            if "pbs.twimg.com/media" in l or "video_thumb" in l or re.search(r"\.(png|jpe?g|webp)(\?|$)",l): out.append(x)
    walk(obj)
    return list(dict.fromkeys(out))

def fx_images(item):
    m=re.search(r"g47ix-(\d+)",str(item.get("_source_id") or ""))
    if not m: return []
    pid=m.group(1); out=[]
    try:
        r=get("https://api.fxtwitter.com/2/profile/g47ix/statuses?count=20",timeout=30); r.raise_for_status()
        for post in r.json().get("results") or []:
            if str(post.get("id"))==pid: out+=recursive_images(post); break
    except Exception as e: print("FX:",e)
    return out

def matching_social_images(item):
    if kind(item)!="OFICIAL": return []
    for p in sorted(PENDING.glob("*/*.json")):
        try: other=json.loads(p.read_text(encoding="utf-8"))
        except Exception: continue
        if kind(other)=="G47IX" and duplicate(item,other):
            imgs=fx_images(other)
            if imgs: return imgs
    return []

def image_candidates(item):
    out=[]
    for u in page_candidates(item):
        try: out+=page(u).images
        except Exception as e: print("PAGE:",u,e)
    if kind(item)=="OFICIAL": out+=matching_social_images(item)
    if kind(item)=="G47IX": out+=fx_images(item)
    for k in ("image_url","imagem_url","media_url","thumbnail_url"):
        if item.get(k): out.append(str(item[k]))
    return list(dict.fromkeys(out))

def load_image(url):
    r=get(url,timeout=45,allow_redirects=True); r.raise_for_status()
    if len(r.content)<8000: raise ValueError("arquivo pequeno")
    Image.open(io.BytesIO(r.content)).verify()
    im=Image.open(io.BytesIO(r.content)).convert("RGB")
    if im.width<500 or im.height<350: raise ValueError(f"imagem pequena {im.size}")
    lo,hi=im.resize((64,64)).convert("L").getextrema()
    if hi<=12 or (hi-lo<=3 and hi<=24): raise ValueError("imagem preta")
    return im

def cover(im):
    q=max(W/im.width,H/im.height); im=im.resize((int(im.width*q),int(im.height*q)),Image.Resampling.LANCZOS)
    x=(im.width-W)//2; y=(im.height-H)//2
    return im.crop((x,y,x+W,y+H))

def ft(size,bold=False):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
              "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"):
        try: return ImageFont.truetype(p,size)
        except OSError: pass
    return ImageFont.load_default()

def wrap(draw,text,font,maxw,limit=3):
    lines=[]; cur=""
    for w in str(text).split():
        trial=(cur+" "+w).strip()
        if draw.textbbox((0,0),trial,font=font)[2]<=maxw: cur=trial
        else:
            if cur: lines.append(cur)
            cur=w
            if len(lines)>=limit: break
    if cur and len(lines)<limit: lines.append(cur)
    return lines

def headline(msg,title):
    h=re.sub(r"https?://\S+","",clean_msg(msg).split("\n",1)[0]).strip()
    return (h or title)[:180]

def render(item,src,out,msg):
    c=ImageEnhance.Contrast(cover(src)).enhance(1.06).convert("RGBA")
    ov=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(ov)
    for y in range(H):
        a=0 if y<320 else min(225,int((y-320)*.22))
        d.line((0,y,W,y),fill=(2,12,28,a))
    c.alpha_composite(ov); d=ImageDraw.Draw(c)
    chip=re.sub(r"^[^A-Za-zÀ-ÿ0-9]*","",str(item.get("titulo") or "NOTÍCIA")).upper()[:40]
    cf=ft(25,True); cw=min(W-250,d.textbbox((0,0),chip,font=cf)[2]+55)
    d.rounded_rectangle((42,42,42+cw,101),radius=25,fill=(4,24,54,225),outline=(52,188,255,220),width=2)
    d.text((69,59),chip,font=cf,fill="white")
    lp=Path("assets/spidey-logo-oficial.jpg")
    if not lp.exists(): raise RuntimeError("logo oficial ausente")
    logo=Image.open(lp).convert("RGB").resize((130,130),Image.Resampling.LANCZOS).convert("RGBA")
    mask=Image.new("L",(130,130)); ImageDraw.Draw(mask).ellipse((0,0,129,129),fill=255)
    c.paste(logo,(W-172,42),mask)
    text=headline(msg,str(item.get("titulo") or "Pokémon GO")).upper()
    font=ft(52,True); lines=wrap(d,text,font,W-110,3); y=1010
    for line in lines:
        d.text((57,y+3),line,font=font,fill=(0,0,0,180)); d.text((54,y),line,font=font,fill="white"); y+=60
    d.text((54,H-62),f"SPIDEY • Fonte: {kind(item)}",font=ft(23,True),fill=(195,227,255))
    out.parent.mkdir(parents=True,exist_ok=True)
    c.convert("RGB").save(out,"JPEG",quality=93,optimize=True)

def enrich(item):
    body=clean_msg(item.get("mensagem"))
    if kind(item)=="G47IX": body=translate(body)
    if kind(item)=="OFICIAL":
        try:
            p=page(page_candidates(item)[0] if page_candidates(item) else pogo_url(item.get("url"))); extra=p.description
            if extra and extra.lower() in body.lower(): extra=""
            if not extra:
                extra=next((x for x in p.paragraphs if x.lower() not in body.lower() and "cookie" not in x.lower()),"")
            if extra and len(body.split())<24: body+=f"\n\n{extra}"
        except Exception as e: print("ENRIQUECER:",e)
    label={"OFICIAL":"Pokémon GO oficial","G47IX":"G47IX","POKEMINERS":"PokeMiners","SPS":"SPS"}.get(kind(item),kind(item))
    return f"{body.strip()}\n\n📌 Fonte: {label}"

def raw(path):
    return f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{path.as_posix()}"

def load_pending():
    out=[]
    for p in sorted(PENDING.glob("*/*.json")):
        try: x=json.loads(p.read_text(encoding="utf-8"))
        except Exception as e: print("JSON:",p,e); continue
        if x.get("status")=="aguardando_arte_chatgpt": out.append((p,x))
    return out

def main():
    CURATED.mkdir(parents=True,exist_ok=True); ASSETS.mkdir(parents=True,exist_ok=True)
    rows=load_pending()
    if not rows: print("Nenhum item aguardando arte."); return 0
    officials=[x for x in rows if kind(x[1])=="OFICIAL"]; dup=set()
    for p,item in rows:
        if kind(item)=="OFICIAL": continue
        for _,off in officials:
            if duplicate(item,off):
                item["status"]="duplicado"; item["duplicate_of"]=off.get("_source_id")
                p.write_text(json.dumps(item,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
                dup.add(p); print("DUPLICADO",p.name,"->",off.get("_source_id")); break
    done=0
    for p,item in rows:
        if p in dup: continue
        msg=enrich(item); src=None; chosen=None; errs=[]
        for u in image_candidates(item):
            try: src=load_image(u); chosen=u; break
            except Exception as e: errs.append(str(e))
        if src is None:
            print("SEM_ARTE",p.name,"; ".join(errs[:3])); continue
        asset=ASSETS/(p.stem+".jpg"); render(item,src,asset,msg)
        out=CURATED/p.name
        source_url=pogo_url(item.get("url")) if kind(item)=="OFICIAL" else item.get("url")
        data={"titulo":item.get("titulo"),"mensagem":msg,"source_url":source_url,
              "image_url":raw(asset),"source_verified":True,
              "coordenadas":item.get("coordenadas",[]),"horarios":item.get("horarios",[]),
              "gerar_gpx":bool(item.get("gerar_gpx",True)),
              "gpx_nome":item.get("gpx_nome","spidey-evento.gpx"),"status":"pending",
              "_source_id":item.get("_source_id"),"_source_image":chosen,
              "created_at_utc":item.get("created_at_utc"),"curated_at_utc":datetime.now(timezone.utc).isoformat()}
        out.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        item["status"]="curated"; item["curated_path"]=out.as_posix(); item["asset_path"]=asset.as_posix()
        p.write_text(json.dumps(item,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        done+=1; print("CURADO",p.name)
    print(f"Auto-curadoria concluída: {done} item(ns)."); return 0

if __name__=="__main__": raise SystemExit(main())
