const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const pendingPath = 'queue/pending/2026-11-19/apk-pokemon-go-6c5bd69b9631.json';
const relatedPath = 'queue/pending/2026-11-19/apk-pokemon-go-d6da3271bda3.json';
const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
const curated = JSON.parse(fs.readFileSync(pending.curated_path, 'utf8'));
const related = JSON.parse(fs.readFileSync(relatedPath, 'utf8'));
const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const weekly = JSON.parse(fs.readFileSync('spidey-app/data/weekly.json', 'utf8'));

test('APK rollout follow-up is completed as operational audit only', () => {
  assert.equal(pending._source_id, 'pokeminers-1573035719230881804');
  assert.equal(pending.status, 'curated_operational_no_public_story');
  assert.equal(pending.etapa_editorial, 'completed');
  assert.equal(pending.arte_obrigatoria, false);
  assert.deepEqual(pending.related_queue_files, [relatedPath]);
  assert.equal(curated.status, 'no_public_story');
  assert.equal(curated.art_required_for_publication, false);
  assert.equal(curated.verification_sources[0].verified_update_date, '2026-11-18');
});

test('operational follow-up does not duplicate public calendar or weekly surfaces', () => {
  assert.equal(related.status, 'curated_operational_no_public_story');
  assert.ok(!events.some((event) => JSON.stringify(event).includes(pending._source_id)));
  assert.ok(!JSON.stringify(weekly).includes(pending._source_id));
  assert.ok(!JSON.stringify(weekly).includes('0.437.0'));
});
