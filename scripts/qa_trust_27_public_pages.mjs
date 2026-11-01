// O deploy só é confirmado quando o Pages entrega os arquivos desta revisão.
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base='https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const hash=x=>createHash('sha256').update(x).digest('hex');
const sourceIndex=readFileSync('spidey-app/index.html','utf8');
const sources=['national-trust-v1.js','app.js','national-trust-v1.css','data/events.json'];
const assets=new Map(sources.map(name=>[name,readFileSync('spidey-app/'+name)]));
const versions=new Map();
for(const name of ['national-trust-v1.js','app.js','national-trust-v1.css']){
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
