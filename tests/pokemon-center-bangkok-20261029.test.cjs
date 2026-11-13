const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const catalog = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8'));
const event = catalog.events.find(item => item.id === '2026-12-pokemon-center-bangkok-opening');
const deadline = catalog.events.find(item => item.id === '2026-12-30-pokemon-center-bangkok-research-deadline');
const story = catalog.events.find(item => item.id === 'official-news-auto-bangkok-20261029');

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

test('Bangkok research completion has its own date-only window in Asia/Bangkok', () => {
  assert.ok(deadline);
  assert.equal(deadline.source.url, event.source.url);
  assert.equal(deadline.schedule.precision, 'date');
  assert.equal(deadline.schedule.local_timezone, 'Asia/Bangkok');
  assert.equal(deadline.schedule.start_date, '2026-12-01');
  assert.equal(deadline.schedule.end_date, '2026-12-30');
  assert.equal(deadline.notifications.enabled, false);
  assert.equal(deadline.gpx.enabled, false);
  assert.ok(deadline.notes.some(note => note.includes('último dia inteiro no fuso IANA Asia/Bangkok')));
  assert.ok(deadline.notes.some(note => note.includes('não informa o horário final')));
});

test('Bangkok announcement remains one story linked to two distinct calendar windows', () => {
  assert.ok(story);
  assert.equal(event.news, undefined);
  assert.equal(story.content_type, 'news');
  assert.equal(story.news.published_on, '2026-10-29');
  assert.equal(story.news.expire_when_related_windows_end, true);
  assert.deepEqual(story.related_event_ids, [event.id, deadline.id]);
  assert.match(story.news.title, /Bangkok/);
  assert.match(story.news.summary, /30\/12/);
  const sameCanonical = catalog.events.filter(item => item.source?.url === event.source.url);
  assert.equal(sameCanonical.length, 3);
  assert.equal(sameCanonical.filter(item => item.content_type === 'news').length, 1);
  assert.equal(catalog.events.filter(item => item.id === deadline.id).length, 1);
});
