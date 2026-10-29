const { test }=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..','spidey-app',f),'utf8');

test('Tema Premium global carregado por ultimo, após estilos dinamicos legados',()=>{
  const theme=read('theme.js');
  const before=theme.indexOf("loadStyle('art-coverage-v1.css'");
  const after=theme.indexOf("loadStyle('spidey-premium-unified-20261029.css'");
  assert.ok(before>0&&after>before);
  const html=read('index.html');
  assert.match(html,/player-ui\.js\?v=20261029-premium-real1/);
  assert.match(html,/theme\.js\?v=20261029-premium-real1/);
  assert.match(html,/SPIDEY_BUILD='2026-10-29-premium-real1'/);
  const sw=read('sw.js');
  assert.match(sw,/\.\/spidey-premium-unified-20261029\.css/);
  assert.match(sw,/20261029-premium-global-real1/);
});
test('Home alterada é a realmente visível, não experience-* oculto',()=>{
  const ui=read('player-ui.js');
  const old=read('player-ui.css');
  assert.match(old,/#calendarView>\.experience-section/);
  assert.match(ui,/document\.getElementById\('playerHome'\)/);
  assert.match(ui,/spidey-premium-kpis/);
  assert.match(ui,/spidey-premium-feature-stage/);
  assert.match(ui,/spidey-premium-nav-grid/);
  for(const view of ['newsView','weeklyView','flyView','stampsView','pvpView','rocketGuideView'])
    assert.ok(ui.includes('data-premium-view="'+view+'"'),view);
  assert.match(ui,/button\?\.click\(\)/);
  assert.match(ui,/active\.length/);
  assert.match(ui,/upcoming\.length/);
});
test('Poster aprovada, marca, menu lateral, e temas continuam independentes',()=>{
  const ui=read('player-ui.js'),html=read('index.html'),css=read('spidey-premium-unified-20261029.css');
  assert.match(ui,/window\.SpideyPlayer\.image\(e,fly\)/);
  assert.match(ui,/SPIDEY_APPROVED_ART_MASTER/);
  assert.match(html,/spidey-icon-cosmic-192\.png/);
  assert.match(html,/id="spideyMobileMenuPanel"/);
  assert.match(css,/:root\[data-theme="dark"\]/);
  assert.match(css,/:root\[data-theme="light"\]/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css,/pointer:fine/);
  assert.doesNotMatch(css,/\.player-poster\s*\{[^}]*filter\s*:/);
  assert.doesNotMatch(css,/\.app-tabs\s*\{[^}]*display\s*:/);
  assert.doesNotMatch(ui,/hunterView|data-premium-view="mapView"/);
});
