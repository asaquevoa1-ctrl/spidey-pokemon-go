'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const trails = events.find((item) => item.id === '2026-11-16-dynamax-trails');
const spotlight = events.find((item) => item.id === '2026-11-19-spotlight-galar-starters');

test('Trilhas Dinamax separa o bônus oficial da quantidade comunitária observada', () => {
  assert.ok(trails);
  assert.equal(trails.source.confidence, 'official');
  assert.match(trails.bonuses[0], /Chance de Partículas Max/);
  assert.match(trails.bonuses.join(' '), /Observação comunitária/);
  assert.match(trails.bonuses.join(' '), /10 Partículas Max/);
  assert.match(trails.bonuses.join(' '), /limite diário normal de 800/);
  assert.ok(trails.verification_sources.some((source) =>
    source.url === 'https://leekduck.com/events/dynamax-trails-2026/' &&
    source.confidence === 'verified_community' &&
    source.claims.includes('wild_catch_max_particles_10')
  ));
  assert.equal(trails.audit.official_bonus_preserved_as_chance, true);
  assert.equal(trails.audit.community_live_detail_labeled, true);
});

test('o detalhe comunitário permanece na história principal, sem duplicar o Holofote', () => {
  assert.equal(events.filter((item) => item.id === trails.id).length, 1);
  assert.equal(events.filter((item) => item.id === spotlight.id).length, 1);
  assert.doesNotMatch(spotlight.bonuses.join(' '), /Partículas Max/);
  assert.equal(trails.audit.no_spotlight_duplicate_created, true);
  assert.equal(trails.audit.editorial_detail_pending, false);
});
