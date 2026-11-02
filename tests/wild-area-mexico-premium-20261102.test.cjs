'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('spidey-app/index.html');
const sw=read('spidey-app/sw.js');
const js=read('spidey-app/wild-area-mexico-20261102.js');
const css=read('spidey-app/wild-area-mexico-20261102.css');
const menu=read('spidey-app/mobile-side-menu.js');
const event=JSON.parse(read('spidey-app/data/events.json')).events.filter(e=>e.id==='2026-11-go-wild-area-mexico-city');

test('Existe somente um evento oficial Wild Area Mexico no catalogo',()=>{
  assert.equal(event.length,1);
  assert.equal(event[0].status,'published');
  assert.equal(event[0].schedule.local_timezone,'America/Mexico_City');
  assert.equal(event[0].schedule.brazil_timezone,'America/Sao_Paulo');
  assert.equal(event[0].schedule.start_brazil,'2026-11-06T13:00:00-03:00');
  assert.equal(event[0].schedule.end_brazil,'2026-11-08T21:00:00-03:00');
});
test('Aba propria, navegacao nativa e menu lateral sem nova rota',()=>{
  assert.match(html,/<section id="wildAreaMexicoView" class="app-view wild-mx-view" hidden/);
  assert.match(html,/<button class="app-tab wild-mx-tab" data-view="wildAreaMexicoView">/);
  assert.match(menu,/'newsView','wildAreaMexicoView','weeklyView'/);
  assert.match(menu,/wildAreaMexicoView: '✧'/);
  assert.match(js,/\.app-tab\[data-view=/);
  assert.match(js,/SpideyOpenSharedEvent\?\.\(EVENT_ID\)/);
  assert.match(js,/openView\('stampsView'\)/);
});
test('Pesquisas separadas e limites de horarios corretos',()=>{
  assert.match(html,/id="wildMxResearch"/);
  assert.match(html,/PESQUISA ESPECIAL/);
  assert.match(html,/PESQUISA TEMPORÁRIA/);
  assert.match(html,/PESQUISA DE CAMPO/);
  assert.match(html,/As tarefas individuais ainda não foram detalhadas oficialmente/);
  assert.match(html,/até <strong>20h locais \(23h Brasília\)<\/strong>/);
  assert.match(html,/13h–21h em Brasília/);
  assert.match(html,/13h–23h em Brasília/);
  assert.match(html,/Dia Extra <b>não<\/b> dá outro Rally/);
});
test('Safari Balls com regras oficiais e Selos com sete lugares sem GPX falso',()=>{
  assert.match(html,/Bal[oa]s Safári GO|Bolas Safári GO/);
  assert.match(html,/balões de suprimentos surgem de hora em hora/);
  assert.match(html,/deixam de estar disponíveis no inventário/);
  const list=html.match(/<ol class="wild-mx-stamp-list">([\s\S]*?)<\/ol>/);
  assert(list);
  assert.equal((list[1].match(/<li>/g)||[]).length,7);
  assert.match(html,/não são coordenadas exatas verificadas/);
  assert.match(html,/não geram GPX/);
});
test('Ingressos por dia, complementos e evento Global separados',()=>{
  for(const price of ['MXN$ 350','MXN$ 200','MXN$ 300'])assert(html.includes(price));
  assert.match(html,/O evento <strong>Global<\/strong> de 14 e 15\/11 é separado/);
  assert.match(html,/https:\/\/pokemongo\.com\/gowildarea\/mexico-city\/tickets/); 
});
test('Imagem Premium existente preservada sem crop; PWA versionado',()=>{
  assert.match(html,/assets\/events\/premium\/wild-area-mexico-city-2026-approved-v1\.png/);
  assert.match(sw,/assets\/events\/premium\/wild-area-mexico-city-2026-approved-v1\.png/);
  assert.match(css,/object-fit:contain!important/);
  assert.doesNotMatch(css,/object-fit\s*:\s*cover/i);
  assert.match(sw,/spidey-app-20261102-wildmexico1/);
  assert.match(sw,/\.\/wild-area-mexico-20261102\.js/);
  assert.match(sw,/\.\/wild-area-mexico-20261102\.css/);
  assert.match(html,/wild-area-mexico-20261102\.js\?v=20261102-wild1/);
  assert.match(html,/wild-area-mexico-20261102\.css\?v=20261102-wild1/);
});
test('Destaque na Home deixa de aparecer apos a data de encerramento',()=>{
  assert.match(js,/featureActive\(now=Date\.now\(\)\)/);
  assert.match(js,/2026-11-08T21:00:00-03:00/);
  assert.match(js,/block\?\.remove\(\)/);
  assert.match(js,/spideyhomeupdated/);
});
