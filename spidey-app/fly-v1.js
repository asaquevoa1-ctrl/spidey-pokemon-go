(() => {
'use strict';
const points=[
['🇰🇮','Kiritimati','Kiribati','Pacific/Kiritimati',1.987149,-157.477137],
['🇼🇸','Fagali’i','Samoa','Pacific/Apia',-13.831357,-171.766401],
['🇳🇿','Auckland','Nova Zelândia','Pacific/Auckland',-36.852095,174.763180],
['🇳🇿','Wellington Botanic Garden','Nova Zelândia','Pacific/Auckland',-41.2846675,174.7664883],
['🇦🇺','Sydney','Austrália','Australia/Sydney',-33.866173,151.205945],
['🇦🇺','Melbourne','Austrália','Australia/Melbourne',-37.817509,144.963305],
['🇰🇷','Seul','Coreia do Sul','Asia/Seoul',37.511304,127.09820],
['🇯🇵','Osaka','Japão','Asia/Tokyo',34.65011,135.51050],
['🇯🇵','Nagoya','Japão','Asia/Tokyo',35.15530,136.91978],
['🇯🇵','Shinjuku Central Park','Japão','Asia/Tokyo',35.68895,139.69054],
['🇹🇼','Taipei','Taiwan','Asia/Taipei',25.0444,121.5296],
['🇭🇰','Hong Kong','Hong Kong','Asia/Hong_Kong',22.277957,114.15616],
['🇮🇩','Jacarta','Indonésia','Asia/Jakarta',-6.175554,106.827587],
['🇮🇳','Tamil Nadu','Índia','Asia/Kolkata',13.0403,80.2666],
['🇦🇪','Dubai','Emirados Árabes','Asia/Dubai',25.076750,55.132940],
['🇬🇷','Tessalônica','Grécia','Europe/Athens',40.626936,22.952342],
['🇪🇸','Saragoça','Espanha','Europe/Madrid',41.661609,-0.894640],
['🇮🇹','Coliseu, Roma','Itália','Europe/Rome',41.889988,12.493033],
['🇬🇧','Londres','Reino Unido','Europe/London',51.501000,-0.124600],
['🇧🇷','Fernando de Noronha','Brasil','America/Noronha',-3.84010,-32.41181],
['🇧🇷','Ibirapuera, São Paulo','Brasil','America/Sao_Paulo',-23.58417130,-46.66072464],
['🇧🇷','Quinta da Boa Vista, Rio','Brasil','America/Sao_Paulo',-22.906534,-43.223197],
['🇦🇷','Buenos Aires','Argentina','America/Argentina/Buenos_Aires',-34.608403,-58.372164],
['🇺🇸','Central Park, Nova York','EUA','America/New_York',40.7803,-73.9630],
['🇨🇦','Toronto City Hall','Canadá','America/Toronto',43.653310,-79.384008],
['🇺🇸','Chicago','EUA','America/Chicago',41.898659,-87.623077],
['🇲🇽','Cidade do México','México','America/Mexico_City',19.435359,-99.145402],
['🇨🇦','Calgary','Canadá','America/Edmonton',51.046315,-114.071824],
['🇺🇸','Pier 39, São Francisco','EUA','America/Los_Angeles',37.8095,-122.4101],
['🇨🇦','Vancouver','Canadá','America/Vancouver',49.26906,-123.13451],
['🇺🇸','Anchorage','Alasca','America/Anchorage',61.217019,-149.891609],
['🇺🇸','Honolulu','Havaí','Pacific/Honolulu',21.2658,-157.8213],
['🇦🇸','Fagatogo','Samoa Americana','Pacific/Pago_Pago',-14.277739,-170.688512]
].map((p,i)=>({order:i+1,flag:p[0],city:p[1],country:p[2],tz:p[3],lat:p[4],lng:p[5]}));
window.SPIDEY_FLY_POINTS=points;
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function nowAt(tz){try{return new Intl.DateTimeFormat('pt-BR',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())}catch{return '—'}}
function card(p){const coord=`${p.lat},${p.lng}`;return `<article class="fly-point"><div class="fly-order">${String(p.order).padStart(2,'0')}</div><div class="fly-place"><strong>${p.flag} ${esc(p.city)}</strong><span>${esc(p.country)}</span><small>Agora no local: ${nowAt(p.tz)} · ${esc(p.tz)}</small></div><code>${coord}</code><button class="fly-copy" data-coord="${coord}" type="button">Copiar</button></article>`}
function render(){const root=$('#flyRouteList');if(!root)return;root.innerHTML=points.map(card).join('');root.addEventListener('click',async e=>{const b=e.target.closest('[data-coord]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.coord);b.textContent='Copiado ✓';setTimeout(()=>b.textContent='Copiar',1200)}catch{prompt('Copie as coordenadas:',b.dataset.coord)}});$('#flyPointCount').textContent=points.length;}
function init(){render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();