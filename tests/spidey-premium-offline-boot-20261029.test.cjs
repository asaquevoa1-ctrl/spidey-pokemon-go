const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync('spidey-app/'+p,'utf8');
test('calendário exibe dias imediatamente, mesmo sem rede',()=>{
 const app=read('app.js');
 const boot=app.lastIndexOf('\nrenderCalendar();\nloadContent();');
 assert.ok(boot>0,'a grade do calendário deve nascer antes do fetch');
 assert.match(app,/for \(let i = 0; i < 42; i \+= 1\)/);
 assert.match(app,/calendar\.appendChild\(button\)/);
});
test('Home Premium mostra emblema e navegação mesmo com catálogo vazio',()=>{
 const ui=read('player-ui.js');
 assert.match(ui,/if\(!root\)return;/);
 assert.doesNotMatch(ui,/if\(!root\|\|!state\.events\.length\)return;/);
 assert.match(ui,/spidey-home-awaiting/);
 assert.match(ui,/spideycontentsettled/);
 assert.match(ui,/spidey-cockpit-emblem/);
 assert.match(ui,/spidey-premium-nav-grid/);
 const style=read('spidey-command-cockpit-20261029.css');
 assert.match(style,/body\.spidey-player-ui #spideyHomeQuick \{display:none !important;\}/);
});
test('service worker distribui a correção offline, sem alterar imagens Premium',()=>{
 const html=read('index.html'),sw=read('sw.js');
 assert.match(html,/app\.js\?v=20261029-guides-stable1/);
 assert.match(html,/player-ui\.js\?v=20261030-human-editorial1/);
 assert.match(sw,/20261029-home-stable1/);
 assert.match(sw,/\.\/app\.js/);
 assert.match(sw,/\.\/player-ui\.js/);
});
