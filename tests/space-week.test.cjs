const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');

function setup() {
  const context = vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},Intl,Date});
  vm.runInContext(fs.readFileSync('spidey-app/space-week.js','utf8'),context);
  return context.window.SpideySpace;
}

test('museum clocks follow European daylight saving while Brasília keeps its own date and clock',()=> {
  const space = setup();
  assert.equal(space.clock('Europe/London',new Date('2026-10-24T12:00:00Z')),'24/10, 13:00');
  assert.equal(space.clock('Europe/London',new Date('2026-10-25T12:00:00Z')),'25/10, 12:00');
  assert.equal(space.clock('America/Sao_Paulo',new Date('2026-10-25T12:00:00Z')),'25/10, 09:00');
  assert.equal(space.clock('Europe/Paris',new Date('2026-10-25T02:00:00Z')),'25/10, 03:00');
  assert.equal(space.clock('America/Sao_Paulo',new Date('2026-10-25T02:00:00Z')),'24/10, 23:00');
});

test('museum maps use verified venue coordinates or an address without inventing coordinates or precision',()=> {
  const space = setup();
  const data = JSON.parse(fs.readFileSync('spidey-app/data/space-museums.json','utf8'));
  const euro = data.museums.find(venue=>venue.id==='euro-space-center-transinne');
  const london = data.museums.find(venue=>venue.id==='science-museum-london');
  assert.equal(new URL(space.mapUrl(euro)).searchParams.get('query'),'50.007,5.22');
  assert.equal(new URL(space.mapUrl(london)).searchParams.get('query'),'Science Museum, Exhibition Road, South Kensington, London SW7 2DD, Londres, Reino Unido');
  const html = space.museumRows(data,new Date('2026-10-04T12:00:00Z'));
  assert.equal((html.match(/data-space-copy-kind="coordinate"/g)||[]).length,4);
  assert.equal((html.match(/data-space-copy-kind="address"/g)||[]).length,2);
  assert.equal((html.match(/>Abrir mapa</g)||[]).length,6);
  assert.ok(!/href="[^"]*\.gpx/.test(html));
  assert.ok(!html.includes('50.007000'));
});

test('museum content escapes text and copy values so a venue name cannot inject controls',()=> {
  const space = setup();
  const venue = {id:'test',name:'<img src=x onerror=alert(1)>',city:'City',country:'Country',address:'" data-open-space-museums="injected',timezone:'Europe/London',coordinate:null,source:{url:'https://example.com'}};
  const html = space.museumRows({museums:[venue]},new Date('2026-10-04T12:00:00Z'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('data-open-space-museums="injected'));
});

test('museum field tasks remain specific to the Valencia report and never infer species from wild spawns',()=> {
  const space = setup();
  const data = JSON.parse(fs.readFileSync('spidey-app/data/space-museums.json','utf8'));
  const valencia = data.museums.find(venue=>venue.id==='museu-ciencies-valencia');
  const html = space.researchSection(valencia,data);
  assert.equal(valencia.research.report.confidence,'community_firsthand');
  assert.equal(valencia.research.field_tasks.length,3);
  assert.ok(html.includes('Relato de jogadores · Valência'));
  assert.ok(html.includes('Espécies por tarefa ainda não confirmadas'));
  assert.ok(html.includes('não se estende aos demais museus'));
  for (const task of valencia.research.field_tasks) {
    assert.equal(task.reward.species,null);
    assert.equal(task.reward.background,'reported_guaranteed_not_officially_verified');
  }
  for (const venue of data.museums.filter(venue=>venue!==valencia)) {
    assert.equal(venue.research.field_tasks.length,0);
    const other = space.researchSection(venue,data);
    assert.ok(other.includes('A confirmar'));
    assert.ok(!other.includes('Girar 10 Poképaradas'));
    assert.ok(!other.includes('relatadas'));
  }
});

test('each city displays its own original background bytes without promoting them to Premium art',()=> {
  const space = setup();
  const data = JSON.parse(fs.readFileSync('spidey-app/data/space-museums.json','utf8'));
  assert.equal(new Set(data.museums.map(venue=>venue.location_background.file)).size,6);
  for (const venue of data.museums) {
    const media = venue.location_background;
    assert.equal(media.classification,'datamined_game_asset');
    assert.equal(media.width,512);
    assert.equal(media.height,512);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`spidey-app/${media.file}`)).digest('hex'),media.sha256);
    const html = space.museumRows({...data,museums:[venue]},new Date('2026-10-04T12:00:00Z'));
    assert.ok(html.includes(media.file));
    assert.ok(html.includes(`Fundo de Localização · ${venue.city}`));
  }
});

test('unverified event boundaries cannot expose a downloadable route or claim complete area coverage',()=> {
  const space = setup();
  const data = JSON.parse(fs.readFileSync('spidey-app/data/space-museums.json','utf8'));
  assert.equal(data.gpx.enabled,false);
  for (const venue of data.museums) {
    assert.equal(venue.gpx.status,'event_area_unverified');
    assert.equal(venue.gpx.coverage_polygon,null);
    assert.deepEqual(venue.gpx.route_points,[]);
  }
  const html = space.museumRows(data);
  assert.equal((html.match(/GPX da área:/g)||[]).length,6);
  assert.ok(!/download|href="[^"]*\.gpx/.test(html));
});
