const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const appSource = fs.readFileSync('spidey-app/app.js', 'utf8');
const preamble = appSource.slice(0, appSource.indexOf('function generatedEventArtUrl'));
const calendarSource = fs.readFileSync('spidey-app/calendar-enhancements.js', 'utf8');
const calendarRules = calendarSource.slice(0, calendarSource.indexOf('  const baseRenderEvents')) + '})();';
const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
const zones = ['UTC', 'America/Sao_Paulo', 'Asia/Taipei', 'America/Los_Angeles'];

function withDeviceZones(check) {
  const original = process.env.TZ;
  try {
    for (const zone of zones) {
      process.env.TZ = zone;
      const sandbox = vm.createContext({ Date, Intl, document: { querySelector: () => null }, events });
      vm.runInContext(preamble + calendarRules, sandbox);
      check(sandbox, zone);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
}

test('October 1 agenda stays in Brasília and excludes all three October 2 events on any device', () => {
  withDeviceZones((sandbox, zone) => {
    const ids = vm.runInContext(`events.filter(e => overlapsDay(e, new Date(2026, 9, 1))).map(e => e.id).sort()`, sandbox);
    assert.deepEqual(Array.from(ids), [
      '2026-09-harvest-festival-applin',
      '2026-09-iit-delhi-rendezvous',
      '2026-09-tcg-30th-us-retail',
      '2026-10-01-go-battle-thursday',
      '2026-10-01-spotlight-seedot',
    ], zone);
    const second = vm.runInContext(`events.filter(e => overlapsDay(e, new Date(2026, 9, 2))).map(e => e.id)`, sandbox);
    for (const id of ['2026-10-harvest-taken-over', '2026-10-patterns-of-the-wild-indonesia', '2026-10-02-friendship-friday']) {
      assert.ok(second.includes(id), `${zone}: ${id}`);
    }
  });
});

test('Brasília midnight, start-only events, hidden events and invalid schedules keep their day rules', () => {
  withDeviceZones((sandbox, zone) => {
    sandbox.event = { schedule: { start_brazil: '2026-10-02T03:00:00Z', end_brazil: '2026-10-03T02:59:59Z' } };
    assert.equal(vm.runInContext('overlapsDay(event, new Date(2026, 9, 1))', sandbox), false, zone);
    assert.equal(vm.runInContext('overlapsDay(event, new Date(2026, 9, 2))', sandbox), true, zone);
    assert.equal(vm.runInContext('overlapsDay(event, new Date(2026, 9, 3))', sandbox), false, zone);
    sandbox.event.calendar = { mode: 'start' };
    sandbox.event.schedule.end_brazil = '2026-10-05T03:00:00Z';
    assert.equal(vm.runInContext('overlapsDay(event, new Date(2026, 9, 2))', sandbox), true, zone);
    assert.equal(vm.runInContext('overlapsDay(event, new Date(2026, 9, 3))', sandbox), false, zone);
    sandbox.event.calendar.mode = 'hidden';
    assert.equal(vm.runInContext('overlapsDay(event, new Date(2026, 9, 2))', sandbox), false, zone);
    sandbox.event = { schedule: { start_brazil: 'invalid', end_brazil: '2026-10-05T03:00:00Z' } };
    assert.equal(vm.runInContext('overlapsDay(event, new Date(2026, 9, 2))', sandbox), false, zone);
  });
});

test('today uses Brasília at a month or year boundary regardless of the device clock zone', () => {
  withDeviceZones((sandbox, zone) => {
    for (const [instant, day] of [
      ['2026-10-01T02:59:59Z', '2026-09-30'],
      ['2026-10-01T03:00:00Z', '2026-10-01'],
      ['2027-01-01T01:00:00Z', '2026-12-31'],
    ]) {
      sandbox.instant = instant;
      assert.equal(vm.runInContext('calendarDateKey(calendarToday(new Date(instant)))', sandbox), day, zone);
    }
  });
});

test('official October updates keep their confirmed Brasília windows and unrevealed boss empty', () => {
  const byId = id => events.find(event => event.id === id);
  const nightOut = byId('2026-10-pokemon-night-out-twitch');
  const boston = byId('2026-10-city-safari-boston-rescheduled');
  const unrevealed = byId('2026-10-super-mega-raid-day');
  assert.equal(nightOut.schedule.start_local, '2026-10-24T19:30:00-07:00');
  assert.equal(nightOut.schedule.start_brazil, '2026-10-24T23:30:00-03:00');
  assert.equal(nightOut.calendar.mode, 'start');
  assert.equal(boston.schedule.start_brazil, '2026-10-24T10:00:00-03:00');
  assert.equal(boston.schedule.end_brazil, '2026-10-25T18:00:00-03:00');
  assert.match(boston.summary, /exclusiva para quem já possui ingresso/i);
  assert.equal(unrevealed.pokemon?.length || 0, 0);
  assert.equal(unrevealed.bonuses?.length || 0, 0);
});
