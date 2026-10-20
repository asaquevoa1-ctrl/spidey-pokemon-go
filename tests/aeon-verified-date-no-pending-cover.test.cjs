const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const root='spidey-app/';
const catalog=JSON.parse(fs.readFileSync(root+'data/events.json','utf8')).events;
const aeon=catalog.find(e=>e.id==='2026-aeon-mall-halloween-japan');

function isolateHelper(js) {
  const start=js.indexOf('  function hasVerifiedDateVisual(container, event) {');
  const end=js.indexOf('  function decorateContainer(container) {',start);
  assert.ok(start>=0 && end>start,'Coverage guard must exist before decorating any event');
  const snippet=js.slice(start,end);
  return new Function(snippet+'; return hasVerifiedDateVisual;')();
}

test('AEON shows one informative date tile instead of an empty poster',()=>{
 assert.ok(aeon,'Official AEON event remains published');
 assert.equal(aeon.status,'published');
 assert.equal(aeon.presentation.no_unverified_poster,true);
 assert.equal(aeon.presentation.fallback_visual,'date');
 const app=fs.readFileSync(root+'app.js','utf8');
 const coverage=fs.readFileSync(root+'art-coverage-v1.js','utf8');
 assert.match(app,/function verifiedDateVisual/);
 assert.match(app,/eventArtVisible\(event\) \? .*detail-hero/);
 const guard=isolateHelper(coverage);
 const withDate={querySelector(selector){return selector==='.spidey-verified-date'?{}:null;}};
 const noDate={querySelector(){return null;}};
 assert.equal(guard(withDate,aeon),true);
 assert.equal(guard(noDate,aeon),false);
 assert.equal(guard(withDate,{presentation:{no_unverified_poster:false}}),false);
 const branch=coverage.slice(coverage.indexOf('    if (hasVerifiedDateVisual(container, event)) {'));
 assert.match(branch.slice(0,230),/removeCover\(container\);/);
 assert.match(branch.slice(0,230),/removeNoArtState\(container\);/);
 assert.match(branch.slice(0,230),/return;/);
});
test('Samsung CSS and PWA do not show an old 4:5 pending poster below the date',()=>{
 const css=fs.readFileSync(root+'opening-20261019.css','utf8');
 const head=fs.readFileSync(root+'index.html','utf8');
 const sw=fs.readFileSync(root+'sw.js','utf8');
 assert.ok(css.includes('#eventDetail:has(> .spidey-verified-date) > .spidey-cover-art.spidey-art-pending'));
 assert.ok(css.includes('display: none !important;'));
 assert.ok(css.includes('max-height: 150px;'));
 assert.ok(head.includes('opening-20261019.css?v=20261019-aeon-mobile2'));
 assert.ok(head.includes("SPIDEY_BUILD='2026-10-20-samsung-physical-fast-v1'"));
 assert.ok(sw.includes("const CACHE = 'spidey-app-20261020-android-cosmic-icon-v4'"));
 assert.ok(sw.includes("'./opening-20261019.css'"));
 assert.ok(sw.includes("'./art-coverage-v1.js'"));
 assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(root+'art-coverage-v1.js','utf8')));
});
test('other artworks remain protected while date-only previews avoid duplicate pending cover',()=>{
 const guard=isolateHelper(fs.readFileSync(root+'art-coverage-v1.js','utf8'));
 const node={querySelector:x=>x==='.spidey-verified-date'?{}:null};
 for(const event of catalog.filter(e=>e.presentation?.no_unverified_poster===true).slice(0,40)){
   assert.equal(guard(node,event),true,event.id);
 }
 const premium=catalog.find(e=>e.id==='2026-10-mega-sableye-raids');
 assert.equal(guard(node,premium),false,'Previously approved Premium poster is unaffected');
});
