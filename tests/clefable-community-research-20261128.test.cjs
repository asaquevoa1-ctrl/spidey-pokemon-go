const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const events = JSON.parse(fs.readFileSync(path.join(root, 'spidey-app/data/events.json'), 'utf8')).events;
const event = events.find((item) => item.id === '2026-11-28-super-mega-raid-day-preview');

test('Mega Clefable keeps the canonical event and labels observed research as community data', () => {
  assert.ok(event);
  assert.equal(events.filter((item) => item.id === event.id).length, 1);
  assert.equal(event.source.confidence, 'official');
  assert.equal(event.audit.research.classification, 'community_observed_with_source_conflict');
  assert.equal(event.audit.research.tasks.length, 5);
  assert.equal(event.audit.research.final_reward, '1 Passe de Batalha Premium');
  assert.match(event.audit.research.official_scope, /anúncio oficial confirma apenas/i);
  assert.match(event.notes.join(' '), /FONTE COMUNITÁRIA/);
});

test('observed tasks preserve exact public rewards without adding dates, places or GPX', () => {
  assert.deepEqual(event.audit.research.tasks, [
    { task: 'Capturar 1 Pokémon', reward: 'Encontro com Metagross' },
    { task: 'Fortalecer Pokémon 15 vezes', reward: '300 de Megaenergia de Metagross' },
    { task: 'Usar 3 ataques carregados supereficazes', reward: '5.000 Poeira Estelar' },
    { task: 'Vencer 1 Reide', reward: '3 MTs de Ataque Carregado' },
    { task: 'Derrotar um Pokémon do tipo Fada ou Voador em uma Reide', reward: '10 Doces Beldum GG' },
  ]);
  assert.deepEqual(event.locations, []);
  assert.equal(event.gpx.enabled, false);
  assert.equal(event.schedule.start_brazil, '2026-11-28T14:00:00-03:00');
  assert.equal(event.schedule.end_brazil, '2026-11-28T17:00:00-03:00');
});

test('the selected community source and conflicting report are both retained for audit', () => {
  const selected = 'https://pokemongohub.net/post/event/super-mega-clefable-raid-day/';
  const conflicting = 'https://www.serebii.net/pokemongo/todaysviewresearch/clefablesupermegaraiddaytimedresearch.shtml';
  assert.equal(event.audit.research.source_url, selected);
  assert.ok(event.verification_sources.some((source) => source.url === selected && source.confidence === 'verified_community'));
  assert.ok(event.verification_sources.some((source) => source.url === conflicting && source.confidence === 'verified_community'));
  assert.equal(event.audit.research.source_conflict.conflicting_report.url, conflicting);
  assert.equal(event.audit.research.source_conflict.conflicting_report.reward, '200 Doces Beldum');
  assert.equal(event.audit.research.source_conflict.official_individual_task_details_available, false);
  assert.equal(event.audit.editorial_detail_pending, false);
});
