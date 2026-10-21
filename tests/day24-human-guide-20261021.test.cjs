'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
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
  assert.equal(e.presentation.requires_art,false);
  assert.equal(e.presentation.fallback_visual,'date');
  assert.equal(e.notifications.enabled,false);
  const prose=e.notes.join(' ');
  for(const token of ['02h às 05h','05h30–12h','14h–17h','17h–21h','23h30','City Safari Boston','FC Seoul','Los Angeles','Reide Remota','Morelull']) {
    assert.ok(prose.includes(token),'Missing '+token);
  }
  assert.ok(prose.includes('Sem problema:') || prose.includes('Sem problema'));
  assert.ok(e.verification_sources.length >= 6);
  assert.equal(events.filter(x=>x.id===e.id).length,1);
});
