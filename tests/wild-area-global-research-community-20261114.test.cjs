const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'spidey-app', 'data', 'events.json'), 'utf8'));
const events = catalog.events || catalog;

test('GO Wild Area Global keeps one official event and labels observed research as community', () => {
  const matches = events.filter((event) => event.id === '2026-11-go-wild-area-global');
  assert.equal(matches.length, 1);

  const event = matches[0];
  const research = event.audit.community_observed_special_research;
  assert.equal(event.source.confidence, 'official');
  assert.equal(research.community_confidence, 'verified_community');
  assert.equal(research.step_count, 6);
  assert.equal(research.common_step_1_tasks.length, 3);
  assert.equal(research.parallel_path_tasks.length, 5);
  assert.equal(research.individual_reward_details_status, 'community_sources_conflict_on_rewards_and_task_quantities');
  assert.deepEqual(research.conflicting_fields, [
    'step_1_rewards',
    'later_task_quantities',
    'step_4_encounters',
    'later_step_rewards',
  ]);
  assert.ok(research.sources.includes('https://pokemongohub.net/post/event/wild-area-2026-global/'));
  assert.equal(research.no_new_event_created, true);
  assert.match(research.conflict_note, /nenhuma delas foi promovida a fato oficial/i);
});

test('research notes expose useful tasks without publishing disputed individual rewards', () => {
  const event = events.find((item) => item.id === '2026-11-go-wild-area-global');
  const notes = event.notes.join(' ');
  assert.match(notes, /COMUNIDADE • PESQUISA OBSERVADA/);
  assert.match(notes, /seis etapas/);
  assert.match(notes, /Batalhas Max ou Gigamax/);
  assert.doesNotMatch(notes, /duas Batalhas Max/);
  assert.match(notes, /Duraludon Gigamax com Fundo Especial/);
  assert.match(notes, /recompensas individuais.*quantidades de objetivos divergem/i);
});
