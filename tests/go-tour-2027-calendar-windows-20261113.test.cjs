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
  assert.match(item.summary, /23 a 29\/11/i);
  assert.match(item.summary, /30\/11 a 06\/12/i);
  assert.equal(item.audit.full_text_review_completed, true);
  assert.deepEqual(item.audit.community_max_battle_windows.map(window => [
    window.date, window.pokemon, window.possible_from, window.possible_through, window.classification
  ]), [
    ['2026-11-16', null, '2026-11-16', '2026-11-23', 'community_unconfirmed'],
    ['2026-11-23', 'Dynamax Espurr', '2026-11-23', '2026-11-29', 'community_unconfirmed'],
    ['2026-11-30', 'Dynamax Cryogonal', '2026-11-30', '2026-12-06', 'community_unconfirmed']
  ]);
  assert.match(item.notes.join(' '), /06h–21h locais/);
  assert.match(item.notes.join(' '), /Pontos de Energia/);
  assert.equal(stories.filter(group => group.event.id === communityId).length, 1);
  const archivedIds = ['2026-11-23-max-espurr', '2026-11-30-max-cryogonal'];
  for (const id of archivedIds) {
    const archived = byId(id);
    assert.ok(archived);
    assert.equal(archived.status, 'archived');
    assert.equal(archived.schedule, undefined);
    assert.equal(archived.calendar.mode, 'hidden');
    assert.equal(archived.audit.linked_news_id, communityId);
    assert.equal(archived.audit.official_confirmation_found, false);
    assert.equal(archived.audit.not_in_current_calendar, true);
    assert.equal(archived.audit.original_community_schedule.precision, 'date');
  }
  assert.equal(stories.some(group => archivedIds.includes(group.event.id)), false);
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
  const miniorIds = ['2026-10-minior-orionids', '2026-11-minior-leonids', '2026-12-minior-geminids', '2027-05-minior-eta-aquariids', '2027-07-minior-southern-delta-aquariids', '2027-08-minior-perseids'];
  const minior = miniorIds.map(byId);
  assert.ok(minior.every(Boolean));
  const leonids = byId('2026-11-minior-leonids');
  const textNotes = leonids.notes.join(' ');
  assert.match(leonids.summary, /Poeira Estelar/i);
  assert.match(leonids.news.summary, /sem quantidade divulgada/i);
  assert.match(textNotes, /estrelas cadentes/i);
  assert.match(textNotes, /GO Wild Area Global/i);
  assert.match(textNotes, /50% ou menos/i);
  assert.match(textNotes, /Vermelho, Laranja, Amarelo, Verde, Azul, Anil e Violeta/i);
  assert.match(textNotes, /Hemisfério Norte e outra no Hemisfério Sul/i);
  assert.equal(leonids.audit.language_differences.form_change_threshold.pt_BR, '50% ou menos');
  assert.equal(leonids.audit.language_differences.form_change_threshold.en, 'below 50%');
  assert.equal(leonids.audit.language_differences.overlap_availability.pt_BR, 'não aparecerá');
  assert.equal(leonids.audit.language_differences.overlap_availability.en, 'may not appear');
  assert.match(textNotes, /LAIC 2027/i);
  assert.equal(leonids.audit.community_cross_reference.source_id, 'g47ix-2120984983892586580');
  const group = stories.find(item => item.events.some(event => event.id === '2026-11-minior-leonids'));
  assert.ok(group);
  assert.equal(group.events.length, 5, 'a janela encerrada de Orionidas não deve aparecer; as três próximas janelas anuais devem permanecer agrupadas');
  assert.ok(!group.events.some(event => event.id === '2026-10-minior-orionids'));
  const expectedFuture = [
    ['2027-05-minior-eta-aquariids', '2027-05-03T17:00:00-03:00', '2027-05-08T23:59:59-03:00'],
    ['2027-07-minior-southern-delta-aquariids', '2027-07-28T17:00:00-03:00', '2027-08-02T23:59:59-03:00'],
    ['2027-08-minior-perseids', '2027-08-10T17:00:00-03:00', '2027-08-15T23:59:59-03:00']
  ];
  for (const [id, start, end] of expectedFuture) {
    const event = byId(id);
    assert.ok(event);
    assert.equal(event.schedule.start_local, start);
    assert.equal(event.schedule.end_local, end);
    assert.equal(event.schedule.local_timezone, 'America/Sao_Paulo');
    assert.equal(event.calendar.mode, 'span');
    assert.equal(event.source.confidence, 'official');
    assert.equal(event.audit.annual_window_source, true);
    assert.equal(event.audit.next_occurrence_year, 2027);
    assert.equal(event.presentation.requires_art, false);
    assert.equal(event.gpx.enabled, false);
  }
  assert.equal(group.title, leonids.news.title);
});

test('G47IX Minior foi curado sem arte, sem nova história e com histórico preservado', () => {
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'queue/pending/2026-11-13/g47ix-evento-ad22b131ff54.json'), 'utf8'));
  const curated = JSON.parse(fs.readFileSync(path.join(root, 'queue/curated/g47ix-evento-ad22b131ff54.json'), 'utf8'));
  assert.equal(raw.original_status, raw.main_reconciliation.observed_main_status);
  assert.equal(raw.original_etapa_editorial, raw.main_reconciliation.observed_main_stage);
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


test('Minior 2027 respeita o último segundo local e sai da superfície após o encerramento', () => {
  const id = '2027-05-minior-eta-aquariids';
  const atEnd = sandbox.window.SpideyNews.build(events, range, new Date('2027-05-08T23:59:59-03:00'));
  const after = sandbox.window.SpideyNews.build(events, range, new Date('2027-05-09T00:00:00-03:00'));
  const key = 'official:/news/minior-meteor-showers-2026';
  const atEndGroup = atEnd.find(item => item.key === key);
  const afterGroup = after.find(item => item.key === key);
  assert.ok(atEndGroup?.events.some(event => event.id === id));
  assert.ok(!afterGroup?.events.some(event => event.id === id));
});
