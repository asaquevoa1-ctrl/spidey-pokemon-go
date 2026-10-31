'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=JSON.parse(fs.readFileSync('spidey-app/data/world-event-points.json','utf8'));
const exactUserCoordinates=`
1.987149,-157.477137
-13.831357,-171.766401
-36.852095,174.763180
-41.2846675,174.7664883
-33.8642,151.217819
-33.866173,151.205945
-37.817509,144.963305
35.154379,129.06044
37.511304,127.09820
35.5440,134.2320
34.65011,135.51050
35.15530,136.91978
35.6312,139.8800
35.68895,139.69054
25.0444,121.5296
22.277957,114.15616
-6.175554,106.827587
13.0403,80.2666
4.175236,73.509560
37.8863,58.38313
25.076750,55.132940
23.62462,58.57885
40.36833,49.84200
38.462347,27.216953
31.77796,35.21913
40.626936,22.952342
35.3520,25.1561
41.661609,-0.894640
38.9951,-0.1445
51.0564,2.3408
45.435752,12.322317
47.531612,19.053035
28.128966,-15.433923
51.501000,-0.124600
51.5143,0.7236
53.3381095,-6.2592388
37.742199,-25.655522
14.910725,-23.527823
-3.84010,-32.41181
-23.58417130,-46.66072464
-22.868689,-43.341303
-22.906534,-43.223197
-22.902745,-43.171821
-34.608403,-58.372164
-34.901112,-56.164532
10.506098,-66.914602
18.462522,-69.915771
40.7803,-73.9630
40.716759,-73.998935
43.653310,-79.384008
23.113592,-82.366592
-2.1038715,-79.90718
41.898659,-87.623077
29.3646,-94.8102
19.435359,-99.145402
51.046315,-114.071824
37.8095,-122.4101
37.787993,-122.407437
61.217019,-149.891609
64.83895,-147.71456
21.2658,-157.8213
-21.20800,-159.77221
-14.277739,-170.688512
28.211279,-177.373023`.trim().split('\n').map(v=>v.split(',').map(Number));
const coord=(p)=>p.lat.toFixed(7)+','+p.lon.toFixed(7);
const referenceSet=new Set(exactUserCoordinates.map(([lat,lon])=>coord({lat,lon})));
test('31 October user-supplied FLY list has all 64 EXACT coordinates, no substitution or duplication',()=>{
  assert.equal(exactUserCoordinates.length,64);
  assert.equal(referenceSet.size,64);
  const active=source.points.filter(p=>p.current_user_list_20261031===true);
  assert.equal(active.length,64);
  assert.deepEqual(new Set(active.map(coord)),referenceSet);
  assert.equal(source.points.filter(p=>!p.current_user_list_20261031).length,8,'archive extras separately, do not silently mix them');
  assert.ok(active.some(p=>p.name==='Praça XV, Rio de Janeiro'));
  assert.ok(active.some(p=>p.name.includes('Santo Domingo')));
  assert.equal(source.source_list_2023.original_points_count,67,'historical record must remain unchanged');
  assert.equal(source.points.filter(p=>p.source_list).length,67);
  assert.match(source.source_list_2023.credits,/❌NÃO EDITE OU TIRE OS CRÉDITOS❌/);
  for(const name of ['LendáriosBrasil','FlyGPS','PokemonTrail','Fantasma'])assert.ok(source.source_list_2023.credits.includes(name));
  assert.equal(source.rules.show_portugal_time_comparison,false);
});
test('FLY uses only the authorized list and computes times, never the stale 2023 schedule',async()=>{
  const sandbox={window:{},Intl,Date,Set,Math,Object,fetch:async()=>({ok:true,json:async()=>source})};
  vm.runInNewContext(fs.readFileSync('spidey-app/fly-core.js','utf8'),sandbox);
  const core=sandbox.window.SpideyFlyCore;
  const points=await core.loadPoints();
  assert.equal(points.length,64);
  assert.deepEqual(new Set(points.map(coord)),referenceSet);
  assert.ok(sandbox.window.SPIDEY_FLY_REFERENCE_SOURCE.credits.includes('👻 Fantasma 👻'));
  const event=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events.find(e=>e.id==='2026-10-super-mega-raid-day');
  assert.equal(core.eligible(event),true);
  const route=core.route(event,points,new Date('2026-10-31T17:30:00Z'));
  assert.equal(route.length,64);
  assert.equal(route[0].timezone,'Pacific/Kiritimati');
  assert.ok(route.some(p=>p.name==='Praça XV, Rio de Janeiro'));
  assert.ok(route.some(p=>p.name.includes('Santo Domingo')));
  assert.ok(route.every(p=>p.end-p.start===3*3600000));
  assert.equal(route.find(p=>p.name==='Ibirapuera, São Paulo').start.toISOString(),'2026-10-31T17:00:00.000Z');
});
