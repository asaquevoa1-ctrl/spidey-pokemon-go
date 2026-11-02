'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const css=read('spidey-app/stamps-premium-20261102.css');
const html=read('spidey-app/index.html');
const sw=read('spidey-app/sw.js');
const app=read('spidey-app/app.js');
const stamp=read('spidey-app/stamps-v2.js');
const catalog=JSON.parse(read('spidey-app/data/stamps.json'));

test('Selos premium entrou no app público e PWA mantém atualização automática',()=>{
  assert.match(html,/stamps-premium-20261102\.css\?v=20261102-stampmuseum1/);
  assert.match(sw,/\.\/stamps-premium-20261102\.css/);
  assert.match(sw,/fly-clean2-autorefresh-stampmuseum1/);
  assert.match(sw,/client\.navigate\(client\.url\)/);
});
test('Cartões de coleção e modo claro/escuro têm acabamento Premium responsivo',()=>{
  for(const selector of ['#stampsView .stamp-list','#stampsView .stamp-card','#stampsView .stamp-card::after',
    '#stampsView .stamp-progress','#stampsView .status-strip','#eventDetail .stamp-dashboard-v2',
    '#eventDetail .stamp-route-panel-v2','#eventDetail .stamp-gallery-v2']){
    assert(css.includes(selector),'Faltando '+selector);
  }
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/html\[data-theme="light"\]/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/prefers-reduced-motion/);
});
test('Artes oficiais das tampas são exibidas completas, sem substituir dados',()=>{
  assert.match(css,/\.stamp-tile-art-v2 img\s*\{[^}]*object-fit:contain\s*!important/s);
  assert.match(css,/\.stamp-rally-cover-v2\s*\{[^}]*object-fit:contain\s*!important/s);
  assert.doesNotMatch(css,/object-fit:\s*cover\s*!important/i);
  assert.match(stamp,/const POKELID_PAGE_SIZE = 36/);
  assert.match(stamp,/function pokelidVenueCoord/);
  assert.match(stamp,/id="stampCoordPrefecture"/);
  assert.match(stamp,/id="copyAllStampCoords"/);
  assert.match(stamp,/id="stampGalleryMoreV2"/);
  assert.match(stamp,/installImageFallback\(detail\)/);
  const pokelids=catalog.rallies.find(item=>item.id==='pokelids-japan-national');
  assert(pokelids&&pokelids.stops.length>400);
});
test('Cartões permanecem clicáveis e o progresso da coleção é preservado',()=>{
  assert.match(app,/card\.addEventListener\('click',\s*\(\)\s*=>\s*openStampRally\(rally\)\)/);
  assert.match(stamp,/saveStampProgress\(rally, progress\)/);
  assert.match(stamp,/gallery\.addEventListener\('click'/);
  assert.match(stamp,/function filteredStops\(\)/);
});
