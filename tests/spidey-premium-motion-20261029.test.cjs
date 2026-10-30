const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..','spidey-app',p),'utf8');
test('Spidey Motion integra o splash já aprovado, sem atrasar readiness nem criar telas artificiais',()=>{
  const html=read('index.html'), loader=read('loading-screen.js'), css=read('spidey-motion.css');
  assert.ok(html.indexOf('spidey-motion.css?v=20261029-motion1')>html.indexOf('loading-screen.css?v='));
  assert.match(html,/spidey-motion\.js\?v=20261029-motion1/);
  assert.match(html,/Seu universo está sendo preparado/);
  assert.match(loader,/spideylaunchcomplete/);
  assert.match(loader,/MAX_MS = 1400/);
  assert.match(html,/2100\);<\/script>/);
  assert.match(css,/spidey-launch-orbit/);
  assert.match(css,/assets\/branding|\.spidey-splash-logo/);
  assert.doesNotMatch(css,/object-fit:\s*cover/);
  assert.doesNotMatch(css,/\.player-poster\s*\{/);
});
test('mudança de tela é disparada APENAS quando a navegação real muda',()=>{
 const app=read('app.js'),motion=read('spidey-motion.js'),css=read('spidey-motion.css');
 assert.match(app,/previousView!==viewId/);
 assert.match(app,/new CustomEvent\('spideyviewchange'/);
 assert.match(motion,/to === lastView/);
 assert.match(motion,/!view \|\| view\.hidden \|\| !motionOK\(\)/);
 assert.match(css,/\.app-view\.spidey-scene-enter:not\(\[hidden\]\)/);
 assert.match(css,/330ms/);
});
test('revelação de tema respeita preferências e tem fallback sem API',()=>{
 const theme=read('theme.js'),motion=read('spidey-motion.js'),css=read('spidey-motion.css');
 assert.match(theme,/SpideyMotion\.revealTheme\(change,select\)/);
 assert.match(motion,/document\.startViewTransition/);
 assert.match(motion,/prefers-reduced-motion: reduce/);
 assert.match(motion,/saveData/);
 assert.match(css,/::view-transition-new\(root\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotThrow(()=>new vm.Script(motion));
});
test('menu magnético reutiliza drawer existente e não inclui barra inferior',()=>{
 const css=read('spidey-motion.css');
 assert.match(css,/\.spidey-menu-item\.active \.spidey-menu-item-icon/);
 assert.match(css,/\.spidey-menu-item\[aria-current="page"\]/);
 assert.doesNotMatch(css,/\.app-tabs\s*\{/);
 assert.doesNotMatch(css,/\.app-tab\s*\{/);
});
test('cache offline inclui CSS/JS Motion e nova versão',()=>{
 const html=read('index.html'),sw=read('sw.js');
 assert.match(html,/SPIDEY_BUILD='2026-10-29-motion1'/);
 assert.match(html,/theme\.js\?v=20261029-motion1/);
 assert.match(html,/app\.js\?v=20261029-motion1/);
 assert.match(html,/loading-screen\.js\?v=20261029-motion1/);
 assert.match(sw,/\.\/spidey-motion\.js/);
 assert.match(sw,/\.\/spidey-motion\.css/);
 assert.match(sw,/20261029-motion1/);
});
