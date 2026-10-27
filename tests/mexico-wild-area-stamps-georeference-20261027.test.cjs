'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const catalog=JSON.parse(fs.readFileSync('spidey-app/data/stamps.json','utf8'));
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const rallyId='2026-go-wild-area-mexico-city-stamp-rally';
const rally=catalog.rallies.find(x=>x.id===rallyId);
const event=events.find(x=>x.id==='2026-11-go-wild-area-mexico-city');
const names=[
'Monumento a la Revolución','Jardín Pushkin','Parque México',
'Centro de Cultura Digital / Estela de Luz','Parque América',
'Liverpool Polanco','Mexicráneo + Ángel de la Independencia'
];
test('Official CDMX Wild Area seven-stamp rally appears once and keeps all preexisting collections',()=>{
 assert.ok(rally && event);
 assert.equal(catalog.rallies.filter(x=>x.id===rallyId).length,1);
 assert.equal(catalog.rallies.length,5);
 for(const prior of ['pokemon-centre-japan-stamp-rally-2026','pokexciting-cross-region-2026','nagasaki-city-stamp-rally']){
   assert.equal(catalog.rallies.filter(x=>x.id===prior).length,1,prior);
 }
 assert.equal(rally.stamp_count,7);
 assert.equal(rally.stops.length,7);
 assert.deepEqual(rally.stops.map(s=>s.venue),names);
 assert.deepEqual(event.stamp_rally.locations.map(s=>s.name),names);
 assert.equal(event.stamp_rally.rally_id,rallyId);
 assert.equal(rally.source.confidence,'official');
 assert.match(rally.source.url,/pokemongo\.com\/gowildarea\/mexico-city\/gameplay/);
 assert.equal(rally.calendar.enabled,false);
});
test('Ticket day only, 10h–20h Mexico City means 13h–23h Brasília; no extra-day rally',()=>{
 assert.equal(rally.timezone,'America/Mexico_City');
 assert.equal(rally.stamp_window_local,'10:00–20:00');
 assert.equal(rally.stamp_window_brasilia,'13:00–23:00');
 assert.equal(rally.main_ticket_day_only,true);
 assert.equal(rally.extra_day_second_rally,false);
 assert.equal(rally.visit_order_required,false);
 assert.equal(event.stamp_rally.main_ticket_day_only,true);
 assert.equal(event.stamp_rally.extra_day_gives_second_rally,false);
 assert.equal(event.stamp_rally.start_time_local,'10:00');
 assert.equal(event.stamp_rally.end_time_local,'20:00');
 assert.ok(event.notes.some(n=>n.includes('10h às 20h') && n.includes('dia principal')));
 assert.ok(rally.public_notes.some(n=>n.includes('13h às 23h')));
 assert.ok(rally.public_notes.some(n=>n.includes('qualquer ordem')));
 assert.equal(rally.calendar.enabled,false,'No duplicate Calendar event');
});
test('Published venue coordinates are geographic references ONLY, not PokéStops or GPX', async()=>{
 assert.equal(rally.coordinate_policy,'venue_references_no_gpx');
 for(const [i,s] of rally.stops.entries()){
  assert.equal(s.stamp_number,i+1);
  assert.equal(s.coordinate_type,'venue_reference');
  assert.equal(s.coordinate_confidence,'third_party_landmark_reference');
  assert.equal(s.reference_only_copyable,true);
  assert.equal(s.exact_pokestop_verified,false);
  assert.equal(s.gpx_enabled,false);
  assert.ok(Number.isFinite(s.latitude)&&s.latitude>19&&s.latitude<20);
  assert.ok(Number.isFinite(s.longitude)&&s.longitude< -98&&s.longitude> -100);
  assert.ok(s.map_url.startsWith('https://www.google.com/maps/search/?api=1&query='));
  assert.ok(s.coordinate_source.includes('imyfone.com'));
  const e=event.stamp_rally.locations[i];
  assert.equal(e.latitude,s.latitude);assert.equal(e.longitude,s.longitude);
  assert.equal(e.coordinates_verified,false);
  assert.equal(e.exact_pokestop_verified,false);
 }
 assert.equal(event.gpx.enabled,false);
 const {rallyGpx}=await import('../lib/rally-gpx.js');
 assert.equal(rallyGpx(catalog,rallyId).status,409);
 assert.equal(rallyGpx(catalog,rallyId).body?.error,'exact_coordinates_required');
});
test('Human-first stamped UI copies only reference locations, keeps exact-gpx restrictions and all other features',()=>{
 const ui=fs.readFileSync('spidey-app/stamps-v2.js','utf8');
 const app=fs.readFileSync('spidey-app/app.js','utf8');
 const sw=fs.readFileSync('spidey-app/sw.js','utf8');
 const html=fs.readFileSync('spidey-app/index.html','utf8');
 assert.doesNotThrow(()=>new vm.Script(ui,{filename:'stamps-v2.js'}));
 assert.ok(ui.includes("rally.coordinate_policy === 'venue_references_no_gpx'"));
 assert.ok(ui.includes("stop.reference_only_copyable !== true"));
 assert.ok(ui.includes('!isLandmarkGuide && exactStops.length'));
 assert.ok(ui.includes('Referência do local'));
 assert.ok(ui.includes('Copiar local de referência'));
 assert.ok(ui.includes('Procure o símbolo do selo'));
 assert.ok(ui.includes('isLandmarkGuide ? landmarkVenueCoord(stop) : coord(stop)'));
 assert.ok(app.includes('lugares de referência (não Poképaradas)'));
 assert.ok(html.includes('stamps-v2.js?v=20261027-mexico-reference1'));
 assert.ok(sw.includes('20261027-cdmx-stamps1'));
 for(const feature of ['rocket-guide.js','fly-v1.js','pvp.js','push.js'])assert.ok(html.includes(feature));
 assert.ok(!html.includes('hunter-v1.js'),'Do not restore retired Caçador');
});
