'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const byId = (id) => events.find((event) => event.id === id);
const pending = (name) => JSON.parse(fs.readFileSync(`queue/pending/2026-11-12/${name}.json`, 'utf8'));
const curated = (name) => JSON.parse(fs.readFileSync(`queue/curated/${name}.json`, 'utf8'));

test('Latias and Latios reminder enriches the existing official window without duplication', () => {
  const event = byId('2026-11-13-max-hour-latias-latios');
  assert.ok(event);
  assert.equal(events.filter((item) => item.id === event.id).length, 1);
  assert.match(event.summary, /Brilhantes/);
  assert.match(event.summary, /Fundo Especial/);
  assert.match(event.notes.join(' '), /Bola de Névoa/);
  assert.match(event.notes.join(' '), /Purga de Esplendor/);
  assert.equal(event.verification_sources[0].confidence, 'community');
  assert.equal(event.audit.official_story_remains_canonical, true);
});

test('Kyurem White and Zekrom reminders stay grouped into the Global story', () => {
  const event = byId('2026-11-go-wild-area-global');
  assert.ok(event);
  assert.equal(events.filter((item) => item.id === event.id).length, 1);
  for (const url of [
    'https://x.com/g47ix/status/2120924589253431444',
    'https://x.com/g47ix/status/2120924589156884883'
  ]) assert.ok(event.verification_sources.some((source) => source.url === url));
  assert.match(event.notes.join(' '), /Sábado: Zekrom e Kyurem Branco/);
  assert.equal(event.audit.no_duplicate_event_created, true);
});

test('all four new collector records are completed without making art a gate', () => {
  for (const name of [
    'g47ix-noticia-170ad7655d1a',
    'g47ix-noticia-52aee698dd36',
    'g47ix-noticia-b9ca473a4ed6',
    'atualizacao-forcada-pokemon-go-8162c07ee98c'
  ]) {
    const item = pending(name);
    assert.equal(item.etapa_editorial, 'completed', name);
    assert.equal(item.arte_obrigatoria, false, name);
    assert.equal(item.gerar_gpx, false, name);
    assert.ok(fs.existsSync(item.curated_path), name);
  }
});

test('forced 0.435.2 notice remains operational metadata, not a dated event', () => {
  const item = curated('atualizacao-forcada-pokemon-go-8162c07ee98c');
  assert.equal(item.source_classification, 'community_operational');
  assert.equal(item.status, 'no_public_story');
  assert.deepEqual(item.related_event_ids, []);
  assert.equal(events.some((event) => /0\.435\.2/.test(`${event.title || ''} ${event.summary || ''}`)), false);
});

test('collector curation introduces no editorial detail pending items', () => {
  assert.deepEqual(events.filter((event) => event.audit?.editorial_detail_pending === true).map((event) => event.id), []);
});
