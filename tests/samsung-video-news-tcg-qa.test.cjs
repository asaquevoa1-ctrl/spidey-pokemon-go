const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root = 'spidey-app/';
const load = path=>fs.readFileSync(root+path,'utf8');
const catalog = JSON.parse(load('data/events.json')).events;
const meltan = catalog.find(e=>e.id==='2026-10-08-dynamax-forms-datamine');
const tcg = catalog.find(e=>e.id==='2026-09-tcg-30th-us-retail');

test('Samsung video: news without a poster must show information, never a full-screen placeholder',()=>{
  assert.ok(meltan);
  assert.equal(meltan.content_type,'news');
  assert.equal(meltan.presentation.requires_art,false);
  const app=load('app.js'),coverage=load('art-coverage-v1.js'),css=load('samsung-video-fixes-20261019.css');
  assert.ok(app.includes("newsOnly ? ''"));
  assert.ok(coverage.includes("if (container?.id === 'eventDetail') {"));
  assert.ok(coverage.includes('removeCover(container);'));
  assert.ok(css.includes('#eventDetail .spidey-art-pending'));
  assert.ok(css.includes('display: none !important'));
  assert.ok(!load('index.html').includes('Arte Premium pendente'));
});
test('TCG approved binary/master remain untouched while noncompliant public display is blocked',()=>{
  assert.ok(tcg);
  assert.equal(tcg.presentation.hide_poster_until_corrected,true);
  assert.ok(tcg.presentation.hide_reason.includes('SpideyNexus'));
  const window={};vm.runInNewContext(load('premium-approved-master.js'),{window});
  const approved=window.SPIDEY_APPROVED_ART_MASTER[tcg.id];
  assert.ok(approved);
  assert.ok(approved.file.includes('tcg-30th-20260927-1020-approved-v1.png'));
  const app=load('app.js'),begin=app.indexOf('function eventArtVisible(event) {'),end=app.indexOf('function verifiedDateVisual',begin);
  assert.ok(begin>=0&&end>begin);
  const isVisible=new Function('window','event',app.slice(begin,end)+'return eventArtVisible(event)') ;
  assert.equal(isVisible(window,tcg),false);
  const aeon=catalog.find(e=>e.id==='2026-aeon-mall-halloween-japan');
  assert.equal(isVisible(window,aeon),false,'Existing date-only visual remains supported');
  const guard=load('samsung-video-fixes-20261019.css');
  assert.ok(guard.includes('img[src*="tcg-30th-20260927-1020-approved-v1.png"]'));
  const player=load('player-ui.js'),premium=load('premium-event-art.js');
  assert.ok(player.includes("e?.id === '2026-09-tcg-30th-us-retail'"));
  assert.ok(premium.includes("event?.id === '2026-09-tcg-30th-us-retail'"));
  assert.ok(load('app-v2-4.js').includes('hide_poster_until_corrected'));
  assert.ok(load('weekly.js').includes('hide_poster_until_corrected'));
  const coverage=load('art-coverage-v1.js');
  assert.ok(coverage.includes("event?.presentation?.hide_poster_until_corrected === true"));
  assert.ok(coverage.includes("container?.querySelector?.('.spidey-verified-date')"));
});
test('Startup is bounded and deploy refreshes PWA assets on Samsung',()=>{
  const splash=load('loading-screen.js'),html=load('index.html'),sw=load('sw.js');
  assert.ok(splash.includes('const MAX_MS = 2800'));
  assert.ok(splash.includes('const MIN_MS = 220'));
  assert.ok(html.includes('4000);</script>'));
  assert.ok(html.includes('samsung-video-fixes-20261019.css?v=20261019-samsung3'));
  assert.ok(html.includes('loading-screen.js?v=20261019-splash3'));
  assert.ok(sw.includes("const CACHE = 'spidey-app-20261019-samsung-video-qa-v3'"));
  assert.ok(sw.includes("'./samsung-video-fixes-20261019.css'"));
});
test('all edited runtime scripts parse without breaking tabs, FLY and stamps',()=>{
  for(const file of ['app.js','player-ui.js','premium-event-art.js','art-coverage-v1.js','loading-screen.js','weekly.js','app-v2-4.js','experience-v1.js']){
    assert.doesNotThrow(()=>new vm.Script(load(file),{filename:file}),file);
  }
  const html=load('index.html');
  for(const feature of ['fly-v1.js','stamps-v2.js','pvp.js','navigation.js'])assert.ok(html.includes(feature));
});
