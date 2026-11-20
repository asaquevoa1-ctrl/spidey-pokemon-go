'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const event = events.find(item => item.id === '2026-ana-pokemon-jet-blue');
const pendingPath = 'queue/pending/2026-11-20/celebrate-the-launch-of-the-blue-pokemon-jet-take-flight-on-a-new-adve-215183dcc0ce.json';
const curatedPath = 'queue/curated/celebrate-the-launch-of-the-blue-pokemon-jet-take-flight-on-a-new-adve-215183dcc0ce.json';

test('Pokémon Jet Azul publica a terceira fase oficial uma única vez', () => {
  assert.ok(event);
  assert.equal(events.filter(item => item.id === event.id).length, 1);
  assert.equal(event.source.url, 'https://pokemongo.com/news/2026_ana_blue');
  assert.equal(event.source.confidence, 'official');
  assert.equal(event.status, 'published');
  assert.equal(event.audit.editorial_detail_pending, false);
  assert.equal(event.audit.no_duplicate_story_created, true);
  assert.equal(event.presentation.requires_art, false);
  assert.equal(event.presentation.fallback_visual, 'date');
});

test('datas do Japão e conversões para Brasília são exatas', () => {
  assert.equal(event.schedule.local_timezone, 'Asia/Tokyo');
  assert.equal(event.schedule.start_local, '2026-12-11T13:00:00+09:00');
  assert.equal(event.schedule.end_local, '2027-08-31T20:00:00+09:00');
  assert.equal(event.schedule.start_brazil, '2026-12-11T01:00:00-03:00');
  assert.equal(event.schedule.end_brazil, '2027-08-31T08:00:00-03:00');
});

test('sete aeroportos oficiais aparecem sem coordenadas ou GPX inventados', () => {
  assert.equal(event.participating_airports.length, 7);
  assert.deepEqual(event.participating_airports.map(item => item.official_name), [
    'Chubu Centrair International Airport',
    'Noto Airport',
    'Hiroshima Airport',
    'Okayama Airport',
    'Osaka International Airport',
    'Kansai Airport',
    'Kobe Airport'
  ]);
  assert.deepEqual(event.locations, []);
  assert.equal(event.gpx.enabled, false);
  assert.equal(event.audit.official_airport_names_only, true);
  assert.equal(event.audit.airport_coordinates_invented, false);
});

test('Squirtle, Fundo, Brilhante possível e validade individual seguem o anúncio', () => {
  assert.ok(event.pokemon.some(item => item.name === 'Squirtle' && /Brilhante possível/.test(item.note)));
  assert.match(event.bonuses.join(' '), /Fundo de Localização/);
  assert.match(event.notes.join(' '), /expira três dias após o recebimento/);
  assert.match(event.notes.join(' '), /não publica as tarefas/);
  assert.equal(event.audit.rolling_research_expiry_preserved, true);
  assert.equal(event.audit.daily_raid_hours_not_invented, true);
  assert.equal(event.notifications.enabled, false);
});

test('aba ANA inclui a fase Azul e não oferece cópia quando não há coordenadas', () => {
  const source = fs.readFileSync('spidey-app/ana-airports.js', 'utf8');
  assert.doesNotThrow(() => new vm.Script(source));
  assert.match(source, /2026-ana-pokemon-jet-blue/);
  assert.match(source, /Squirtle • 7 aeroportos/);
  assert.match(source, /const points=refs\.length\?refs:officialNames/);
  assert.match(source, /sem coordenada publicada do Ginásio/);
  assert.match(source, /if\(!value\)return/);
  assert.match(fs.readFileSync('spidey-app/sw.js', 'utf8'), /spidey-app-20261120-ana-blue1/);
});

test('registro automático fica concluído e ligado à auditoria pública', () => {
  const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
  const curated = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
  assert.equal(pending.etapa_editorial, 'completed');
  assert.equal(pending.arte_obrigatoria, false);
  assert.equal(pending.curated_path, curatedPath);
  assert.deepEqual(pending.related_event_ids, [event.id]);
  assert.equal(curated.source_classification, 'official_new_story');
  assert.equal(curated.art_required_for_publication, false);
  assert.equal(curated.gerar_gpx, false);
  assert.deepEqual(curated.coordenadas, []);
});
