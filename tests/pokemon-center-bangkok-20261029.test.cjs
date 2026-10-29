const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const catalog = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8'));
const event = catalog.events.find(item => item.id === '2026-12-pokemon-center-bangkok-opening');

test('Pokémon Center Bangkok uses the official nationwide Thailand window', () => {
  assert.ok(event);
  assert.equal(event.source.url, 'https://pokemongo.com/en/news/pokemon-center-bangkok-opens-2026');
  assert.equal(event.source.confidence, 'official');
  assert.equal(event.schedule.local_timezone, 'Asia/Bangkok');
  assert.equal(event.schedule.start_local, '2026-12-01T06:00:00+07:00');
  assert.equal(event.schedule.end_local, '2026-12-10T23:59:00+07:00');
  assert.equal(event.schedule.start_brazil, '2026-11-30T20:00:00-03:00');
  assert.equal(event.schedule.end_brazil, '2026-12-10T13:59:00-03:00');
  assert.ok(event.notes.some(note => note.includes('todo o território da Tailândia')));
});

test('Bangkok opening does not invent encounters, shiny claims, coordinates or research hours', () => {
  assert.deepEqual(event.pokemon, []);
  assert.deepEqual(event.locations, []);
  assert.equal(event.gpx.enabled, false);
  assert.equal(event.research_claim_deadline.end_date, '2026-12-30');
  assert.equal(event.research_claim_deadline.precision, 'date');
  assert.equal(event.research_claim_deadline.time_confirmed, false);
  assert.ok(event.notes.some(note => note.includes('nenhum horário foi atribuído')));
  assert.ok(!JSON.stringify(event).toLowerCase().includes('brilhante possível'));
});

test('Bangkok announcement is one useful story linked to the calendar identity', () => {
  assert.equal(event.news.published_on, '2026-10-29');
  assert.match(event.news.title, /Bangkok/);
  assert.equal(catalog.events.filter(item => item.source?.url === event.source.url).length, 1);
  assert.equal(catalog.events.filter(item => item.id === event.id).length, 1);
});
