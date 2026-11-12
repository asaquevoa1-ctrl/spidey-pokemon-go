'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'spidey-app/data/events.json'), 'utf8'));
const events = data.events;
const byId = id => events.find(event => event.id === id);

test('Natureza Selvagem permanece uma única história com janelas distintas', () => {
  const stories = events.filter(event => event.id === '2026-11-09-into-the-wild');
  assert.equal(stories.length, 1);
  const story = stories[0];
  assert.deepEqual(story.related_event_ids, [
    '2026-11-09-into-the-wild-go-pass',
    '2026-11-09-into-the-wild-pass-claim',
    '2026-11-09-silver-bottle-cap-use-deadline'
  ]);
  assert.equal(byId('2026-11-09-into-the-wild-go-pass').schedule.end_local, '2026-11-15T18:00:00-03:00');
  assert.equal(byId('2026-11-09-into-the-wild-pass-claim').schedule.end_local, '2026-11-17T23:59:00-03:00');
  assert.equal(byId('2026-11-09-silver-bottle-cap-use-deadline').schedule.end_local, '2026-11-22T23:59:00-03:00');
});

test('detalhes oficiais completos não criam janela inventada para o Desafio Global', () => {
  const story = byId('2026-11-09-into-the-wild');
  const text = JSON.stringify(story);
  for (const detail of ['Sopro do Dragão', 'Garra de Metal', 'Bola de Névoa', 'Esfera de Luz', 'Magnemite', 'Noibat', 'Togedemaru', 'Espada Colossal', 'Escudo Colossal']) {
    assert.match(text, new RegExp(detail));
  }
  assert.equal(story.audit.field_research_individual_tasks_unpublished, true);
  assert.equal(story.audit.global_challenge_has_no_separate_official_window, true);
  assert.equal(events.filter(event => /global.challenge|desafio.global/i.test(event.id) && event.related_news_id === story.id).length, 0);
  assert.deepEqual(story.locations, []);
  assert.equal(story.gpx.enabled, false);
});

test('Hora Max de Regidrago mostra golpe, brilho e Fundo Especial sem garantia', () => {
  const hour = byId('2026-11-12-max-hour-regidrago');
  assert.equal(hour.schedule.start_local, '2026-11-12T18:00:00-03:00');
  assert.equal(hour.schedule.end_local, '2026-11-12T19:00:00-03:00');
  assert.match(hour.summary, /Sopro do Dragão/);
  assert.equal(hour.pokemon[0].shiny, 'possible');
  assert.equal(hour.pokemon[0].special_background, 'possible_not_guaranteed');
  assert.deepEqual(hour.locations, []);
});

test('fontes oficiais usam URLs canônicas e o Passe registra as recompensas publicadas', () => {
  const ids = [
    '2026-11-09-into-the-wild-go-pass',
    '2026-11-09-into-the-wild-pass-claim',
    '2026-11-09-silver-bottle-cap-use-deadline'
  ];
  for (const id of ids) {
    assert.equal(byId(id).verification_sources[0].url, 'https://pokemongo.com/news/into-the-wild-2026');
  }
  const passText = byId('2026-11-09-into-the-wild-go-pass').notes.join(' ');
  assert.match(passText, /Trilha gratuita/);
  assert.match(passText, /Trilha Deluxe/);
  assert.match(passText, /Camiseta da Área Selvagem GO 2026 \(roxa\)/);
  assert.match(passText, /metade da distância/);
  assert.match(passText, /5\.000 PE adicionais por reide/);
  assert.match(passText, /custo de Partículas Max reduzido a 3\/4/);
  assert.match(passText, /Doce GG adicional/);
  assert.doesNotMatch(passText, /MTs|Passe de Reide Premium|ranques Ultra e Mestre/);
});
