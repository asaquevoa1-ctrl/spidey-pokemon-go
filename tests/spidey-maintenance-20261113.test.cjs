'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = path => fs.readFileSync(path, 'utf8');
const events = JSON.parse(read('spidey-app/data/events.json')).events;
const normalize = value => String(value || '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim();

test('Novidades não repete manchetes e o destaque não reaparece como cartão', () => {
  const sandbox = { window: {}, URL, Date, Map, Set, Object };
  vm.runInNewContext(read('spidey-app/news-feed.js'), sandbox, { filename: 'news-feed.js' });
  const range = event => {
    const schedule = event.schedule || {};
    const start = Date.parse(schedule.start_brazil || schedule.start_local || schedule.start_date || '');
    const end = Date.parse(schedule.end_brazil || schedule.end_local || schedule.end_date || '');
    return {
      start: Number.isFinite(start) ? new Date(start) : null,
      end: Number.isFinite(end) ? new Date(end) : null
    };
  };
  const groups = sandbox.window.SpideyNews.build(events, range, new Date());
  assert.ok(groups.length > 0);
  const titles = groups.map(group => normalize(group.title || group.event.title));
  assert.equal(new Set(titles).size, titles.length, 'Novidades contém manchetes duplicadas');
  const keys = groups.map(group => group.key);
  assert.equal(new Set(keys).size, keys.length, 'Um mesmo anúncio foi renderizado em mais de um grupo');

  const premium = read('spidey-app/news-premium-20261102.js');
  assert.match(premium, /target\.innerHTML=filtered\.length\?filtered\.map\(article\)\.join\(''\)/);
  assert.match(premium, /visibleGroups=hero\.innerHTML \? groups\.filter\(g=>g\.event\?\.id!==WILD_ID\)/);
});

test('Sendai e México integram as referências de 7 pontos ao detalhe oficial sem uma segunda galeria', () => {
  const stamps = JSON.parse(read('spidey-app/data/stamps.json')).rallies;
  const official = stamps.filter(item => [
    '2026-go-wild-area-sendai-stamp-rally',
    '2026-go-wild-area-mexico-city-stamp-rally'
  ].includes(item.id));
  assert.equal(official.length, 2);
  for (const rally of official) {
    assert.equal(rally.stops.length, 7, rally.id);
    assert.equal(rally.ticket_required, true, rally.id);
    assert.ok(rally.stops.every(stop => stop.latitude === null && stop.longitude === null
      && stop.gpx_enabled === false), rally.id);
  }

  const community = JSON.parse(read('spidey-app/data/ticket-rally-community-20261107.json'));
  assert.equal(community.ticket_required, true);
  assert.equal(community.exact_pokestops_verified, false);
  assert.equal(community.gpx_enabled, false);
  assert.equal(community.routes.length, 2);
  for (const route of community.routes) {
    assert.equal(route.coords.length, 7, route.id);
    assert.ok(route.coords.every(value => {
      if (!/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(value)) return false;
      const [lat, lon] = value.split(',').map(Number);
      return Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
    }), route.id);
  }

  const ticketModule = read('spidey-app/ticket-rally-community-20261107.js');
  const stampsModule = read('spidey-app/stamps-v2.js');
  assert.match(ticketModule, /window\.SpideyTicketRallyCommunity = Object\.freeze\(\{ render \}\)/);
  assert.match(ticketModule, /não é uma segunda coleção/);
  assert.match(ticketModule, /não têm correspondência individual confirmada/);
  assert.doesNotMatch(ticketModule, /ticketRalliesCommunity|view\.append\(root\)|stamp-community-grid/);
  assert.match(stampsModule, /window\.SpideyTicketRallyCommunity\?\.render\(detail, rally\)/);

  const permanent = JSON.parse(read('spidey-app/data/community-routes-20261102.json'));
  assert.equal(permanent.routes.length, 2);
  assert.deepEqual(permanent.routes.map(route => [route.id, route.points.length]).sort(), [
    ['hawlucha-mexico-city', 8], ['lapras-sendai-tohoku', 8]
  ]);
  const permanentModule = read('spidey-app/stamps-community-routes-20261102.js');
  for (const file of [
    'assets/events/premium/wild-area-mexico-city-2026-approved-v1.png',
    'assets/events/premium/wild-area-sendai-2026-approved-v1.png'
  ]) {
    assert.ok(permanentModule.includes(file), file);
    assert.ok(fs.existsSync('spidey-app/' + file), file);
  }
  const html = read('spidey-app/index.html');
  assert.equal((html.match(/stamps-v2\.js/g) || []).length, 1);
  assert.equal((html.match(/ticket-rally-community-20261107\.js/g) || []).length, 1);
  const css = read('spidey-app/stamps-community-routes-20261102.css');
  assert.match(css, /\.ticket-rally-inline/);
  const sw = read('spidey-app/sw.js');
  assert.ok(sw.includes('./ticket-rally-community-20261107.js'));
  assert.ok(sw.includes('./data/ticket-rally-community-20261107.json'));
});

test('FLY Teddiursa 05/11 calcula 64 referências e 18h–19h no fuso IANA de cada cidade', () => {
  const event = events.find(item => item.id === '2026-11-05-spotlight-teddiursa');
  assert.ok(event);
  assert.equal(event.schedule.start_local, '2026-11-05T18:00:00-03:00');
  assert.equal(event.schedule.end_local, '2026-11-05T19:00:00-03:00');
  assert.equal(event.fly_world_route.enabled, true);
  assert.equal(event.fly_world_route.scope, 'worldwide_local_time');
  assert.equal(event.fly_world_route.coordinates, 'city_references');
  assert.equal(event.fly_world_route.timezone_conversion, 'America/Sao_Paulo');
  assert.equal(event.gpx.enabled, false);
  assert.equal(event.locations.length, 0);

  const source = JSON.parse(read('spidey-app/data/world-event-points.json'));
  const points = source.points.filter(point => point.current_user_list_20261031 === true);
  assert.equal(points.length, 64);
  assert.ok(points.every(point => point.coordinate_type === 'city_reference'
    && Number.isFinite(point.lat) && Number.isFinite(point.lon)
    && Math.abs(point.lat) <= 90 && Math.abs(point.lon) <= 180
    && typeof point.timezone === 'string'));

  const sandbox = { window: {}, Intl, Date, Math, Object, Set, fetch: () => {
    throw new Error('FLY QA não deve buscar rede');
  }};
  vm.runInNewContext(read('spidey-app/fly-core.js'), sandbox, { filename: 'fly-core.js' });
  const core = sandbox.window.SpideyFlyCore;
  assert.equal(core.eligible(event), true);
  const route = core.route(event, points, new Date('2026-11-05T12:00:00-03:00'));
  assert.equal(route.length, 64);
  for (const point of route) {
    const local = new Intl.DateTimeFormat('en-GB', {
      timeZone: point.timezone, day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
    assert.equal(local.format(point.start), '05/11/2026, 18:00', point.name);
    assert.equal(local.format(point.end), '05/11/2026, 19:00', point.name);
    assert.ok(Number.isFinite(point.lat) && Number.isFinite(point.lon), point.name);
  }
  const brasilia = point => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(point.start);
  assert.equal(brasilia(route.find(point => point.timezone === 'Pacific/Kiritimati')), '05/11, 01:00');
  assert.equal(brasilia(route.find(point => point.timezone === 'Asia/Tokyo')), '05/11, 06:00');
  assert.equal(brasilia(route.find(point => point.timezone === 'Europe/London')), '05/11, 15:00');
  assert.equal(brasilia(route.find(point => point.timezone === 'America/Sao_Paulo')), '05/11, 18:00');
  assert.equal(brasilia(route.find(point => point.timezone === 'America/Los_Angeles')), '05/11, 23:00');
  assert.match(read('spidey-app/fly-v1.js'), /FEATURED_SPOTLIGHT_ID='2026-11-05-spotlight-teddiursa'/);
});

test('autopublicação aciona o único GitHub Pages oficial somente depois de gravar conteúdo', () => {
  const auto = read('.github/workflows/spidey-app-auto-publish.yml');
  const pages = read('.github/workflows/spidey-pages.yml');
  const legacy = read('.github/workflows/spidey-pages-publish.yml');
  assert.match(auto, /permissions:\s*\n\s*contents:\s*write\s*\n\s*actions:\s*write/m);
  assert.match(auto, /GH_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/);
  assert.match(auto, /GH_REPO:\s*\$\{\{\s*github\.repository\s*\}\}/);
  const push = auto.indexOf('git push origin HEAD:main');
  const dispatch = auto.indexOf('gh workflow run spidey-pages.yml --ref main --repo "$GH_REPO"');
  assert.ok(push >= 0 && dispatch > push, 'Deploy precisa ocorrer depois do commit público');
  assert.ok(auto.includes('node --test tests/spidey-maintenance-20261113.test.cjs tests/fly-user-list-20261031.test.cjs'));
  assert.match(pages, /workflow_dispatch:/);
  assert.match(pages, /actions\/deploy-pages@v4/);
  assert.match(legacy, /legado desativado/i);
  assert.match(legacy, /if:\s*\$\{\{\s*false\s*\}\}/);
});
