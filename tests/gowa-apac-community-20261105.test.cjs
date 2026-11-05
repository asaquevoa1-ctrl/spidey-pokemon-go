const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const locals = JSON.parse(fs.readFileSync('spidey-app/data/local-events.json', 'utf8')).events;
const pending = JSON.parse(fs.readFileSync('queue/pending/2026-11-05/get-ready-for-pokemon-go-wild-area-2026-global-community-meetups-in-th-f875d4c5fbc2.json', 'utf8'));

function setupWorld() {
  const window = { addEventListener() {} };
  const context = vm.createContext({
    window, Date, Intl, URL, Map, Set, Object, Math,
    document: { readyState: 'loading', addEventListener() {}, querySelectorAll() { return []; } },
  });
  for (const name of ['date-only.js', 'fly-core.js', 'trust-world-v1.js']) {
    vm.runInContext(fs.readFileSync(`spidey-app/${name}`, 'utf8'), context);
  }
  return window.SpideyWorld;
}

test('Asia-Pacific meetups are consolidated into the existing global story', () => {
  const global = events.find((event) => event.id === '2026-11-go-wild-area-global');
  assert.ok(global);
  assert.equal(global.asia_pacific_community_program.official_article, 'https://pokemongo.com/news/community-meetups-go-wild-area-2026-details-asia-pacific');
  assert.equal(global.asia_pacific_community_program.venue_count, 12);
  assert.equal(global.asia_pacific_community_program.community_count, 11);
  assert.equal(global.asia_pacific_community_program.meetups.length, 12);
  assert.match(global.news.title, /Ásia-Pacífico/);
  assert.equal(events.filter((event) => event.id === '2026-11-go-wild-area-global').length, 1);
});

test('all 12 official venues preserve both daily local windows and valid IANA zones', () => {
  const apac = locals.filter((event) => event.id.startsWith('2026-11-go-wild-area-global-apac-'));
  assert.equal(apac.length, 12);
  assert.deepEqual(apac.map((event) => event.locations[0].name), [
    'Time Villas Suwon',
    'Pokémon GO Booth · entrada sul, 1º andar, Shin Kong Mitsukoshi Taipei Xinyi Place A11',
    'Festival Walk Shopping Mall',
    'Freedom Park',
    'City Center 1, Salt Lake',
    'Carter Road, Bandra West',
    'Westfield Fountain Gate',
    'Agora Mall · átrio L2',
    'Taman Ismail Marzuki Promenade',
    'Chamchuri Square',
    'Ombak KLCC',
    'Amphitheatre, MOA Sky, Mall of Asia',
  ]);
  for (const event of apac) {
    assert.equal(event.schedule.start_date, '2026-11-14');
    assert.equal(event.schedule.end_date, '2026-11-15');
    assert.equal(event.schedule.recurrence, 'daily');
    assert.doesNotThrow(() => new Intl.DateTimeFormat('pt-BR', { timeZone: event.schedule.timezone }).format(new Date('2026-11-14T12:00:00Z')));
    assert.equal(event.gpx.enabled, false);
    assert.equal(event.locations[0].exact_pokestop_verified, false);
    assert.equal(event.locations[0].exact_raid_gym_verified, false);
    assert.equal(event.locations[0].exact_power_spot_verified, false);
    assert.equal(event.audit.related_event_id, '2026-11-go-wild-area-global');
  }
});

test('representative end boundaries preserve the announced local day and offsets', () => {
  assert.equal(new Date('2026-11-15T18:00:00+09:00').toISOString(), '2026-11-15T09:00:00.000Z');
  assert.equal(new Date('2026-11-15T17:00:00+11:00').toISOString(), '2026-11-15T06:00:00.000Z');
  assert.equal(new Date('2026-11-15T18:00:00+08:00').toISOString(), '2026-11-15T10:00:00.000Z');
  for (const suffix of ['suwon-time-villas', 'melbourne-westfield-fountain-gate', 'pasay-city-moa-sky']) {
    const event = locals.find((item) => item.id.endsWith(suffix));
    assert.ok(event);
    assert.equal(event.audit.distinct_local_window_preserved, true);
    assert.equal(event.schedule.end_date, '2026-11-15');
  }
});

test('local cards retire exactly when each final APAC venue window closes', () => {
  const world = setupWorld();
  const cases = [
    ['suwon-time-villas', '2026-11-15T08:59:59.999Z', '2026-11-15T09:00:00.000Z'],
    ['melbourne-westfield-fountain-gate', '2026-11-15T05:59:59.999Z', '2026-11-15T06:00:00.000Z'],
    ['taipei-shin-kong-mitsukoshi-a11', '2026-11-15T13:59:59.999Z', '2026-11-15T14:00:00.000Z'],
  ];
  for (const [suffix, before, at] of cases) {
    const event = locals.find((item) => item.id.endsWith(suffix));
    assert.equal(world.visible(event, new Date(before)), true, suffix);
    assert.equal(world.visible(event, new Date(at)), false, suffix);
  }
});

test('collector item is curated without inventing research rewards or requiring new art', () => {
  assert.equal(pending.status, 'curated');
  assert.equal(pending.etapa_editorial, 'curadoria_editorial_concluida');
  assert.equal(pending.arte_obrigatoria, false);
  assert.equal(pending.gerar_gpx, false);
  const global = events.find((event) => event.id === '2026-11-go-wild-area-global');
  const copy = JSON.stringify(global.asia_pacific_community_program);
  assert.match(copy, /encontro com Pokémon/);
  assert.doesNotMatch(copy, /Pikachu|Brilhante|Poké Bola|Doce|Poeira Estelar/);
});
