'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const root=path.join(__dirname,'../spidey-app'),asset='assets/events/premium/go-tour-alola-2027-spidey-v1.avif',sha='d85f36424bae2581447c52362494bfa4cb81fb2429de0834226ddc8b19e30242',read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('go-tour-alola-2027.js'),css=read('go-tour-alola-2027.css'),html=read('index.html'),sw=read('sw.js'),master=read('premium-approved-master.js'),db=JSON.parse(read('data/events.json')).events;
test('Alola: imagem original local, integridade e logo S cósmico',()=>{
 const b=fs.readFileSync(path.join(root,asset));
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),sha);
 assert.equal(b.toString('ascii',4,12),'ftypavif');
 assert.ok(js.includes(asset));assert.doesNotMatch(js,/lh3\.googleusercontent\.com|go-tour-alola-2027\.svg/);
 assert.match(js,/alola-tour-premium-art/);assert.match(js,/spidey-icon-cosmic-192.png/);
});
test('Alola: Kaohsiung, Los Angeles e global com art master e sem Pokémon anunciado',()=>{
 const ids=['2027-go-tour-alola-kaohsiung','2027-go-tour-alola-los-angeles','2027-go-tour-alola-global'];
 for(const [i,id] of ids.entries()){
  const e=db.find(e=>e.id===id);
  assert.ok(e,id);assert.equal(e.art.url,asset);assert.equal(e.art.web_sha256,sha);
  assert.equal(e.status,'published');assert.equal(e.locations.length,0);
  assert.equal(e.schedule.start_date,i===2?'2027-02-27':'2027-02-19');
  assert.equal((e.pokemon||[]).length,0);assert.ok(master.includes(id));
 }
});
test('Alola: cards mobile, pôster ampliável, cache atualizado',()=>{
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(js,/let selected=null/);assert.match(css,/alola-tour-lightbox/);
 assert.match(html,/go-tour-alola-2027\.js\?v=20261116-alola3/);
 assert.match(html,/go-tour-alola-2027\.css\?v=20261116-alola3/);
 assert.match(sw,/const CACHE = 'spidey-app-2026\\d{4}-[a-z0-9-]+'/);
 assert.ok(sw.includes("'./"+asset+"'"));
});
