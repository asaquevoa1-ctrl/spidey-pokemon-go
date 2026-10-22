'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const base='spidey-app/';
const read=p=>fs.readFileSync(base+p,'utf8');
const doc=JSON.parse(read('data/world-event-points.json'));
const points=doc.points;
const sandbox={window:{},Date,Intl,Math,Object,Set,Map};
vm.runInNewContext(read('fly-core.js'),sandbox);
const core=sandbox.window.SpideyFlyCore;
const morelull=JSON.parse(read('data/events.json')).events.find(e=>e.id==='2026-10-22-spotlight-morelull');

test('Every coordinate from historic credited 2023 list exists in the live FLY data without same-point duplicates',()=>{
  assert.equal(doc.source_list_2023.original_points_count,67);
  assert.equal(points.filter(p=>p.source_list).length,67);
  assert.ok(points.length>=67);
  assert.equal(new Set(points.map(p=>p.lat.toFixed(6)+','+p.lon.toFixed(6))).size,points.length);
  assert.ok(points.every(p=>p.coordinate_type==='city_reference'));
  for(const p of points){
    assert.ok(Number.isFinite(p.lat)&&Math.abs(p.lat)<=90,p.name);
    assert.ok(Number.isFinite(p.lon)&&Math.abs(p.lon)<=180,p.name);
    assert.doesNotThrow(()=>new Intl.DateTimeFormat('pt-BR',{timeZone:p.timezone}).format(new Date('2026-10-22T12:00Z')),p.name);
  }
  for(const [name,lat,lon] of [
    ['Fagali\'i, Samoa',-13.831357,-171.766401],
    ['Wellington Botanic Garden, Nova Zelândia',-41.2846675,174.7664883],
    ['Ibirapuera, São Paulo',-23.58417130,-46.66072464],
    ['Montevidéu, Uruguai',-34.901112,-56.164532],
    ['Mangareva, Polinésia Francesa',-23.120088,-134.969670],
    ['Midway Island',28.211279,-177.373023]
  ]){
    const p=points.find(p=>p.name===name);
    assert.ok(p,name);
    assert.equal(p.lat,lat,name);
    assert.equal(p.lon,lon,name);
  }
});
test('Original LendáriosBrasil/FlyGPS/PokemonTrail/Fantasma credits are stored unmodified, including historical date',()=>{
  const credits=doc.source_list_2023.credits;
  for(const text of ['👉LendáriosBrasil','👉FlyGPS','👉PokemonTrail',
    '❌NÃO EDITE OU TIRE OS CRÉDITOS❌','✅Lista atualizada em 06/11/2023✅',
    '⚠️REPORTE PUBLICAÇÕES NOSSAS SEM CRÉDITOS OU EM FORMATO DE PLÁGIO⚠️',
    '👻 Fantasma 👻']){
    assert.ok(credits.includes(text),'Missing exact historic credit '+text);
  }
  assert.equal(doc.source_list_2023.original_list_date,'2023-11-10');
  assert.equal(doc.source_list_2023.original_last_updated,'2023-11-06');
  assert.ok(doc.source_list_2023.dates_disclaimer.includes('2023'));
  assert.equal(doc.rules.respect_daylight_saving,true);
  assert.equal(doc.rules.show_portugal_time_comparison,false,'Portugal hours must NEVER be compared');
  assert.equal(doc.rules.keep_portugal_as_geographic_reference,true);
  assert.equal(doc.rules.display_clock_columns.join(','),'horario_local_destino,horario_brasilia');
  assert.ok(doc.source_list_2023.early_project_evidence.includes('e08cf8eb7c6fd5b6df87dcf1a467c286a0c5295f'));
  const constitution=fs.readFileSync('SPIDEY_APP_CONSTITUTION.md','utf8');
  assert.match(constitution,/NÃO exibirá coluna\/conversão de horário de Portugal/);
  assert.ok(constitution.includes('lista histórica fornecida pelo projeto'));

  const ui=read('fly-v1.js');
  assert.ok(ui.includes('id="flySourceCredits"'));
  assert.ok(ui.includes('source.credits'));
  assert.ok(ui.includes('raw.textContent=source.credits'));
  assert.ok(read('fly-v1.css').includes('.fly-original-credits'));
  assert.ok(read('fly-core.js').includes('SPIDEY_FLY_REFERENCE_SOURCE=d.source_list_2023'));
});
test('22 October 2026 Morelull route uses CURRENT local DST, not November 2023 Brasília hours',()=>{
  const rows=core.route(morelull,points,new Date('2026-10-22T08:59:00Z'));
  assert.equal(rows.length,points.length);
  assert.equal(rows[0].timezone,'Pacific/Kiritimati');
  for(const [name,expectedUTC] of [
    ['Kiritimati Lagoon, Kiribati','2026-10-22T04:00:00.000Z'],
    ['Fagali\'i, Samoa','2026-10-22T05:00:00.000Z'],
    ['Auckland, Nova Zelândia','2026-10-22T05:00:00.000Z'],
    ['Sydney, Austrália','2026-10-22T07:00:00.000Z'],
    ['Seoul, Coreia do Sul','2026-10-22T09:00:00.000Z'],
    ['Tamil Nadu (Chennai), Índia','2026-10-22T12:30:00.000Z'],
    ['Jerusalém, Israel','2026-10-22T15:00:00.000Z'],
    ['Coliseu, Roma, Itália','2026-10-22T16:00:00.000Z'],
    ['Londres, Reino Unido','2026-10-22T17:00:00.000Z'],
    ['Ponta Delgada, Açores, Portugal','2026-10-22T18:00:00.000Z'],
    ['Ibirapuera, São Paulo','2026-10-22T21:00:00.000Z'],
    ['Central Park, Nova York','2026-10-22T22:00:00.000Z'],
    ['Chicago, EUA','2026-10-22T23:00:00.000Z'],
    ['Cidade do México, México','2026-10-23T00:00:00.000Z'],
    ['Pier 39, São Francisco','2026-10-23T01:00:00.000Z'],
    ['Anchorage, Alasca','2026-10-23T02:00:00.000Z'],
    ['Mangareva, Polinésia Francesa','2026-10-23T03:00:00.000Z'],
    ['Kalakaua Ave, Honolulu','2026-10-23T04:00:00.000Z'],
    ['Fagatogo, Samoa Americana','2026-10-23T05:00:00.000Z'],
    ['Midway Island','2026-10-23T05:00:00.000Z'],
  ]){
    const p=rows.find(p=>p.name===name);
    assert.ok(p,'Missing '+name);
    assert.equal(p.start.toISOString(),expectedUTC,'Wrong DST for '+name);
    assert.equal(p.end-p.start,3600000,'Not one-hour spotlight for '+name);
  }
  assert.ok(rows.every((p,i)=>i===0||p.start>=rows[i-1].start),'World route not chronological');
});
test('Future November events automatically shift clocks according to their own event dates',()=>{
  assert.equal(core.localToDate('2026-10-22','18:00','Europe/London').toISOString(),'2026-10-22T17:00:00.000Z');
  assert.equal(core.localToDate('2026-11-10','18:00','Europe/London').toISOString(),'2026-11-10T18:00:00.000Z');
  assert.equal(core.localToDate('2026-10-22','18:00','America/New_York').toISOString(),'2026-10-22T22:00:00.000Z');
  assert.equal(core.localToDate('2026-11-10','18:00','America/New_York').toISOString(),'2026-11-10T23:00:00.000Z');
  assert.equal(core.localToDate('2026-10-22','18:00','Asia/Jerusalem').toISOString(),'2026-10-22T15:00:00.000Z');
  assert.equal(core.localToDate('2026-11-10','18:00','Asia/Jerusalem').toISOString(),'2026-11-10T16:00:00.000Z');
});
test('FLY opens the entire world and sw cache revokes the stale point list',()=>{
  const ui=read('fly-v1.js');
  assert.ok(ui.includes("selected=id;mode='all';render()"));
  const index=read('index.html'),sw=read('sw.js');
  assert.ok(index.includes('fly-core.js?v=20261022-credits-dst1'));
  assert.ok(index.includes('fly-v1.js?v=20261022-credits-dst1'));
  assert.ok(index.includes('fly-v1.css?v=20261022-credits-dst1'));
  assert.ok(sw.includes('spidey-app-20261022-credits-dst-v1'));
  assert.equal(morelull.gpx.enabled,false);
});
