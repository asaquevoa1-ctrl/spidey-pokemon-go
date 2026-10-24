const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));
const get=id=>data.events.filter(e=>e.id===id);
test('National Trust: 27 real site names and 27 uniquely formatted, community-provided venue references',()=>{
 const rows=get('2026-national-trust-27-sites');
 assert.equal(rows.length,1);
 const e=rows[0];
 assert.equal(e.status,'draft');
 assert.equal(e.presentation.requires_art,true);
 assert.equal(e.gpx.enabled,false);
 assert.equal(e.source.url,'https://pokemongo.com/news/nationaltrust-2026');
 assert.equal(e.schedule.end_local,'2026-12-31T23:59:00+00:00');
 assert.equal(e.locations.length,27);
 assert.equal(new Set(e.locations.map(p=>p.name)).size,27);
 assert.equal(new Set(e.locations.map(p=>p.coordinate_text)).size,27);
 for(const p of e.locations){
  assert.equal(p.coordinate_type,'national_trust_venue_reference');
  assert.equal(p.exact_raid_gym_verified,false);
  assert.match(p.coordinate_text,/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/);
  const [lat,lon]=p.coordinate_text.split(',').map(Number);
  assert.equal(p.latitude,lat);
  assert.equal(p.longitude,lon);
  assert.ok(lat>=49&&lat<=56&&lon>=-9&&lon<=3);
 }
 assert.equal(e.locations.find(x=>x.name==='Tyntesfield').coordinate_text,'51.44079,-2.71242');
 assert.equal(e.locations.find(x=>x.name==='Wimpole Estate').coordinate_text,'52.14105,-0.04978');
 assert.match(e.notes.join(' '),/NÃO é recompensa automática de 27 passes/);
 assert.match(e.notes.join(' '),/NÃO localizações verificadas/);
});
test('Night Out concerts: local times are verified and game rumors are explicitly unconfirmed',()=>{
 const la=get('2026-pokemon-night-out-la'),uk=get('2026-pokemon-night-out-london');
 assert.equal(la.length,1);assert.equal(uk.length,1);
 assert.equal(la[0].schedule.start_local,'2026-10-24T19:30:00-07:00');
 assert.equal(uk[0].schedule.start_local,'2026-11-10T18:00:00+00:00');
 assert.ok(uk[0].notes.some(x=>x.includes('abertura das portas')));
 for(const e of [la[0],uk[0]]){
  assert.equal(e.status,'draft');
  assert.equal(e.presentation.requires_art,true);
  assert.equal(e.gpx.enabled,false);
  assert.equal(e.locations.length,1);
  assert.equal(e.locations[0].exact_raid_gym_verified,false);
  assert.equal(e.source.url,'https://30.pokemon.com/pt-br/night-out/');
  assert.ok(e.notes.some(x=>x.includes('NÃO foram confirmados')));
  assert.equal(e.notifications.enabled,false);
 }
 assert.equal(get('2026-10-pokemon-night-out-twitch').length,1);
 assert.equal(get('2026-10-24-fc-seoul').length,1);
});

test('unreleased editorial drafts stay out of the app calendar and default event cards',()=>{
 const source=fs.readFileSync('spidey-app/calendar-enhancements.js','utf8');
 assert.match(source,/if \(event\.status === 'draft'\) return false;/);
 assert.match(source,/const visible = state\.events\.filter\(\(event\) => \{\s*if \(event\.status === 'draft'\) return false;/);
});
