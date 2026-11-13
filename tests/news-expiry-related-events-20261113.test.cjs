'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const events = JSON.parse(fs.readFileSync(path.join(root, 'spidey-app/data/events.json'), 'utf8')).events;
const byId = id => events.find(event => event.id === id);
const sandbox = {window: {}, URL, Date, Map, Set, Object};
vm.runInNewContext(fs.readFileSync(path.join(root, 'spidey-app/news-feed.js'), 'utf8'), sandbox);
const build = now => sandbox.window.SpideyNews.build(events, range, new Date(now));
const has = (groups, id) => groups.some(group => group.events.some(event => event.id === id));

function range(event) {
  const schedule = event.schedule || {};
  // Date-only schedules intentionally have no inferred clock time.
  if (schedule.precision === 'date') return {start: null, end: null};
  const start = Date.parse(schedule.start_brazil || schedule.start_local || '');
  const end = Date.parse(schedule.end_brazil || schedule.end_local || '');
  return {
    start: Number.isFinite(start) ? new Date(start) : null,
    end: Number.isFinite(end) ? new Date(end) : null
  };
}

test('notícia dos selos presenciais de Sendai/México expira, mas a rota permanente continua', () => {
  const oldEventNews = byId('official-news-auto-3226a2a8b105');
  const permanentRoutesNews = byId('official-news-auto-1eda22614526');
  assert.equal(oldEventNews.news.expire_when_related_windows_end, true);
  assert.equal(permanentRoutesNews.news.expire_when_related_windows_end, undefined);
  const current = build('2026-11-13T08:57:38Z');
  assert.equal(has(current, oldEventNews.id), false);
  assert.equal(has(current, permanentRoutesNews.id), true);
});

test('aviso da Wild Area permanece até o fim do último evento relacionado', () => {
  const id = 'official-news-auto-5e1b1cd68f6c';
  assert.equal(has(build('2026-11-15T20:59:59Z'), id), true);
  assert.equal(has(build('2026-11-15T21:00:00Z'), id), false);
});

test('pesquisa Machamp permanece até o prazo final, não apenas até a aquisição', () => {
  const id = 'official-news-auto-6e45ee38e2b8';
  assert.equal(has(build('2026-11-16T02:58:59Z'), id), true);
  assert.equal(has(build('2026-11-16T02:59:00Z'), id), false);
});

test('Black Friday permanece até a última janela promocional relacionada', () => {
  const id = 'official-news-auto-1027790d90b8';
  assert.equal(has(build('2026-11-30T03:59:59Z'), id), true);
  assert.equal(has(build('2026-11-30T04:00:00Z'), id), false);
});

test('referências ausentes ou date-only falham abertas, sem inventar horário', () => {
  const unknown = {
    id: 'qa-unknown-related-news',
    content_type: 'news',
    status: 'published',
    title: 'Aviso com referência desconhecida',
    source: {url: 'https://pokemongo.com/news/qa-unknown-related-news'},
    news: {title: 'Aviso com referência desconhecida', expire_when_related_windows_end: true},
    related_event_ids: ['missing-event']
  };
  const dateOnlyEvent = {
    id: 'qa-date-only-event',
    status: 'published',
    schedule: {precision: 'date', start_date: '2026-11-13', end_date: '2026-11-13', local_timezone: 'Asia/Tokyo'}
  };
  const dateOnlyNews = {
    id: 'qa-date-only-news',
    content_type: 'news',
    status: 'published',
    title: 'Aviso date-only',
    source: {url: 'https://pokemongo.com/news/qa-date-only-news'},
    news: {title: 'Aviso date-only', expire_when_related_windows_end: true},
    related_event_ids: [dateOnlyEvent.id]
  };
  const groups = sandbox.window.SpideyNews.build([unknown, dateOnlyEvent, dateOnlyNews], range, new Date('2026-11-14T00:00:00Z'));
  assert.equal(has(groups, unknown.id), true);
  assert.equal(has(groups, dateOnlyNews.id), true);
});

test('notícias evergreen sem janela relacionada continuam visíveis', () => {
  const evergreen = {
    id: 'qa-evergreen-news',
    content_type: 'news',
    status: 'published',
    title: 'Atualização permanente',
    source: {url: 'https://pokemongo.com/news/qa-evergreen-news'},
    news: {title: 'Atualização permanente', expire_when_related_windows_end: true}
  };
  assert.equal(has(sandbox.window.SpideyNews.build([evergreen], range, new Date('2027-01-01T00:00:00Z')), evergreen.id), true);
});

test('versão do módulo de Novidades invalida o cache PWA após a correção', () => {
  const index = fs.readFileSync(path.join(root, 'spidey-app/index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'spidey-app/sw.js'), 'utf8');
  assert.ok(index.includes('news-feed.js?v=20261113-news-expiry1'));
  assert.ok(sw.includes("const CACHE = 'spidey-app-20261113-news-expiry1'"));
  assert.ok(sw.includes("'./news-feed.js'"));
});
