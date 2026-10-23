'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = name => fs.readFileSync(name, 'utf8');
const roster=JSON.parse(read('spidey-app/data/rocket-lineups.json'));
test('GO Rocket snapshot has Giovanni, three leaders, 22 grunt configurations and three validated slots',()=>{
 assert.equal(roster.schema_version,'spidey-rocket-v1');
 assert.equal(roster.members.length,26);
 assert.equal(roster.members.filter(m=>m.group==='boss').length,1);
 assert.equal(roster.members.filter(m=>m.group==='leader').length,3);
 assert.equal(roster.members.filter(m=>m.group==='grunt').length,22);
 assert.equal(roster.members.find(m=>m.source_key==='Giovanni').slots[2].pokemon[0].name,'Zekrom');
 assert.equal(roster.members.find(m=>m.source_key==='Sierra').slots[0].pokemon[0].name,'Pancham');
 assert.equal(roster.members.find(m=>m.source_key==='Cliff').slots[0].pokemon[0].name,'Cubone');
 assert.equal(roster.members.find(m=>m.source_key==='Arlo').slots[0].pokemon[0].name,'Alolan Grimer');
 const unique=new Set();
 for(const m of roster.members){
  assert.ok(!unique.has(m.id));unique.add(m.id);
  assert.equal(m.slots.length,3);
  for(const [index,slot] of m.slots.entries()){
   assert.equal(slot.position,index+1);
   assert.equal(typeof slot.encounter_possible,'boolean');
   assert.ok(slot.pokemon.length>0);
   assert.ok(slot.pokemon.every(p=>p.name && typeof p.shiny_possible==='boolean' && !('asset_url' in p)));
  }
 }
});
test('Rocket UI is accessible from the single mobile drawer and never restores a bottom mobile bar',()=>{
 const html=read('spidey-app/index.html'), app=read('spidey-app/app.js'),side=read('spidey-app/mobile-side-menu.js');
 const css=read('spidey-app/rocket-guide.css');
 const js=read('spidey-app/rocket-guide.js');
 assert.ok(html.includes('id="rocketGuideView" class="app-view" hidden'));
 assert.ok(html.includes('data-view="rocketGuideView"'));
 assert.ok(html.includes('id="rocketSearch"'));
 assert.ok(html.includes('rocket-guide.js?v=20261023-rocket1'));
 assert.ok(html.includes('rocket-guide.css?v=20261023-rocket1'));
 assert.ok(app.includes("if (viewId === 'rocketGuideView') window.SpideyRocket?.load();"));
 assert.ok(side.includes("'rocketGuideView'"));
 assert.ok(css.includes('.rocket-roster'));
 assert.ok(js.includes("fetch('data/rocket-lineups.json', {cache:'no-store'})"));
 assert.ok(js.includes('textContent'));
 assert.ok(!js.includes('innerHTML'));
 assert.doesNotThrow(()=>new vm.Script(js,{filename:'rocket-guide.js'}));
});
test('Rocket guides are packaged offline, data network-first, and external sources never auto receive player inputs',()=>{
 const sw=read('spidey-app/sw.js'),html=read('spidey-app/index.html');
 for(const path of ['./rocket-guide.js','./rocket-guide.css','./data/rocket-lineups.json'])
  assert.ok(sw.includes(path),path);
 assert.ok(sw.includes('hunter-feed|rocket-lineups'));
 assert.ok(html.includes('https://leekduck.com/rocket-lineups/'));
 const js=read('spidey-app/rocket-guide.js');
 assert.ok(!js.includes('localStorage'));
 assert.ok(!js.includes('navigator.geolocation'));
 assert.ok(!js.includes('cdn.leekduck.com'));
});
test('Source sync is scheduled and updates only if meaningful facts changed',()=>{
 const action=read('.github/workflows/spidey-rocket-roster.yml'),script=read('scripts/sync_rocket_lineups.py');
 assert.ok(action.includes("cron: '23 3,9,15,21 * * *'"));
 assert.ok(action.includes('git diff --cached --quiet'));
 assert.ok(action.includes('python scripts/sync_rocket_lineups.py'));
 assert.ok(script.includes('verify_page(raw, page)'));
 assert.ok(script.includes('raise ValueError'));
 assert.ok(!script.includes('asset_url'));
});
