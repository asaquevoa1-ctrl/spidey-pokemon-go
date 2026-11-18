'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pendingPaths = [
  'queue/pending/2026-11-16/apk-pokemon-go-d97bd89d32c1.json',
  'queue/pending/2026-11-16/avatar-items-from-the-crocs-pokemon-collection-are-coming-to-pokemon-g-5c34d3abc9cc.json',
  'queue/pending/2026-11-16/g47ix-evento-9b1e26bec9c3.json',
  'queue/pending/2026-11-16/g47ix-noticia-4e7ea84c5755.json',
  'queue/pending/2026-11-16/g47ix-noticia-d5241ad480de.json',
  'queue/pending/2026-11-16/watch-and-earn-rewards-from-the-2027-pokemon-latin-america-internation-f9c295e41fe7.json',
  'queue/pending/2026-11-17/catch-a-new-language-with-pokemon-go-and-duolingo-5111c434e2b4.json',
  'queue/pending/2026-11-17/g47ix-noticia-f0953792b66f.json',
  'queue/pending/2026-11-17/oficial-noticia-74200f56fff9.json',
  'queue/pending/2026-11-17/oficial-noticia-a62b839a3ea3.json',
  'queue/pending/2026-11-17/oficial-noticia-ecb18e3112ba.json'
];

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const weekly = JSON.parse(fs.readFileSync('spidey-app/data/weekly.json', 'utf8'));

test('recent collector backlog is completed and linked to an audit record', () => {
  for (const pendingPath of pendingPaths) {
    const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
    assert.equal(pending.etapa_editorial, 'completed', pendingPath);
    assert.equal(pending.arte_obrigatoria, false, pendingPath);
    assert.ok(pending.curated_path, pendingPath);
    assert.ok(fs.existsSync(pending.curated_path), pending.curated_path);
    assert.equal(path.basename(pending.curated_path), path.basename(pendingPath));

    const curated = JSON.parse(fs.readFileSync(pending.curated_path, 'utf8'));
    assert.equal(curated.art_required_for_publication, false, pending.curated_path);
    assert.equal(curated.gerar_gpx, false, pending.curated_path);
    assert.deepEqual(curated.related_event_ids, pending.related_event_ids);
  }
});

test('official Crocs, LAIC and Duolingo stories remain canonical and unique', () => {
  const ids = [
    'official-news-auto-f9833bb35968',
    '2026-11-20-laic-2027-sao-paulo',
    'official-news-auto-5ea008a69ab9'
  ];

  for (const id of ids) {
    const matches = events.filter((event) => event.id === id);
    assert.equal(matches.length, 1, id);
    assert.equal(matches[0].audit.editorial_detail_pending, false, id);
    assert.equal(matches[0].audit.no_duplicate_story_created, true, id);
    assert.ok(matches[0].audit.collector_source_ids.length >= 2, id);
  }
});

test('unverified shared Crocs codes stay out of the public event record', () => {
  const crocs = events.find((event) => event.id === 'official-news-auto-f9833bb35968');
  const publicRecord = JSON.stringify(crocs);
  assert.equal(crocs.audit.community_shared_gengar_jigglypuff_codes_archived, true);
  assert.ok(publicRecord.includes('POKEMONGOxCROCSxELECTRIFYING'));
  assert.ok(!publicRecord.includes('POKEMONGOxCROCSxMELODY'));
  assert.ok(!publicRecord.includes('POKEMONGOxCROCSxENCHANTING'));
});

test('the 18 November Raid Hour leaves current week surfaces at its 19:00 São Paulo boundary', () => {
  const historical = events.find((event) => event.id === '2026-11-18-raid-hour-cresselia-darkrai');
  assert.ok(historical, 'historical event must remain in the canonical catalog');
  assert.equal(historical.schedule.end_local, '2026-11-18T19:00:00-03:00');
  assert.ok(!JSON.stringify(weekly).includes('2026-11-18-raid-hour-cresselia-darkrai'));
});
