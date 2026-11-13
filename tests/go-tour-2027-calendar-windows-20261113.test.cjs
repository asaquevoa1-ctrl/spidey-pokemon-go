'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'spidey-app/data/events.json'), 'utf8'));
const events = catalog.events;
const byId = id => events.find(event => event.id === id);
const storyId = '2027-02-go-tour-alola-save-the-date';
const childIds = [
  '2027-02-19-go-tour-kaohsiung',
  '2027-02-19-go-tour-los-angeles',
  '2027-02-27-go-tour-global'
];
const communityId = '2026-11-max-mondays-community-outlook';

function range(event) {
  const schedule = event.schedule || {};
  if (schedule.precision === 'date') {
    return {
      start: new Date(schedule.start_date + 'T00:00:00-03:00'),
      end: new Date(schedule.end_date + 'T23:59:59-03:00')
    };
  }
  const start = schedule.start_brazil || schedule.start_local;
  const end = schedule.end_brazil || schedule.end_local;
  return start && end ? {start: new Date(start), end: new Date(end)} : null;
}

const sandbox = {window: {}, URL, Date};
vm.runInNewContext(fs.readFileSync(path.join(root, 'spidey-app/news-feed.js'), 'utf8'), sandbox);
const stories = sandbox.window.SpideyNews.build(events, range, new Date('2026-11-13T12:00:00-03:00'));

test('GO Tour 2027 mantém uma história e três janelas oficiais distintas', () => {
  const story = byId(storyId);
  assert.ok(story);
  assert.equal(story.content_type, 'news');
  assert.equal(story.calendar.mode, 'hidden');
  assert.equal(story.schedule, undefined);
  assert.equal(story.news.published_on, '2026-09-23');

  const expected = [
    ['2027-02-19', '2027-02-21', 'Asia/Taipei'],
    ['2027-02-19', '2027-02-21', 'America/Los_Angeles'],
    ['2027-02-27', '2027-02-28', 'America/Sao_Paulo']
  ];
  const children = childIds.map(byId);
  assert.ok(children.every(Boolean));
  assert.equal(new Set(children.map(event => event.id)).size, 3);
  assert.deepEqual(children.map(event => [
    event.schedule.start_date, event.schedule.end_date, event.schedule.local_timezone
  ]), expected);

  for (const event of children) {
    assert.equal(event.schedule.precision, 'date');
    assert.equal(event.calendar.mode, 'span');
    assert.equal(event.source.url, story.source.url);
    assert.equal(event.source.confidence, 'official');
    assert.equal(event.schedule.start_local, undefined);
    assert.equal(event.schedule.end_local, undefined);
    assert.equal(event.notifications.enabled, false);
    assert.equal(event.gpx.enabled, false);
    assert.equal(event.presentation.requires_art, false);
    assert.equal(event.locations.length, 0);
  }
  assert.match(children[2].audit.timezone_role, /referência de exibição date-only/);
});

test('as três janelas do GO Tour aparecem agrupadas em uma única notícia oficial', () => {
  const key = 'official:/news/save-the-date-go-tour-2027';
  const groups = stories.filter(item => item.key === key);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].events.length, 4);
  assert.equal(groups[0].title, byId(storyId).news.title);
});

test('Max Mondays comunitários ficam em Novidades, sem calendário ou horário confirmado', () => {
  const item = byId(communityId);
  assert.ok(item);
  assert.equal(item.content_type, 'news');
  assert.equal(item.calendar.mode, 'hidden');
  assert.equal(item.schedule, undefined);
  assert.equal(item.source.confidence, 'community');
  assert.equal(item.news.label, 'COMUNIDADE • A CONFIRMAR');
  assert.equal(item.audit.official_confirmation_found, false);
  assert.equal(item.audit.calendar_entry_created, false);
  assert.deepEqual(item.audit.source_urls, [
    'https://leekduck.com/events/max-mondays-2026-11-16/',
    'https://leekduck.com/events/max-mondays-2026-11-23/',
    'https://leekduck.com/events/max-mondays-2026-11-30/'
  ]);
  assert.equal(stories.filter(group => group.event.id === communityId).length, 1);
});

test('nenhuma arte Premium, coordenada, rota ou notificação foi criada', () => {
  const selected = [...childIds.map(byId), byId(communityId)];
  for (const event of selected) {
    assert.equal(event.notifications.enabled, false);
    assert.equal(event.gpx.enabled, false);
    assert.equal(event.presentation.requires_art, false);
    assert.equal(event.locations.length, 0);
  }
});

test('Minior mantém uma única história oficial com detalhes completos e janelas existentes', () => {
  const miniorIds = ['2026-10-minior-orionids', '2026-11-minior-leonids', '2026-12-minior-geminids'];
  const minior = miniorIds.map(byId);
  assert.ok(minior.every(Boolean));
  const leonids = byId('2026-11-minior-leonids');
  const textNotes = leonids.notes.join(' ');
  assert.match(leonids.summary, /Poeira Estelar/i);
  assert.match(textNotes, /estrelas cadentes/i);
  assert.match(textNotes, /GO Wild Area Global/i);
  assert.match(textNotes, /abaixo de 50%/i);
  assert.match(textNotes, /LAIC 2027/i);
  assert.equal(leonids.audit.community_cross_reference.source_id, 'g47ix-2120984983892586580');
  const group = stories.find(item => item.events.some(event => event.id === '2026-11-minior-leonids'));
  assert.ok(group);
  assert.equal(group.events.length, 2, 'a janela encerrada de Orionidas não deve aparecer na notícia atual');
  assert.equal(group.title, leonids.news.title);
});

test('G47IX Minior foi curado sem arte, sem nova história e com histórico preservado', () => {
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'queue/pending/2026-11-13/g47ix-evento-ad22b131ff54.json'), 'utf8'));
  const curated = JSON.parse(fs.readFileSync(path.join(root, 'queue/curated/g47ix-evento-ad22b131ff54.json'), 'utf8'));
  assert.equal(raw.original_status, 'aguardando_curadoria_premium');
  assert.equal(raw.status, 'grouped_without_new_claims');
  assert.match(raw.mensagem, /Minior Showers: Leonids/);
  assert.equal(curated.status, 'grouped_without_new_claims');
  assert.equal(curated.source_classification, 'community');
  assert.equal(curated.art_required_for_publication, false);
  assert.deepEqual(curated.related_event_ids, ['2026-11-minior-leonids']);
  assert.equal(curated.no_new_art, true);
});

test('nenhum registro do catálogo permanece com editorial_detail_pending', () => {
  assert.equal(events.filter(event => event.audit?.editorial_detail_pending === true).length, 0);
});
