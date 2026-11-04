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
  assert.match(html,/stamps-premium-20261102\.css\?v=20261102-stampmuseum1(?:-[\w-]+)?/);
  assert.match(sw,/\.\/stamps-premium-20261102\.css/);
  assert.match(sw,/const CACHE = 'spidey-app-[0-9]{8}-[^']+'/);
  assert.match(sw,/client\.navigate\(client\.url\)/);
});
test('Cartões de coleção e modo claro/escuro têm acabamento Premium responsivo',()=>{
  for(const selector of ['#stampsView .stamp-list','#stampsView .stamp-card','#stampsView .stamp-card::after',
    '#stampsView .stamp-meta','#stampsView .status-strip','#eventDetail .stamp-location-summary-v2',
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
test('Cartões continuam clicáveis, sem marcação de feitos',()=>{
  assert.match(app,/card\.addEventListener\('click',\s*\(\)\s*=>\s*openStampRally\(rally\)\)/);
  assert.match(app,/card\.setAttribute\('role','button'\)/);
  assert.match(app,/e\.key === ' '/);
  assert.match(app,/ev\.key===' '/);
  assert.doesNotMatch(stamp,/stampToggleDone|stampV2Progress|saveStampProgress|data-stamp-filter="done"|data-stamp-filter="remaining"|Marcar como feito|Marcar como faltante/);
  assert.doesNotMatch(app,/stamp-toggle|getStampProgress|saveStampProgress|rallyProgressText|stamp-progress/);
  assert.doesNotMatch(css,/stamp-dashboard-v2|stamp-progress|\.is-done/);
  assert.match(stamp,/stamp-location-summary-v2/);
  assert.match(stamp,/Galeria de PokéLids/);
  assert.match(stamp,/id="stampPrev"/);
  assert.match(stamp,/id="stampNext"/);
  assert.match(stamp,/gallery\.addEventListener\('click'/);
  assert.match(stamp,/function filteredStops\(\)/);
});
