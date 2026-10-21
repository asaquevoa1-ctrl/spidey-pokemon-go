'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const vm = require('node:vm');
const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const find = id => events.find(e => e.id === id);
test('Morelull happens on Thursday 22/10, not Saturday 24/10', () => {
  const e = find('2026-10-22-spotlight-morelull');
  assert.equal(e.schedule.start_local, '2026-10-22T18:00:00-03:00');
  assert.equal(e.schedule.end_local, '2026-10-22T19:00:00-03:00');
  assert.ok(e.bonuses.join(' ').includes('2× Poeira Estelar'));
  assert.ok(e.notes.join(' ').includes('não acontece no sábado'));
});
test('24 October guide separates globally accessible steps, regional-only activities and Twitch UTC conversion', () => {
  const e = find('2026-10-24-spidey-full-day-guide');
  assert.ok(e);
  assert.equal(e.schedule.start_local.slice(0,10),'2026-10-24');
  assert.equal(e.presentation.requires_art,true);
  assert.equal(e.presentation.fallback_visual,'none');
  assert.equal(e.notifications.enabled,false);
  const prose=e.notes.join(' ');
  for(const token of ['02h às 05h','05h30–12h','14h–17h','17h–21h','23h30','City Safari Boston','FC Seoul','Los Angeles','Reide Remota']) {
    assert.ok(prose.includes(token),'Missing '+token);
  }
  assert.ok(prose.includes('Sem problema:') || prose.includes('Sem problema'));
  assert.ok(e.verification_sources.length >= 6);
  assert.equal(e.source.url,'https://pokemongo.com/news/dynamax-uxie-mesprit-azelf-max-battle-day-2026');
  assert.ok(!e.source.url.includes('github.com'), 'O botão Ver fonte deve abrir Pokémon GO, não o repositório');
  for (const v of e.verification_sources) assert.ok(v.url.startsWith('https://'), 'Cada referência precisa ser link seguro');

  assert.ok(e.notes.every(n => !/Morelull/i.test(n)));
  const approvedPath='spidey-app/assets/events/premium/spidey-2026-10-24-full-day-flow-approved-v1.webp';
  const sha='406f5d5b101beaac002adbd15dcb4cfb61fd19a8c9726b19e5c0e7163ade2b97';
  assert.equal(e.art.url,approvedPath.replace('spidey-app/',''));
  assert.equal(e.art.web_sha256,sha);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(approvedPath)).digest('hex'),sha);
  const window={};
  vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  const approved=window.SPIDEY_APPROVED_ART_MASTER[e.id];
  assert.equal(approved.file,e.art.url);
  assert.equal(approved.sha256,sha);
  assert.equal(approved.status,'APPROVED');
  const sw=fs.readFileSync('spidey-app/sw.js','utf8');
  assert.ok(sw.includes('./'+e.art.url),'Offline cache must contain the approved flow image');
  assert.match(sw,/const CACHE = 'spidey-app-2026[0-9]{4}-[^']+'/,'Service worker must version Android updates');
  assert.ok(fs.readFileSync('spidey-app/index.html','utf8').includes('premium-approved-master.js?v=20261021-day24-premium-flow1'));

  const qa=JSON.parse(fs.readFileSync('docs/qa/DAY24_FLOW_ART_APPROVAL_20261021.json','utf8'));
  assert.equal(qa.sha256,sha);
  assert.ok(qa.original_logo.file.includes('spidey-icon-cosmic-512.png'));
  assert.equal(events.filter(x=>x.id===e.id).length,1);
});
