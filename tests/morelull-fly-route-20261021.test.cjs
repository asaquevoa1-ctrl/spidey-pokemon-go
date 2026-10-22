'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = p => fs.readFileSync('spidey-app/'+p,'utf8');
const event = JSON.parse(read('data/events.json')).events.find(x=>x.id==='2026-10-22-spotlight-morelull');
const pointsDoc = JSON.parse(read('data/world-event-points.json'));
const points = pointsDoc.points;
const sandbox = {window:{},Intl,Date,Set,Math,Object,fetch:()=>{throw Error('No network during timezone test')}};
vm.runInNewContext(read('fly-core.js'),sandbox);
const core = sandbox.window.SpideyFlyCore;
const byZone = (rows, zone) => rows.find(p=>p.timezone===zone && p.essential) || rows.find(p=>p.timezone===zone);

test('Morelull is on the real FLY global schedule, not only on Calendar',()=>{
  assert.equal(event.status,'published');
  assert.equal(event.category,'spotlight_hour');
  assert.ok(event.tags.some(x=>x.toLowerCase()==='global'));
  assert.equal(core.eligible(event),true);
  assert.equal(event.schedule.start_local,'2026-10-22T18:00:00-03:00');
  assert.equal(event.schedule.end_local,'2026-10-22T19:00:00-03:00');
  assert.ok(event.bonuses.some(x=>x.includes('2× Poeira Estelar')));
  assert.equal(points.length,28);
});

test('all 28 global reference coordinates use real place names and valid IANA timezones',()=>{
  for(const p of points){
    assert.ok(p.name && typeof p.name==='string');
    assert.ok(Number.isFinite(p.lat)&&p.lat>=-90&&p.lat<=90,p.name);
    assert.ok(Number.isFinite(p.lon)&&p.lon>=-180&&p.lon<=180,p.name);
    assert.equal(p.coordinate_type,'city_reference');
    assert.doesNotThrow(()=>new Intl.DateTimeFormat('pt-BR',{timeZone:p.timezone}).format(new Date('2026-10-22T12:00:00Z')));
  }
  assert.equal(event.gpx.enabled,false,'Reference cities are not verified wild spawns, gyms or PokéStops');
  assert.ok(event.notes.join(' ').includes('não localizações garantidas'));
});

test('Morelull global times align exactly with Brasília across DST and half-hour offsets',()=>{
  const route=core.route(event,points,new Date('2026-10-22T03:51:00Z'));
  assert.equal(route.length,28);
  assert.equal(route[0].timezone,'Pacific/Kiritimati');
  assert.equal(route.at(-1).timezone,'Pacific/Pago_Pago');
  const expected=[
    ['Pacific/Kiritimati','2026-10-22T04:00:00.000Z','2026-10-22T05:00:00.000Z'],
    ['Pacific/Auckland','2026-10-22T05:00:00.000Z','2026-10-22T06:00:00.000Z'],
    ['Australia/Sydney','2026-10-22T07:00:00.000Z','2026-10-22T08:00:00.000Z'],
    ['Asia/Tokyo','2026-10-22T09:00:00.000Z','2026-10-22T10:00:00.000Z'],
    ['Asia/Kolkata','2026-10-22T12:30:00.000Z','2026-10-22T13:30:00.000Z'],
    ['Europe/London','2026-10-22T17:00:00.000Z','2026-10-22T18:00:00.000Z'],
    ['America/Noronha','2026-10-22T20:00:00.000Z','2026-10-22T21:00:00.000Z'],
    ['America/Sao_Paulo','2026-10-22T21:00:00.000Z','2026-10-22T22:00:00.000Z'],
    ['America/New_York','2026-10-22T22:00:00.000Z','2026-10-22T23:00:00.000Z'],
    ['Pacific/Honolulu','2026-10-23T04:00:00.000Z','2026-10-23T05:00:00.000Z'],
    ['Pacific/Pago_Pago','2026-10-23T05:00:00.000Z','2026-10-23T06:00:00.000Z'],
  ];
  for(const [zone,start,end] of expected){
    const loc=byZone(route,zone);
    assert.ok(loc,'Missing '+zone);
    assert.equal(loc.start.toISOString(),start,'start '+zone);
    assert.equal(loc.end.toISOString(),end,'end '+zone);
  }
  assert.ok(route.every(x=>x.end-x.start===3600000));
  assert.equal(route[0].status,'PRÓXIMO');
  assert.equal(byZone(core.route(event,points,new Date('2026-10-22T04:15:00Z')),'Pacific/Kiritimati').status,'ATIVO AGORA');
  assert.equal(byZone(core.route(event,points,new Date('2026-10-23T05:30:00Z')),'Pacific/Pago_Pago').status,'ÚLTIMA CHANCE');
});

test('FLY UI shows a timely Morelull feature, selected 28-point global route and clickable coordinate links',()=>{
  const ui=read('fly-v1.js'),html=read('index.html'),css=read('fly-v1.css'),app=read('app.js'),sw=read('sw.js');
  assert.doesNotThrow(()=>new vm.Script(ui,{filename:'fly-v1.js'}));
  assert.doesNotThrow(()=>new vm.Script(app,{filename:'app.js'}));
  assert.ok(ui.includes("const MORELULL_ID='2026-10-22-spotlight-morelull'"));
  assert.ok(ui.includes('spotlightStatus(list,now)'));
  assert.ok(ui.includes('id="flyMorelullSpotlight"'));
  assert.ok(ui.includes("if(selected===MORELULL_ID)mode='all'"));
  assert.ok(ui.includes('data-fly-morespotlight'));
  assert.ok(ui.includes('data-coord="${q}"'));
  assert.ok(ui.includes("core.loadPoints()"));
  assert.ok(html.includes('fly-v1.js?v=20261021-morelull-fly1'));
  assert.ok(css.includes('.fly-spotlight-feature'));
  assert.ok(app.includes('id="openMorelullFly"'));
  assert.ok(app.includes("SpideyFly?.open('2026-10-22-spotlight-morelull')"));
  assert.ok(sw.includes('spidey-app-20261021-morelull-fly-v1'));
});
