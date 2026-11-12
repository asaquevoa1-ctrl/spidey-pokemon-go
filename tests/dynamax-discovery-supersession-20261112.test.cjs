'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;

test('community Dynamax discovery is archived after the official partial confirmation', () => {
  const historical = events.find((event) => event.id === '2026-10-08-dynamax-forms-datamine');
  const official = events.find((event) => event.id === '2026-11-09-into-the-wild');

  assert.ok(historical);
  assert.ok(official);
  assert.equal(historical.status, 'archived');
  assert.equal(historical.superseded_by, official.id);
  assert.equal(historical.calendar.mode, 'hidden');
  assert.equal(historical.audit.historical_record_preserved, true);
  assert.equal(historical.audit.not_a_calendar_event, true);
  assert.equal(historical.audit.meltan_dynamax_confirmed, true);
  assert.equal(historical.audit.regidrago_dynamax_confirmed, true);
  assert.equal(historical.audit.melmetal_dynamax_confirmed, false);
  assert.equal(events.filter((event) => event.id === historical.id).length, 1);
});

test('official links replace the outdated blanket no-announcement claim without inventing Melmetal', () => {
  const historical = events.find((event) => event.id === '2026-10-08-dynamax-forms-datamine');
  const officialUrls = historical.verification_sources
    .filter((source) => source.confidence === 'official')
    .map((source) => source.url);
  const pokemon = Object.fromEntries(historical.pokemon.map((entry) => [entry.name, entry.note]));

  assert.deepEqual(officialUrls, [
    'https://pokemongo.com/pt-BR/news/into-the-wild-2026',
    'https://pokemongo.com/news/into-the-wild-2026',
  ]);
  assert.match(pokemon['Meltan Dinamax'], /confirmado oficialmente/);
  assert.match(pokemon['Regidrago Dinamax'], /confirmado oficialmente/);
  assert.match(pokemon['Melmetal Dinamax'], /não confirmado/);
  assert.doesNotMatch(historical.summary, /Não há anúncio oficial/);
  assert.equal(historical.notifications.enabled, false);
  assert.equal(historical.schedule, undefined);
});
