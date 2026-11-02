'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const css=read('spidey-app/pvp-premium-20261102.css');
const html=read('spidey-app/index.html');
const sw=read('spidey-app/sw.js');
const js=read('spidey-app/pvp.js');
const pvp=JSON.parse(read('spidey-app/data/pvp.json'));

test('Painel tático Premium está integrado no HTML e PWA',()=>{
 assert.match(html,/pvp-premium-20261102\.css\?v=20261102-pvpcockpit1/);
 assert.match(sw,/\.\/pvp-premium-20261102\.css/);
 assert.match(sw,/pvpcockpit1/);
});
test('Visual das ligas, ranking e trio responde a toque, foco e telas pequenas',()=>{
 for(const name of ['#pvpView .pvp-leagues','#pvpView .pvp-rankings','#pvpView .pvp-rank',
  '#pvpView .pvp-card-copy','#pvpView .pvp-score','#pvpView .pvp-team-slots',
  '#pvpView .pvp-tools','#eventDetail .pvp-detail-moves']){
   assert(css.includes(name),'Falta '+name);
 }
 assert(css.includes(':focus-visible'));
 assert(css.includes('@media(max-width:600px)'));
 assert(css.includes('@media(max-width:360px)'));
 assert(css.includes('prefers-reduced-motion'));
 assert(css.includes('html[data-theme="light"]'));
});
test('Aparência nova não remove rankings nem controles do PvP',()=>{
 assert.match(js,/const teamKey = 'spidey-pvp-team'/);
 assert.match(js,/const team = \(\) =>/);
 assert.match(js,/data-pvp-team/);
 assert.match(js,/data-pvp-open/);
 assert.match(js,/data-pvp-league/);
 assert.match(js,/pvpMore/);
 assert.match(js,/pvpType/);
 assert.match(js,/persist\(\)/);
 assert.match(html,/id="pvpSearch"/);
 assert.match(html,/id="pvpRankings"/);
 assert.match(html,/id="pvpTeam"/);
 assert.match(html,/pvpoke.com/);
 assert.deepEqual(pvp.leagues.map(l=>l.id).sort(),['great','master','ultra']);
});
