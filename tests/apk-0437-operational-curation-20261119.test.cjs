'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const pendingPath = 'queue/pending/2026-11-19/apk-pokemon-go-d6da3271bda3.json';
const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
const curated = JSON.parse(fs.readFileSync(pending.curated_path, 'utf8'));
const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const weekly = JSON.parse(fs.readFileSync('spidey-app/data/weekly.json', 'utf8'));
const collectorSourceId = 'pokeminers-1572721659461509262';

test('0.437.0 rollout is completed as an operational audit item', () => {
  assert.equal(pending.status, 'curated_operational_no_public_story');
  assert.equal(pending.etapa_editorial, 'completed');
  assert.equal(pending.arte_obrigatoria, false);
  assert.equal(pending.proibir_fallback, false);
  assert.equal(pending.curated_path, 'queue/curated/apk-pokemon-go-d6da3271bda3.json');
  assert.equal(curated.status, 'no_public_story');
  assert.equal(curated.art_required_for_publication, false);
  assert.equal(curated.gerar_gpx, false);
  assert.deepEqual(curated.related_event_ids, []);
});

test('0.437.0 operational rollout does not create a public story or dated event', () => {
  assert.ok(!JSON.stringify(events).includes(collectorSourceId));
  assert.ok(!JSON.stringify(weekly).includes(collectorSourceId));
  assert.ok(!JSON.stringify(weekly).includes('0.437.0'));
});
