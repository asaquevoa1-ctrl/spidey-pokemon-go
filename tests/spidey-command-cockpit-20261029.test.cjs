const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..','spidey-app',f),'utf8');

test('Cockpit combina galeria 3D, atalhos e métricas sem recriar eventos',()=>{
 const ui=read('player-ui.js');
 assert.match(ui,/SpideyUniverse3D\?\.mount\(root, state\.events, focus, now, art, title, time, getBrazilRange\)/);
 assert.match(ui,/spidey-command-cockpit/);
 assert.match(ui,/cockpit\.append\(universe,aside\)/);
 assert.match(ui,/aside\.append\(shortcuts,metrics\)/);
 assert.match(ui,/data-premium-view='weeklyView'|week\.dataset\.premiumView='weeklyView'/);
 assert.match(ui,/head\.querySelector\('\.spidey-cockpit-explore'\)\?\.remove\(\)/);
 assert.doesNotMatch(ui,/hunterView|data-premium-view="mapView"/);
});
test('Cabeçalho usa S cósmico ORIGINAL e não altera a arte aprovada',()=>{
 const ui=read('player-ui.js');
 const css=read('spidey-command-cockpit-20261029.css');
 assert.match(ui,/assets\/branding\/20261019\/spidey-icon-cosmic-192\.png/);
 assert.match(ui,/emblem\.alt=''/);
 assert.match(css,/\.spidey-cockpit-emblem/);
 assert.match(css,/object-fit:contain/);
 assert.doesNotMatch(css,/\.player-poster\s*\{/);
 assert.doesNotMatch(css,/\.spidey-universe-card-media img/);
 assert.doesNotMatch(css,/filter:blur\(/);
});
test('CSS cobre desktop e Android com suporte a movimento reduzido e foco',()=>{
 const css=read('spidey-command-cockpit-20261029.css');
 assert.match(css,/grid-template-columns:minmax\(0,1\.68fr\)/);
 assert.match(css,/@media \(max-width:980px\)/);
 assert.match(css,/@media \(max-width:600px\)/);
 assert.match(css,/@media \(max-width:365px\)/);
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 assert.match(css,/:focus-visible/);
 assert.doesNotMatch(css,/\.app-tabs\s*\{[^}]*display:/);
});
test('Cockpit está no último CSS e é incluido no cache PWA',()=>{
 const theme=read('theme.js');
 const html=read('index.html');
 const sw=read('sw.js');
 assert.ok(theme.indexOf("loadStyle('spidey-command-cockpit-20261029.css'")>
  theme.indexOf("loadStyle('spidey-universe-3d.css'"));
 assert.match(html,/player-ui\.js\?v=20261029-visiblehome1/);
 assert.match(html,/theme\.js\?v=20261029-motion1/);
 assert.match(html,/SPIDEY_BUILD='2026-10-29-motion1'/);
 assert.match(sw,/\.\/spidey-command-cockpit-20261029\.css/);
 assert.match(sw,/20261029-motion1/);
});
