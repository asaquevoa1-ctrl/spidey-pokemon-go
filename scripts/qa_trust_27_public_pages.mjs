import {strict as assert} from 'node:assert';
const base='https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let verified=false,lastError='';
for(let attempt=1;attempt<=12;attempt++){
  try{
    const query='?ntcoordverify='+attempt+'-'+Date.now();
    const index=await fetch(base+query,{cache:'no-store'}).then(r=>{
      if(!r.ok)throw Error('Public Home HTTP '+r.status);return r.text();
    });
    if(!index.includes('national-trust-v1.js?v=20261101-ntvisible4'))throw Error('HTML ainda sem script Trust atualizado');
    if(!index.includes('Trust · 27'))throw Error('HTML ainda sem aba Trust · 27');
    const [trust,universe,events]=await Promise.all([
      fetch(base+'national-trust-v1.js'+query).then(r=>{if(!r.ok)throw Error('Trust script HTTP '+r.status);return r.text()}),
      fetch(base+'spidey-universe-3d.js'+query).then(r=>{if(!r.ok)throw Error('3D HTTP '+r.status);return r.text()}),
      fetch(base+'data/events.json'+query).then(r=>{if(!r.ok)throw Error('Eventos HTTP '+r.status);return r.json()})
    ]);
    if(!trust.includes('27 coordenadas para copiar')||!trust.includes('EMBEDDED_PLACES'))throw Error('Trust sem lista embarcada');
    if(!universe.includes('Ver 27 coordenadas'))throw Error('Explorar 3D sem CTA');
    const ev=events.events.find(e=>e.id==='2026-national-trust-27-sites');
    assert.equal(ev?.locations?.length,27);
    verified=true;
    console.log('VERIFICADO NO GITHUB PAGES: URL '+base+' | 27 locais no catálogo | Trust embutido | 3D identificado');
    break;
  }catch(e){
    lastError=String(e.message||e);
    console.log('Tentativa '+attempt+'/12: '+lastError);
    await delay(10000);
  }
}
if(!verified)throw Error('Versão pública NÃO confirmada: '+lastError);
