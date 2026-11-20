'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const original = events.find(event => event.id === '2026-09-tcg-30th-us-retail');
const deadline = events.find(event => event.id === '2026-11-20-tcg-30th-timed-research-deadline');

test('TCG 30 anos mantém aquisição encerrada e publica o prazo oficial separado', () => {
  assert.ok(original);
  assert.ok(deadline);
  assert.equal(original.schedule.end_local, '2026-10-20T22:00:00-04:00');
  assert.deepEqual(original.related_event_ids, [deadline.id]);
  assert.equal(deadline.related_news_id, original.id);
  assert.equal(deadline.source.confidence, 'official');
  assert.equal(deadline.source.url, original.source.url);
  assert.equal(deadline.audit.acquisition_window_reopened, false);
  assert.equal(deadline.audit.editorial_detail_pending, false);
});

test('prazo termina às 22h locais e conserva a última janela dos EUA', () => {
  assert.equal(deadline.schedule.local_timezone, 'Pacific/Honolulu');
  assert.equal(deadline.schedule.end_local, '2026-11-20T22:00:00-10:00');
  assert.equal(deadline.schedule.end_brazil, '2026-11-21T05:00:00-03:00');
  assert.equal(Date.parse(deadline.schedule.end_local), Date.parse(deadline.schedule.end_brazil));
  assert.match(deadline.summary, /20\/11 às 22h no horário local/);
  assert.ok(deadline.notes.some(note => /não foi reaberto/.test(note)));
});

test('prazo não inventa tarefas, encontros, coordenadas, GPX, push ou arte Premium', () => {
  assert.equal(deadline.audit.individual_tasks_or_encounters_invented, false);
  assert.equal(deadline.gpx.enabled, false);
  assert.deepEqual(deadline.locations, []);
  assert.equal(deadline.notifications.enabled, false);
  assert.equal(deadline.presentation.requires_art, false);
  assert.equal(deadline.presentation.fallback_visual, 'date');
  assert.equal(deadline.presentation.no_unverified_poster, true);
  assert.equal(deadline.pokemon, undefined);
  assert.equal(deadline.bonuses, undefined);
});
