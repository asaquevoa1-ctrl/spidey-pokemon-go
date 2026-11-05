const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const catalog = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const matches = catalog.filter((event) => event.id === '2026-11-halloween-part-2');

test('Halloween Parte II continua sendo uma única história com a janela original', () => {
  assert.equal(matches.length, 1);
  const event = matches[0];
  assert.equal(event.schedule.start_brazil, '2026-11-01T10:00:00-03:00');
  assert.equal(event.schedule.end_brazil, '2026-11-05T20:00:00-03:00');
  assert.equal(event.source.confidence, 'official');
});

test('Pesquisa Temporária oficial mostra recompensas e limite sem inventar etapas', () => {
  const event = matches[0];
  const timed = event.audit.research.official_timed_research;
  assert.equal(timed.confidence, 'official');
  assert.equal(timed.tasks_automatically_completed, true);
  assert.deepEqual(timed.rewards, ['6 Doces Raros', 'Encontro com Sinistea com laço']);
  assert.equal(timed.claim_deadline_local, event.schedule.end_local);
  assert.ok(event.notes.some((note) => note.includes('PESQUISA TEMPORÁRIA OFICIAL')));
  assert.match(event.news.summary, /6 Doces Raros e Sinistea com laço/);
  assert.doesNotMatch(JSON.stringify(timed), /etapa|passo|quantidade de tarefas/i);
});

test('tarefas de Campo ficam identificadas como fonte comunitária verificada', () => {
  const event = matches[0];
  const field = event.audit.research.field_research;
  assert.equal(field.confidence, 'verified_community');
  assert.match(field.source_url, /leekduck\.com\/events\/halloween-2026-part-2/);
  assert.equal(field.tasks.length, 5);
  assert.deepEqual(field.tasks.map((item) => item.task), [
    'Capturar 13 Pokémon',
    'Capturar 13 Pokémon do tipo Fantasma',
    'Fazer 6 boas jogadas',
    'Vencer uma reide',
    'Vencer três reides',
  ]);
  assert.ok(event.notes.some((note) => note.includes('fonte comunitária Leek Duck')));
});
