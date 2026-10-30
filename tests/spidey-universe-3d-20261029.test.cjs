const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..','spidey-app',f),'utf8');

test('Galáxia 3D real é montada na Home visível e com dados oficiais',()=>{
  const ui=read('player-ui.js'),galaxy=read('spidey-universe-3d.js');
  assert.match(ui,/SpideyUniverse3D\?\.mount\(root, state\.events, focus, now, art, title, time, getBrazilRange\)/);
  assert.match(ui,/spideyDispose\?\.\(\)/);
  assert.match(galaxy,/SPIDEY_APPROVED_ART_MASTER/);
  assert.match(galaxy,/Data encerrada/);
  assert.match(galaxy,/getContext\('webgl'/);
  assert.match(galaxy,/requestAnimationFrame/);
  assert.match(galaxy,/IntersectionObserver/);
  assert.match(galaxy,/prefers-reduced-motion: reduce/);
  assert.match(galaxy,/navigator\.connection\?\.saveData/);
  assert.match(galaxy,/data-spidey-universe-index/);
});
test('Markup e CSS tridimensional preservam artes, acessibilidade e mobile',()=>{
  const script=read('spidey-universe-3d.js'),css=read('spidey-universe-3d.css');
  assert.doesNotThrow(()=>new vm.Script(script));
  assert.match(script,/aria-label/);
  assert.match(script,/aria-live/);
  assert.match(script,/ArrowRight/);
  assert.match(script,/pointerup/);
  assert.match(css,/perspective:900px/);
  assert.match(css,/rotateY\(42deg\)/);
  assert.match(css,/translate3d\(/);
  assert.match(css,/object-fit:contain/);
  assert.match(css,/filter:none !important/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css,/\.app-tabs\s*\{[^}]*display:/);
});
test('Nova versão carrega galeria antes da Home, cache offline incluído',()=>{
  const index=read('index.html'),theme=read('theme.js'),sw=read('sw.js');
  assert.ok(index.indexOf('spidey-universe-3d.js?v=20261029-focus2')<index.indexOf('player-ui.js?v=20261029-visiblehome1'));
  assert.ok(theme.indexOf("loadStyle('spidey-universe-3d.css'")>theme.indexOf("loadStyle('spidey-premium-unified-20261029.css'"));
  assert.match(sw,/\.\/spidey-universe-3d\.css/);
  assert.match(sw,/\.\/spidey-universe-3d\.js/);
  assert.match(sw,/20261029-motion1/);
  assert.match(index,/spidey-icon-cosmic-192\.png/);
});


test('Vídeo Samsung: Universe antes dos indicadores e sem pôster duplicado obrigatório',()=>{
  const js=read('spidey-universe-3d.js');
  const css=read('spidey-universe-3d.css');
  assert.match(js,/intro\.insertAdjacentElement\('afterend', section\)/);
  assert.match(js,/spidey-universe-highlight-details/);
  assert.match(js,/disclosure\.append\(discloseTitle, stage\)/);
  assert.match(js,/disclosure\.open = expandedHighlight/);
  assert.match(css,/spidey-universe-highlight-details/);
  assert.match(css,/height:clamp\(356px,103vw,440px\)/);
  assert.match(css,/object-fit:contain/);
});
