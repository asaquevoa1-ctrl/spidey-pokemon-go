const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const pending = JSON.parse(fs.readFileSync('queue/pending/2026-11-19/g47ix-noticia-65cc379ae1e0.json', 'utf8'));
const curated = JSON.parse(fs.readFileSync(pending.curated_path, 'utf8'));

test('the G47IX Eternamax reminder is grouped into the existing official records', () => {
  assert.equal(pending.status, 'grouped_without_new_claims');
  assert.equal(pending.etapa_editorial, 'completed');
  assert.equal(pending.arte_obrigatoria, false);
  assert.equal(pending.audit.no_new_public_claim, true);
  assert.equal(pending.audit.no_duplicate_story_or_event_created, true);
  assert.equal(pending.audit.calendar_or_news_changed, false);
  assert.equal(pending.audit.art_or_push_triggered, false);
  assert.equal(curated.status, 'grouped_without_new_claims');
  assert.equal(curated.art_required_for_publication, false);
});

test('the official Eternamax window remains unique and unchanged', () => {
  const id = '2026-11-21-eternamax-eternatus-max-battles';
  const matches = events.filter((event) => event.id === id);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].schedule.start_local, '2026-11-21T11:00:00-03:00');
  assert.equal(matches[0].schedule.end_local, '2026-11-21T14:00:00-03:00');
  assert.match(matches[0].summary, /Doces e Doces GG/);
  assert.match(matches[0].summary, /não pode ser capturada/);
});
