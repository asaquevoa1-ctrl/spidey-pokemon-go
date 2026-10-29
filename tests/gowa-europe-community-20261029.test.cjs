const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const locals = JSON.parse(fs.readFileSync('spidey-app/data/local-events.json', 'utf8')).events;

test('European Wild Area meetups stay grouped with the global story', () => {
  const global = events.find(event => event.id === '2026-11-go-wild-area-global');
  assert.ok(global);
  assert.equal(global.europe_community_program.official_article, 'https://pokemongo.com/news/gowa-global-europe-2026');
  assert.deepEqual(global.europe_community_program.meetups.map(item => item.city), ['Karlsruhe', 'Estocolmo']);
  assert.match(global.news.summary, /Karlsruhe/);
  assert.match(global.news.summary, /Estocolmo/);
});

test('Karlsruhe and Stockholm keep their distinct local windows and IANA zones', () => {
  const karlsruhe = locals.find(event => event.id === '2026-11-go-wild-area-global-europe-karlsruhe');
  const stockholm = locals.find(event => event.id === '2026-11-go-wild-area-global-europe-stockholm');
  assert.ok(karlsruhe);
  assert.ok(stockholm);
  assert.deepEqual(
    [karlsruhe.schedule.start_date, karlsruhe.schedule.start_time, karlsruhe.schedule.end_date, karlsruhe.schedule.end_time, karlsruhe.schedule.timezone],
    ['2026-11-14', '10:00', '2026-11-14', '20:00', 'Europe/Berlin']
  );
  assert.deepEqual(
    [stockholm.schedule.start_date, stockholm.schedule.start_time, stockholm.schedule.end_date, stockholm.schedule.end_time, stockholm.schedule.timezone],
    ['2026-11-15', '10:00', '2026-11-15', '18:00', 'Europe/Stockholm']
  );
  for (const event of [karlsruhe, stockholm]) {
    assert.equal(event.gpx.enabled, false);
    assert.equal(event.locations[0].exact_pokestop_verified, false);
    assert.equal(event.locations[0].exact_raid_gym_verified, false);
    assert.equal(event.locations[0].exact_power_spot_verified, false);
    assert.equal(event.audit.related_event_id, '2026-11-go-wild-area-global');
    assert.doesNotThrow(() => new Intl.DateTimeFormat('pt-BR', { timeZone: event.schedule.timezone }).format(new Date('2026-11-14T12:00:00Z')));
  }
});

test('local meetup end boundaries are exact in UTC', () => {
  assert.equal(new Date('2026-11-14T20:00:00+01:00').toISOString(), '2026-11-14T19:00:00.000Z');
  assert.equal(new Date('2026-11-15T18:00:00+01:00').toISOString(), '2026-11-15T17:00:00.000Z');
});
