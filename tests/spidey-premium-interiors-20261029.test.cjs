const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../spidey-app',p),'utf8');
const css=read('spidey-premium-interiors-20261029.css');

test('seis telas reais compartilham a abertura cinematográfica',()=>{
 for(const id of ['newsView','weeklyView','flyView','pvpView','rocketGuideView','stampsView'])
  assert.ok(css.includes('#'+id),'Sem tela '+id);
 assert.match(css,/> \.hero\.hero-compact/);
 assert.match(css,/spidey-icon-cosmic-192\.png/);
 assert.match(css,/background-size:clamp/);
 assert.match(css,/:focus-visible/);
});
test('cards e controles internos permanecem acessíveis e funcionais',()=>{
 for(const selector of ['.cc-news-card','.weekly-item','.fly-point','.pvp-card','.rocket-card','.stamp-card'])
  assert.ok(css.includes(selector),'Sem acabamento '+selector);
 assert.match(css,/\.pvp-leagues button\.active/);
 assert.match(css,/\.rocket-card\[open\]/);
 assert.match(css,/\.stamp-dashboard-v2/);
 assert.match(css,/\.fly-route-list/);
});
test('sem alteração ou recorte de arquivos Premium, marca S e navegação continuam',()=>{
 assert.doesNotMatch(css,/\.detail-hero\s*\{/);
 assert.doesNotMatch(css,/\.player-poster\s*\{/);
 assert.doesNotMatch(css,/\.stamp-rally-cover-v2\s*\{/);
 assert.doesNotMatch(css,/filter:\s*(blur|grayscale|hue-rotate)/);
 assert.doesNotMatch(css,/\.app-tab\s*\{[^}]*display\s*:/);
 assert.doesNotMatch(css,/spidey-logo-oficial\.jpg|spideynexus/i);
});
test('tema e cache PWA carregam última folha; Samsung responsivo',()=>{
 const theme=read('theme.js'),html=read('index.html'),sw=read('sw.js');
 const posTheme=theme.indexOf("loadStyle('spidey-premium-interiors-20261029.css'");
 const posPrevious=theme.indexOf("loadStyle('spidey-command-cockpit-20261029.css'");
 assert.ok(posTheme>posPrevious&&posPrevious>0);
 assert.match(html,/theme\.js\?v=20261029-motion1/);
 assert.match(html,/SPIDEY_BUILD='2026-10-29-motion1'/);
 assert.match(sw,/\.\/spidey-premium-interiors-20261029\.css/);
 assert.match(sw,/20261029-motion1/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:370px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
