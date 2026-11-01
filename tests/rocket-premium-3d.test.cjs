'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
test('Rocket Premium 3D: script válido e incluído no aplicativo',()=>{
 const script=read('spidey-app/rocket-premium-3d.js');
 assert.doesNotThrow(()=>new vm.Script(script));
 const html=read('spidey-app/index.html');
 assert.match(html,/rocket-premium-3d\\.css\\?v=/);
 assert.match(html,/rocket-premium-3d\\.js\\?v=/);
 assert.match(read('spidey-app/rocket-guide.js'),/SpideyRocketPremium3D\\?\\.mount\\(json\\)/);
});
test('Rocket Premium 3D: respeita a linha de dados factual da comunidade',()=>{
 const script=read('spidey-app/rocket-premium-3d.js');
 assert.match(script,/ORDER = \\['giovanni','cliff','arlo','sierra'\\]/);
 assert.match(script,/data\\.members\\.find/);
 assert.match(script,/member\\.slots\\.forEach/);
 assert.match(script,/source_updated_on/);
 const data=JSON.parse(read('spidey-app/data/rocket-lineups.json'));
 const names=id=>data.members.find(m=>m.id===id).slots.map(s=>s.pokemon.map(p=>p.name));
 assert.deepEqual(names('cliff')[0],['Cubone']);
 assert.deepEqual(names('arlo')[0],['Alolan Grimer']);
 assert.deepEqual(names('sierra')[0],['Pancham']);
 assert.deepEqual(names('giovanni')[2],['Zekrom']);
});
test('Rocket Premium 3D: mantém interação e acessibilidade sem WebGL obrigatório',()=>{
 const script=read('spidey-app/rocket-premium-3d.js');
 assert.match(script,/pointerup/);
 assert.match(script,/ArrowRight/);
 assert.match(script,/Ver escalação completa/);
 assert.match(script,/aria-live/);
 assert.match(script,/prefers-reduced-motion/);
 assert.match(script,/spidey-icon-cosmic-192\\.png/);
 assert.doesNotMatch(script,/canvas\\.getContext|three\\.js/);
});
