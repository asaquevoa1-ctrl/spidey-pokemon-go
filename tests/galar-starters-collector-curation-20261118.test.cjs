'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const event = events.find((item) => item.id === '2026-11-19-spotlight-galar-starters');
const pending = JSON.parse(fs.readFileSync(
  'queue/pending/2026-11-18/g47ix-evento-1fef23ceb9df.json',
  'utf8'
));
const curated = JSON.parse(fs.readFileSync(
  'queue/curated/g47ix-evento-1fef23ceb9df.json',
  'utf8'
));

test('collector reminder is grouped into the canonical official Spotlight Hour', () => {
  assert.ok(event);
  assert.equal(events.filter((item) => item.id === event.id).length, 1);
  assert.equal(event.source.confidence, 'official');
  assert.deepEqual(event.bonuses, ['2× Doces por captura durante 18h–19h locais.']);
  assert.ok(event.verification_sources.some((source) =>
    source.url === 'https://x.com/g47ix/status/2123072733458375021' &&
    source.confidence === 'community'
  ));
  assert.equal(event.audit.editorial_detail_pending, false);
  assert.equal(event.audit.official_story_remains_canonical, true);
  assert.equal(event.audit.no_duplicate_event_created, true);
});

test('collector queue item is completed without making new art a publication gate', () => {
  assert.equal(pending.etapa_editorial, 'completed');
  assert.equal(pending.arte_obrigatoria, false);
  assert.equal(pending.gerar_gpx, false);
  assert.equal(pending.curated_path, 'queue/curated/g47ix-evento-1fef23ceb9df.json');
  assert.equal(curated.status, 'grouped_into_existing_official_story');
  assert.deepEqual(curated.related_event_ids, ['2026-11-19-spotlight-galar-starters']);
  assert.equal(curated.art_required_for_publication, false);
});
