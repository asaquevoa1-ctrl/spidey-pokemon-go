'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const byId = id => events.find(event => event.id === id);
const onsite = byId('2026-11-20-laic-2027-sao-paulo');
const drops = byId('2026-11-20-laic-2027-twitch-drops');
const deadline = byId('2026-12-04-laic-2027-timed-research-deadline');

test('LAIC mantém presencial, Drops e conclusão como janelas distintas da mesma história', () => {
  assert.ok(onsite && drops && deadline);
  assert.deepEqual(onsite.related_event_ids, [drops.id, deadline.id]);
  assert.equal(onsite.audit.canonical_story_id, onsite.id);
  assert.equal(drops.audit.canonical_story_id, onsite.id);
  assert.equal(deadline.audit.canonical_story_id, onsite.id);
  assert.deepEqual(onsite.schedule.sessions, [
    {start:'2026-11-20T08:00:00-03:00', end:'2026-11-20T18:00:00-03:00'},
    {start:'2026-11-21T08:00:00-03:00', end:'2026-11-21T18:00:00-03:00'},
    {start:'2026-11-22T08:00:00-03:00', end:'2026-11-22T18:00:00-03:00'}
  ]);
});

test('janela de Drops preserva a conversão oficial Pacífico–Brasília', () => {
  assert.equal(drops.schedule.local_timezone, 'America/Los_Angeles');
  assert.equal(drops.schedule.start_local, '2026-11-20T04:00:00-08:00');
  assert.equal(drops.schedule.end_local, '2026-11-22T15:00:00-08:00');
  assert.equal(drops.schedule.start_brazil, '2026-11-20T09:00:00-03:00');
  assert.equal(drops.schedule.end_brazil, '2026-11-22T20:00:00-03:00');
  assert.match(JSON.stringify(drops.notes), /30 minutos/);
  assert.match(JSON.stringify(drops.notes), /45 minutos/);
});

test('prazo da pesquisa encerra em 4/12 ao meio-dia PST, 17h de Brasília', () => {
  assert.equal(deadline.schedule.end_local, '2026-12-04T12:00:00-08:00');
  assert.equal(deadline.schedule.end_brazil, '2026-12-04T17:00:00-03:00');
  assert.equal(deadline.audit.acquisition_window_reopened, false);
  assert.equal(deadline.audit.individual_tasks_or_encounters_invented, false);
  assert.match(JSON.stringify(deadline.notes), /não publica as tarefas individuais/);
});

test('janelas oficiais não inventam local, GPX, arte Premium nem push', () => {
  for (const event of [drops, deadline]) {
    assert.equal(event.source.confidence, 'official');
    assert.deepEqual(event.locations, []);
    assert.equal(event.gpx.enabled, false);
    assert.equal(event.presentation.requires_art, false);
    assert.equal(event.notifications.enabled, false);
    assert.equal(event.audit.editorial_detail_pending, false);
    assert.equal(event.audit.push_triggered, false);
    assert.equal(event.audit.art_generated, false);
  }
});
