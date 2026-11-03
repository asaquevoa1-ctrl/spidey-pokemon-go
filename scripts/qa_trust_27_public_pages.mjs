// O deploy só é confirmado quando o Pages entrega os arquivos desta revisão.
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base='https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const hash=x=>createHash('sha256').update(x).digest('hex');
const packageApp='pages-public/spidey-app/';
const sourceIndex=readFileSync(packageApp+'index.html','utf8');
const sources=['national-trust-v1.js','app.js','national-trust-v1.css','data/events.json','fly-v1.js','trust-world-v1.js','sw.js','stamps-v2.js','stamps-premium-20261102.css','stamps-community-routes-20261102.js','stamps-community-routes-20261102.css','data/community-routes-20261102.json','pvp-premium-20261102.css'];
const assets=new Map(sources.map(name=>[name,readFileSync(packageApp+name)]));
const versions=new Map();
for(const name of ['national-trust-v1.js','app.js','national-trust-v1.css','fly-v1.js','trust-world-v1.js','stamps-v2.js','stamps-premium-20261102.css','stamps-community-routes-20261102.js','stamps-community-routes-20261102.css','pvp-premium-20261102.css']){
 const escaped=name.replaceAll('.','\\.');
 const found=sourceIndex.match(new RegExp(escaped+'\\?v=[^"\\s]+'));
 assert(found,'Referência da versão ausente em index.html: '+name);
 versions.set(name,found[0]);
}
let verified=false,lastError='';
for(let attempt=1;attempt<=12;attempt++){
 try{
  const query='?verify='+Date.now()+'-'+attempt;
  const response=await fetch(base+'index.html'+query,{cache:'no-store'});
  if(!response.ok)throw Error('HTML público HTTP '+response.status);
  const index=await response.text();
  if(!index.includes('Trust · 27'))throw Error('Menu Trust · 27 ainda ausente');
  for(const [name,version] of versions){
    if(!index.includes(version))throw Error('HTML público ainda não recebeu a versão de '+name);
  }
  for(const [name,source] of assets){
    const remote=await fetch(base+name+query,{cache:'no-store'});
    if(!remote.ok)throw Error(name+' público HTTP '+remote.status);
    const bytes=Buffer.from(await remote.arrayBuffer());
    if(hash(bytes)!==hash(source))throw Error(name+' público não corresponde ao código atual');
  }
  const stampsCss=assets.get('stamps-premium-20261102.css').toString('utf8');
  const stamps=assets.get('stamps-v2.js').toString('utf8');
  const publicApp=assets.get('app.js').toString('utf8');
  assert(stampsCss.includes('#stampsView .stamp-list')&&stampsCss.includes('object-fit:contain'));
  assert(stamps.includes('stamp-location-summary-v2')&&stamps.includes('copyAllStampCoords'));
  assert(!/stampToggleDone|saveStampProgress|Marcar como feito|Marcar como faltante|data-stamp-filter="done"|data-stamp-filter="remaining"/.test(stamps));
  assert(!/stamp-toggle|rallyProgressText|getStampProgress|saveStampProgress/.test(publicApp));
  assert(index.includes('Explore as coleções, veja os locais e copie coordenadas com facilidade.'));
  const shared=JSON.parse(assets.get('data/community-routes-20261102.json').toString('utf8'));
  const sharedUi=assets.get('stamps-community-routes-20261102.js').toString('utf8');
  assert.equal(shared.routes.length,2);
  assert.deepEqual(shared.routes.map(r=>r.points.length),[8,8]);
  assert(sharedUi.includes('data-community-copy-all')&&sharedUi.includes('data-community-copy-one'));
  assert(index.includes('stamps-community-routes-20261102.js')&&index.includes('stamps-community-routes-20261102.css'));
  const fly=assets.get('fly-v1.js').toString('utf8');
  const world=assets.get('trust-world-v1.js').toString('utf8');
  const sw=assets.get('sw.js').toString('utf8');
  assert(!fly.includes('flySourceCredits')&&!fly.includes('Créditos e origem da lista mundial'));
  assert(!world.includes("innerHTML='<summary>Eventos presenciais por região"));
  assert(world.includes("fly.querySelector('#flyRegionalEvents')?.remove()"));
  assert(sw.includes('fly-clean2-autorefresh')&&sw.includes('client.navigate(client.url)'));
  const trust=assets.get('national-trust-v1.js').toString('utf8');
  const app=assets.get('app.js').toString('utf8');
  assert(trust.includes('Copiar todas as 27')&&trust.includes('allCoordinatesText'));
  assert(app.includes('ntEventCopyAll'));
  const events=JSON.parse(assets.get('data/events.json').toString('utf8'));
  assert.equal(events.events.find(e=>e.id==='2026-national-trust-27-sites')?.locations.length,27);
  verified=true;
  console.log('GITHUB PAGES CONFIRMADO: lista e copiar todas as 27, com os arquivos exatos da revisão publicada');
  break;
 }catch(e){
  lastError=String(e.message||e);
  console.log('GitHub Pages '+attempt+'/12: '+lastError);
  if(attempt<12)await delay(10000);
 }
}
if(!verified)throw Error('Publicação ainda NÃO confirmada: '+lastError);
