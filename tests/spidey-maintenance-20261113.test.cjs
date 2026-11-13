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
    assert.ok(rally.stops.every(stop => stop.exact_pokestop_verified === false
      && stop.gpx_enabled === false), rally.id);
    if (rally.id.includes('sendai')) {
      assert.ok(rally.stops.every(stop => stop.latitude === null && stop.longitude === null
        && stop.coordinate_type === 'official_venue_without_coordinates'), rally.id);
    } else {
      assert.ok(rally.stops.every(stop => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude)
        && stop.coordinate_type === 'venue_reference' && stop.reference_only_copyable === true), rally.id);
    }
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

  const ticketMexico = community.routes.find(route => route.id === 'mexico');
  const officialMexico = official.find(rally => rally.id.includes('mexico'));
  const officialMexicoRefs = new Set(officialMexico.stops.map(stop => `${stop.latitude},${stop.longitude}`));
  assert.ok(ticketMexico.coords.every(point => !officialMexicoRefs.has(point)),
    'A lista comunitária não pode ser apresentada como pareamento das referências oficiais do México');

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
  const flyUi = read('spidey-app/fly-v1.js');
  assert.match(flyUi, /FEATURED_SPOTLIGHT_ID='2026-11-05-spotlight-teddiursa'/);
  assert.match(flyUi, /selected=FEATURED_SPOTLIGHT_ID/);
  assert.match(flyUi, /data-fly-featured-spotlight/);
  assert.doesNotMatch(flyUi, /MORELULL_ID|flyMorelullSpotlight|data-fly-morespotlight/);
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
  assert.ok(auto.includes('node --test tests/spidey-maintenance-20261113.test.cjs tests/fly-user-list-20261031.test.cjs tests/mexico-wild-area-stamps-georeference-20261027.test.cjs tests/go-wild-area-stamp-rallies-20261028.test.cjs tests/stamps-community-routes-20261102.test.cjs tests/world-route-news-regression-20261109.test.cjs'));
  assert.match(pages, /workflow_dispatch:/);
  assert.match(pages, /actions\/deploy-pages@v5/);
  for (const path of ['fly-v1.js','fly-core.js','data/world-event-points.json','stamps-community-routes-20261102.js','data/community-routes-20261102.json','assets/events/premium/wild-area-sendai-2026-approved-v1.png','assets/events/premium/wild-area-mexico-city-2026-approved-v1.png']) {
    assert.ok(pages.includes(`'${path}'`), `HTTP verification must cover ${path}`);
  }
  assert.match(legacy, /legado desativado/i);
  assert.match(legacy, /if:\s*\$\{\{\s*false\s*\}\}/);
});



test('publicador oficial usa releases Node 24 e evita actions com runtime Node 20', () => {
  const pages = read('.github/workflows/spidey-pages.yml');
  assert.equal((pages.match(/uses:\s*actions\/setup-python@v6/g) || []).length, 2);
  assert.equal((pages.match(/uses:\s*actions\/setup-node@v5/g) || []).length, 2);
  assert.match(pages, /uses:\s*actions\/upload-pages-artifact@v5\b/);
  assert.match(pages, /uses:\s*actions\/configure-pages@v6\b/);
  assert.match(pages, /uses:\s*actions\/deploy-pages@v5\b/);
  assert.doesNotMatch(pages, /actions\/(?:setup-python@v5|setup-node@v4|upload-pages-artifact@v3|configure-pages@v5|deploy-pages@v4)\b/);
});

test('atualização PvPoke dispara o publicador oficial somente após gravar dados novos', () => {
  const pvpoke = read('.github/workflows/spidey-pvpoke.yml');
  assert.match(pvpoke, /permissions:\s*\n\s*contents:\s*write\s*\n\s*actions:\s*write/m);
  assert.match(pvpoke, /actions\/setup-python@v6/);
  assert.match(pvpoke, /GH_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/);
  assert.match(pvpoke, /GH_REPOSITORY:\s*\$\{\{\s*github\.repository\s*\}\}/);
  const noChange = pvpoke.indexOf('if git diff --cached --quiet; then');
  const push = pvpoke.indexOf('git push origin HEAD:main');
  const dispatch = pvpoke.indexOf('gh api -X POST "repos/${GH_REPOSITORY}/actions/workflows/spidey-pages.yml/dispatches" -f ref=main');
  assert.ok(noChange >= 0 && push > noChange && dispatch > push,
    'O Pages só pode ser acionado depois de um commit PvP novo e do push para main');
});

test('GitHub Pages é a única hospedagem automática e os workflows ativos usam actions compatíveis com Node 24', () => {
  const vercel = JSON.parse(read('vercel.json'));
  assert.equal(vercel.git?.deploymentEnabled, false, 'Vercel não pode voltar a publicar automaticamente pelo Git');
  const health = read('.github/workflows/spidey-app-health.yml');
  assert.match(health, /actions\/setup-python@v6/);
  assert.match(health, /actions\/upload-artifact@v7/);
  assert.doesNotMatch(health, /actions\/(?:setup-python@v5|upload-artifact@v4|upload-artifact@v5)\b/);
  const governance = read('.github/workflows/spidey-governance.yml');
  assert.match(governance, /actions\/setup-node@v5/);
  assert.doesNotMatch(governance, /actions\/setup-node@v4\b/);
});

test('GitHub Pages executa o monitor sintético depois da validação HTTP e arquiva o relatório', () => {
  const workflow = read('.github/workflows/spidey-pages.yml');
  const deploy = workflow.split('  deploy:\\n')[1] || '';
  const images = deploy.indexOf('Confirmar no endereço público as 5 imagens oficiais da Wild Area');
  const health = deploy.indexOf('Executar monitor sintético completo após publicação');
  const artifact = deploy.indexOf('Guardar relatório de saúde da versão publicada');
  assert.ok(images >= 0 && health > images && artifact > health,
    'O monitor precisa rodar depois das verificações públicas de imagens');
  assert.match(deploy, /python scripts\\/check_app_health\\.py --hosting github-pages --base-url/);
  assert.match(deploy, /uses: actions\\/upload-artifact@v7/);
  assert.match(workflow, /python -m unittest scripts\\.test_app_health -v/);
});
