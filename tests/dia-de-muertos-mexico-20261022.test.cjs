'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const locals = JSON.parse(fs.readFileSync('spidey-app/data/local-events.json','utf8')).events;
const national = events.find(e=>e.id==='2026-10-27-dia-de-muertos-mexico');
const city = events.find(e=>e.id==='2026-10-31-dia-de-muertos-paseo-reforma');
const mexicanSource = 'https://pokemongo.com/es-MX/news/dia-de-muertos-2026';
test('Día de Muertos official Mexican national and Paseo de la Reforma programs are distinct',()=>{
 assert.ok(national && city);
 assert.equal(national.category,'regional_event');
 assert.equal(city.category,'local_event');
 assert.equal(national.source.url,mexicanSource);
 assert.equal(city.source.url,mexicanSource);
 assert.ok(national.tags.includes('México') && !national.tags.includes('Global'));
 assert.ok(city.tags.includes('Presencial') && !city.tags.includes('Global'));
 assert.equal(events.filter(e=>e.id===national.id).length,1);
 assert.equal(events.filter(e=>e.id===city.id).length,1);
 assert.ok(locals.some(e=>e.id===city.id && e.artApproved===false));
});
test('Mexico City local hours and São Paulo conversion are exact; no fabricated GPS or GPX',()=>{
 assert.equal(national.schedule.local_timezone,'America/Mexico_City');
 assert.equal(city.schedule.local_timezone,'America/Mexico_City');
 assert.equal(new Date(national.schedule.start_local).toISOString(),'2026-10-27T16:00:00.000Z');
 assert.equal(new Date(national.schedule.end_local).toISOString(),'2026-11-06T02:00:00.000Z');
 assert.equal(new Date(city.schedule.start_local).toISOString(),'2026-10-31T16:00:00.000Z');
 assert.equal(new Date(city.schedule.end_local).toISOString(),'2026-11-06T02:00:00.000Z');
 for(const e of [national,city]){
   assert.equal(new Date(e.schedule.start_local).getTime(),new Date(e.schedule.start_brazil).getTime());
   assert.equal(new Date(e.schedule.end_local).getTime(),new Date(e.schedule.end_brazil).getTime());
   assert.equal(e.gpx.enabled,false);
   assert.equal(e.locations.length,e===national?0:1);
   assert.equal(e.notifications.enabled,false);
   assert.equal(e.art,undefined);
 }
 const sandbox={window:{},Intl,Date,Math,Object,Set};
 vm.runInNewContext(fs.readFileSync('spidey-app/fly-core.js','utf8'),sandbox);
 const core=sandbox.window.SpideyFlyCore;
 for(const e of [national,city]){assert.equal(core.eligible(e),false,'Regional event must never become global FLY route');}
 assert.equal(locals.find(e=>e.id===city.id).gpx.enabled,false);
 assert.equal(city.schedule.start_brazil,'2026-10-31T13:00:00-03:00');
 assert.equal(city.locations[0].coordinate_type,'landmark_reference');
 assert.equal(city.locations[0].exact_raid_gym_verified,false);
 assert.equal(city.locations[0].exact_pokestop_verified,false);
 assert.equal(city.locations[0].exact_power_spot_verified,false);
 assert.equal(city.locations[0].coordinate_text,'19.4269903,-99.1676463');
 assert.equal(city.locations[0].coordinate_confidence,'geographic_reference_verified');
 assert.equal(locals.find(e=>e.id===city.id).schedule.start_time,'10:00');
 assert.equal(locals.find(e=>e.id===city.id).locations[0].coordinate_type,'landmark_reference');
 assert.ok(city.notes.some(n=>n.includes('NÃO significa')));
 assert.ok(!city.notes.some(n=>n.includes('31/10 às 14h')));
 assert.ok(!national.notes.some(n=>n.includes('31/10 às 14h')));
 assert.ok(fs.readFileSync('spidey-app/app.js','utf8').includes("loc.coordinate_type === 'landmark_reference'"));
 assert.ok(fs.readFileSync('spidey-app/app.js','utf8').includes('NÃO é Ginásio, Poképarada, Power Spot'));

});
test('Both Mexico-only entries preserve original catalog and all protected arts',()=>{
 const ids=new Set(events.map(e=>e.id));
 assert.equal(ids.size,events.length);
 const approved=fs.readFileSync('spidey-app/premium-approved-master.js','utf8');
 assert.ok(!approved.includes('2026-10-27-dia-de-muertos-mexico'));
 assert.ok(!approved.includes('2026-10-31-dia-de-muertos-paseo-reforma'));
 assert.ok(events.find(e=>e.id==='2026-10-22-spotlight-morelull'));
 assert.ok(events.find(e=>e.id==='2026-11-go-wild-area-mexico-city'));
});
