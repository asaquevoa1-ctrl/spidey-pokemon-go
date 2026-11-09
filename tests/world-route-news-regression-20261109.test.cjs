'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const events = JSON.parse(fs.readFileSync(path.join(__dirname, '../spidey-app/data/events.json'), 'utf8')).events;

test('Teddiursa mantém a rota mundial por horário local e sem coordenadas inventadas', () => {
  const e = events.find(item => item.id === '2026-11-05-spotlight-teddiursa');
  assert.ok(e, 'Teddiursa ausente');
  assert.equal(e.status, 'published');
  assert.equal(e.fly_world_route?.enabled, true);
  assert.equal(e.fly_world_route?.scope, 'worldwide_local_time');
  assert.equal(e.fly_world_route?.coordinates, 'city_references');
  assert.equal(e.fly_world_route?.timezone_conversion, 'America/Sao_Paulo');
  assert.match(e.schedule.start_local, /T18:00:00/);
  assert.match(e.schedule.end_local, /T19:00:00/);
  assert.equal(e.gpx?.enabled, false);
});
test('Novidades não repetem títulos entre registros independentes', () => {
  const seen = new Map();
  for (const e of events.filter(item => item.status === 'published' && item.news?.title)) {
    const title = e.news.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    // Minior é uma série legítima de três eventos mensais distintos.
    if (title === 'minior chega com as chuvas de meteoros') continue;
    assert.ok(!seen.has(title), 'Notícia duplicada: ' + title + ' (' + seen.get(title) + ', ' + e.id + ')');
    seen.set(title, e.id);
  }
});
