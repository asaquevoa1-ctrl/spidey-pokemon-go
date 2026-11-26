'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const event = events.find(item => item.id === '2026-11-24-twilight-wishes-preview');

test('Twilight Wishes keeps the closed and current Field Research windows distinct', () => {
  assert(event);
  assert.equal(event.field_research_windows.length, 2);
  const [closed, current] = event.field_research_windows;
  assert.equal(closed.end_local, '2026-11-26T10:00:00');
  assert.equal(closed.surface_state_at_review, 'archived_after_end');
  assert.equal(current.start_local, closed.end_local);
  assert.equal(current.end_local, '2026-11-30T20:00:00');
  assert.equal(current.surface_state_at_review, 'active');
});

test('current task mappings are labelled as community observations', () => {
  const current = event.field_research_windows[1];
  const byTask = new Map(current.observed_tasks.map(item => [item.task, item]));
  assert.deepEqual(byTask.get('Use um Incenso').rewards, ['Bramblin']);
  assert.deepEqual(byTask.get('Vença uma Reide').rewards, [
    'Gengar com fantasia do Festival Assustador',
    'Drifblim com fantasia Travessura de Halloween'
  ]);
  assert.deepEqual(byTask.get('Explore 1 km').rewards, ['Staryu', 'Elgyem']);
  for (const task of current.observed_tasks) {
    assert.equal(task.classification, 'verified_community_observation');
  }
  assert.equal(event.audit.official_task_to_reward_mapping_available, false);
  assert.match(event.news.label, /OFICIAL \+ COMUNIDADE/);
});

test('current public notes no longer present Applin and Maschiff as the active phase', () => {
  assert.match(event.summary, /Fase atual/);
  assert.match(event.notes.join(' '), /HISTÓRICO/);
  assert.match(event.notes.join(' '), /não detalhes oficiais/);
  assert.deepEqual(event.field_research_windows[0].encounters, ['Applin', 'Maschiff']);
  assert.equal(event.audit.expired_field_research_window_archived, true);
  assert.equal(event.notifications.enabled, false);
});

test('official and community sources remain separately identified', () => {
  assert.equal(event.source.confidence, 'official');
  const community = event.verification_sources.filter(source => source.confidence === 'verified_community');
  assert(community.some(source => source.url === 'https://leekduck.com/events/twilight-wishes-2026/'));
  assert(community.some(source => source.url === 'https://pokemongohub.net/post/event/twilight-wishes-2026/'));
  assert.equal(event.audit.editorial_detail_pending, false);
});
