'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({window: {}, URL, Date, Map, Set, Object, Intl});
vm.runInContext(fs.readFileSync(path.join(root, 'spidey-app/date-only.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'spidey-app/news-feed.js'), 'utf8'), context);
const dateOnly = context.window.SpideyDateOnly;
const range = event => {
  if (dateOnly.valid(event)) return dateOnly.bounds(event);
  const schedule = event.schedule || {};
  const start = Date.parse(schedule.start_brazil || schedule.start_local || '');
  const end = Date.parse(schedule.end_brazil || schedule.end_local || '');
  return {start: Number.isFinite(start) ? new Date(start) : null, end: Number.isFinite(end) ? new Date(end) : null};
};
const build = (events, now) => context.window.SpideyNews.build(events, range, new Date(now));
const has = (groups, id) => groups.some(group => group.events.some(event => event.id === id));
function dateEvent(id, date, timezone) {
  return {id, status: 'published', title: id, source: {url: 'https://pokemongo.com/news/' + id}, schedule: {precision: 'date', start_date: date, end_date: date, local_timezone: timezone}};
}

test('bounds usa o fuso IANA do evento, não o offset fixo de Brasília', () => {
  const cases = [
    ['Asia/Tokyo', '2026-11-13', '2026-11-12T15:00:00.000Z', '2026-11-13T15:00:00.000Z'],
    ['America/Sao_Paulo', '2026-11-13', '2026-11-13T03:00:00.000Z', '2026-11-14T03:00:00.000Z'],
    ['Pacific/Kiritimati', '2026-11-13', '2026-11-12T10:00:00.000Z', '2026-11-13T10:00:00.000Z'],
    ['America/Los_Angeles', '2026-11-01', '2026-11-01T07:00:00.000Z', '2026-11-02T08:00:00.000Z']
  ];
  for (const [timezone, date, start, end] of cases) {
    const bounds = dateOnly.bounds(dateEvent('date-only-boundary', date, timezone));
    assert.equal(bounds.start.toISOString(), start, timezone + ' start');
    assert.equal(bounds.end.toISOString(), end, timezone + ' exclusive end');
    assert.equal(bounds.dateOnly, true);
  }
});

test('notícia date-only sai exatamente após o último dia no fuso IANA relacionado', () => {
  const event = dateEvent('tokyo-date-only-event', '2026-11-13', 'Asia/Tokyo');
  const news = {
    id: 'tokyo-date-only-news',
    content_type: 'news',
    status: 'published',
    title: 'Aviso com data local',
    source: {url: 'https://pokemongo.com/news/tokyo-date-only-news'},
    news: {title: 'Aviso com data local', expire_when_related_windows_end: true},
    related_event_ids: [event.id]
  };
  const before = build([event, news], '2026-11-13T14:59:59.999Z');
  const atEnd = build([event, news], '2026-11-13T15:00:00.000Z');
  assert.equal(has(before, event.id), true);
  assert.equal(has(before, news.id), true);
  assert.equal(has(atEnd, event.id), false);
  assert.equal(has(atEnd, news.id), false);
});

test('referências ausentes ou inválidas continuam falhando abertas sem inventar horário', () => {
  const unknown = {
    id: 'unknown-related-news',
    content_type: 'news',
    status: 'published',
    title: 'Aviso sem referência',
    source: {url: 'https://pokemongo.com/news/unknown-related-news'},
    news: {title: 'Aviso sem referência', expire_when_related_windows_end: true},
    related_event_ids: ['missing-event']
  };
  const invalidEvent = dateEvent('invalid-date-only-event', '2026-11-13', 'Invalid/Timezone');
  const invalidNews = {
    id: 'invalid-date-only-news',
    content_type: 'news',
    status: 'published',
    title: 'Aviso com fuso inválido',
    source: {url: 'https://pokemongo.com/news/invalid-date-only-news'},
    news: {title: 'Aviso com fuso inválido', expire_when_related_windows_end: true},
    related_event_ids: [invalidEvent.id]
  };
  const groups = build([unknown, invalidEvent, invalidNews], '2026-11-14T00:00:00.000Z');
  assert.equal(has(groups, unknown.id), true);
  assert.equal(has(groups, invalidNews.id), true);
});


test('notícia do Pokémon Center Bangkok permanece até o último dia da Pesquisa em Asia/Bangkok', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'spidey-app/data/events.json'), 'utf8')).events;
  const opening = catalog.find(event => event.id === '2026-12-pokemon-center-bangkok-opening');
  const deadline = catalog.find(event => event.id === '2026-12-30-pokemon-center-bangkok-research-deadline');
  const story = catalog.find(event => event.id === 'official-news-auto-bangkok-20261029');
  assert.ok(opening && deadline && story);
  assert.equal(deadline.schedule.local_timezone, 'Asia/Bangkok');
  assert.equal(dateOnly.bounds(deadline).end.toISOString(), '2026-12-30T17:00:00.000Z');
  const afterOpening = build([opening, deadline, story], '2026-12-11T00:00:00.000Z');
  assert.equal(has(afterOpening, opening.id), false);
  assert.equal(has(afterOpening, story.id), true);
  const beforeLastLocalDayEnds = build([opening, deadline, story], '2026-12-30T16:59:59.999Z');
  const atLastLocalDayEnd = build([opening, deadline, story], '2026-12-30T17:00:00.000Z');
  assert.equal(has(beforeLastLocalDayEnds, deadline.id), true);
  assert.equal(has(beforeLastLocalDayEnds, story.id), true);
  assert.equal(has(atLastLocalDayEnd, deadline.id), false);
  assert.equal(has(atLastLocalDayEnd, story.id), false);
});
