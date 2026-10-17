const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const event = JSON.parse(fs.readFileSync('tests/fixtures/nfl-retired-20261011.json', 'utf8')).event;
function setup() {
  const window = {addEventListener() {}, SPIDEY_APPROVED_ART_MASTER: {}, SPIDEY_PREVIEW_ART: {}};
  const context = vm.createContext({window, URL, Date, Intl, Set, Object, Math,
    document: {readyState: 'loading', addEventListener() {}, querySelector: () => null},
    state: {events: [event]}, brazilDateKey: now => new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Sao_Paulo'}).format(now),
    spideyCategoryLabel: () => 'Evento local', formatRange: () => 'Horário a confirmar',
    getBrazilRange: e => window.SpideyDateOnly.bounds(e),
  });
  for (const file of ['date-only.js', 'fly-core.js', 'trust-world-v1.js', 'preview-art.js', 'player-ui.js', 'weekly.js']) {
    vm.runInContext(fs.readFileSync(`spidey-app/${file}`, 'utf8'), context);
  }
  const resolver = fs.readFileSync('spidey-app/art-system.js', 'utf8');
  vm.runInContext(resolver.slice(0, resolver.indexOf('const spideyBaseRenderEvents')), context);
  return {window, context};
}

test('a confirmed calendar date never invents activity hours or a worldwide FLY window', () => {
  const {window} = setup();
  assert.ok(event);
  assert.equal(window.SpideyDateOnly.valid(event), true);
  for (const name of ['start_local', 'end_local', 'start_brazil', 'end_brazil']) assert.equal(event.schedule[name], undefined);
  assert.equal(event.schedule.game_start_brazil, '2026-10-11T17:25:00-03:00');
  assert.equal(event.notifications.enabled, false);
  assert.equal(event.gpx.enabled, false);
  assert.equal(window.SpideyFlyCore.eligible(event), false);
  const period = window.SpideyWorld.eventWindow(event, new Date('2026-10-11T20:25:00Z'));
  assert.equal(period.dateOnly, true);
  assert.equal(period.start, undefined);
  assert.match(period.status, /HORÁRIO A CONFIRMAR/);
  assert.match(window.SpideyPlayer.time(event), /11\/10\/2026.*horário do evento a confirmar/);
});

test('today follows Arizona through Brazilian midnight and ends only when the local date ends', () => {
  const {window} = setup(), helper = window.SpideyDateOnly;
  assert.match(helper.status(event, new Date('2026-10-11T06:59:59Z')), /^Data confirmada/);
  assert.match(helper.status(event, new Date('2026-10-11T07:00:00Z')), /^Hoje/);
  assert.match(helper.status(event, new Date('2026-10-12T06:59:59Z')), /^Hoje/);
  assert.equal(helper.status(event, new Date('2026-10-12T07:00:00Z')), 'Data encerrada');
  const today = window.SpideyPlayer.homeSelection([event], [], new Date('2026-10-12T03:30:00Z'));
  assert.equal(today.dated.length, 1);
  assert.equal(today.active.length, 0);
  assert.equal(today.upcoming.length, 0);
  assert.equal(today.focus, undefined);
  const before = window.SpideyPlayer.homeSelection([event], [], new Date('2026-10-10T19:00:00Z'));
  assert.equal(before.dated.length, 0);
  assert.equal(before.upcoming.length, 1);
  const after = window.SpideyPlayer.homeSelection([event], [], new Date('2026-10-12T07:00:00Z'));
  assert.equal(after.dated.length + after.active.length + after.upcoming.length, 0);
});

test('the weekly card keeps a date and unknown hours, without midnight or kickoff masquerading as the activity time', () => {
  const {context} = setup();
  const html = context.weeklyItemCard({id: event.id, title: event.title});
  assert.match(html, /11\/10\/2026.*horário do evento a confirmar/);
  assert.match(html, /Horário a confirmar/);
  assert.ok(!html.includes('00:00') && !html.includes('17:25'));
});

test('malformed dates, missing timezone and reversed spans stay unconfirmed', () => {
  const {window} = setup();
  for (const schedule of [
    {...event.schedule, local_timezone: undefined},
    {...event.schedule, local_timezone: 'invalid/zone'},
    {...event.schedule, start_date: '2026-02-30'},
    {...event.schedule, end_date: '2026-10-10'},
  ]) assert.equal(window.SpideyDateOnly.valid({...event, schedule}), false);
});
