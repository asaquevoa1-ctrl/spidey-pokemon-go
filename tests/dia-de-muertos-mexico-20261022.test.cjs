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
 assert.equal(new Date(city.schedule.start_local).toISOString(),'2026-10-31T20:00:00.000Z');
 assert.equal(new Date(city.schedule.end_local).toISOString(),'2026-11-06T02:00:00.000Z');
 for(const e of [national,city]){
   assert.equal(new Date(e.schedule.start_local).getTime(),new Date(e.schedule.start_brazil).getTime());
   assert.equal(new Date(e.schedule.end_local).getTime(),new Date(e.schedule.end_brazil).getTime());
   assert.equal(e.gpx.enabled,false);
   assert.equal(e.locations.length,0);
   assert.equal(e.notifications.enabled,false);
   assert.equal(e.art,undefined);
 }
 const sandbox={window:{},Intl,Date,Math,Object,Set};
 vm.runInNewContext(fs.readFileSync('spidey-app/fly-core.js','utf8'),sandbox);
 const core=sandbox.window.SpideyFlyCore;
 for(const e of [national,city]){assert.equal(core.eligible(e),false,'Regional event must never become global FLY route');}
 assert.equal(locals.find(e=>e.id===city.id).gpx.enabled,false);
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
