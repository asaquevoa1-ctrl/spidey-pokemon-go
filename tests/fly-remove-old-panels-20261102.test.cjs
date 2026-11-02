'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const fly=read('spidey-app/fly-v1.js');
const world=read('spidey-app/trust-world-v1.js');
const core=read('spidey-app/fly-core.js');
const html=read('spidey-app/index.html');
const sw=read('spidey-app/sw.js');
const route=JSON.parse(read('spidey-app/data/world-event-points.json'));

test('FLY nao mostra secao de creditos da lista mundial',()=>{
  assert.doesNotMatch(fly,/id="flySourceCredits"|Créditos e origem da lista mundial/);
  assert.doesNotMatch(fly,/showSourceCredits|raw\.textContent=source\.credits/);
  assert.match(fly,/flyRouteList/);
  assert.match(fly,/data-coord=/);
  assert.match(fly,/Copiar coordenadas/);
  assert.match(fly,/Abrir mapa/);
  assert.match(fly,/flyEventDetails/);
});
test('Eventuais cards presenciais regionais sao retirados do FLY, nao do catalogo',()=>{
  assert.doesNotMatch(world,/innerHTML='<summary>Eventos presenciais por região/);
  assert.doesNotMatch(world,/insertAdjacentElement\('afterend',regionals\)/);
  assert.match(world,/fly\.querySelector\('#flyRegionalEvents'\)\?\.remove\(\)/);
  assert.match(world,/mountLocalFly\(\)/);
  assert.match(world,/renderWorldEvents\(\)/);
  assert.match(world,/worldEvents\.filter\(event=>visibleWorldEvent\(event\)\)/);
  assert.match(world,/openLocalEvent\(/);
});
test('A origem das coordenadas continua arquivada sem expor a caixa antiga',()=>{
  assert.match(core,/SPIDEY_FLY_REFERENCE_SOURCE=d\.source_list_2023/);
  assert.ok(route.source_list_2023.credits.includes('LendáriosBrasil'));
  assert.ok(route.source_list_2023.credits.includes('FlyGPS'));
  assert.ok(route.source_list_2023.credits.includes('PokemonTrail'));
  assert.ok(route.source_list_2023.credits.includes('Fantasma'));
  assert.ok(route.points.length>=67);
});
test('PWA entrega scripts atualizados e mantem FLY Premium',()=>{
  assert.match(html,/fly-v1\.js\?v=20261102-fly-clean1/);
  assert.match(html,/trust-world-v1\.js\?v=20261102-fly-clean1/);
  assert.match(html,/fly-premium-20261102\.js\?v=20261102-flypremium1/);
  assert.match(sw,/const CACHE = 'spidey-app-20261102-fly-clean2-autorefresh'/);
  assert.match(sw,/const outdated = keys\.filter/);
  assert.match(sw,/client\.navigate\(client\.url\)/);
  assert.match(sw,/\.\/fly-premium-20261102\.js/);
});