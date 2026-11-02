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
test('Imagem oficial Machamp e Safari Ball reais; artes anteriores preservadas no Git e precache PWA',()=>{
  const art=read('spidey-app/wild-area-mexico-art-20261102.css');
  const master=read('spidey-app/premium-approved-master.js');
  assert.match(master,/wild-area-mexico-city-2026-approved-v1\.png/);
  assert.match(sw,/assets\/events\/premium\/wild-area-mexico-city-2026-approved-v1\.png/);
  assert.match(html,/wild-mx-machamp-spotlight/);
  assert.match(html,/Machamp com jaqueta e capa modernas, quatro braços/);
  assert.match(html,/lh3\.googleusercontent\.com\/EwKELOgm/);
  assert.match(html,/www\.pokemon\.com\/static-assets\/content-assets\/cms2\/img\/video-games/);
  assert.doesNotMatch(html,/wild-mx-safari-stamp/);
  assert.match(html,/Bola Safári GO oficial, camuflagem verde e marrom/);
  assert.match(art,/wild-mx-real-safari img/);
  assert.match(art,/object-fit:contain!important/);
  assert.match(sw,/spidey-app-20261102-wildfix1/);
  assert.match(sw,/\.\/wild-area-mexico-art-20261102\.css/);
  assert.match(html,/wild-area-mexico-20261102\.js\?v=20261102-wildart1/);
  assert.match(html,/wild-area-mexico-art-20261102\.css\?v=20261102-wildart1/);
});
test('Tres paineis editoriais com habitats e spawns oficiais, sem confundir Incenso',()=>{
  const art=read('spidey-app/wild-area-mexico-art-20261102.css');
  assert.match(html,/class="wild-mx-featured-roster"/);
  for(const part of ['wild-mx-roster-steel','wild-mx-roster-dragon','wild-mx-roster-mighty'])assert(html.includes(part));
  for(const name of ['Solid as Steel','Daring as Dragons','Beldum, Lucario, Ferroseed, Klink','Dratini, Bagon, Gible, Axew, Deino e Frigibax','Machamp de jaqueta','Hawlucha na Cidade do México'])assert(html.includes(name));
  assert.match(html,/Incenso comum; não fazem parte de um habitat exclusivo/);
  assert.match(art,/@media\(max-width:650px\)/);
  assert.match(art,/grid-template-columns:1fr/);
});
test('Destaque na Home deixa de aparecer apos a data de encerramento',()=>{
  assert.match(js,/featureActive\(now=Date\.now\(\)\)/);
  assert.match(js,/2026-11-08T21:00:00-03:00/);
  assert.match(js,/block\?\.remove\(\)/);
  assert.match(js,/spideyhomeupdated/);
});
