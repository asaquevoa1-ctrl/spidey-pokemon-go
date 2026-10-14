const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const locals=JSON.parse(fs.readFileSync('spidey-app/data/local-events.json','utf8')).events;
const ID='2026-10-24-fc-seoul';
test('official Seoul news and local event are present exactly once',()=>{
 const calendar=events.filter(e=>e.id===ID),local=locals.filter(e=>e.id===ID);
 assert.equal(calendar.length,1);assert.equal(local.length,1);
 assert.equal(calendar[0].status,'published');
 assert.equal(local[0].status,'official');
 assert.equal(calendar[0].source.url,'https://pokemongo.com/ko/news/fc-seoul-2026');
 assert.equal(calendar[0].source.confidence,'official');
 assert.match(calendar[0].news.title,/FC Seoul/);
});
test('Seoul single-day time in Korea converts correctly to Brazil',()=>{
 const e=events.find(e=>e.id===ID);
 assert.equal(e.schedule.start_local,'2026-10-24T09:00:00+09:00');
 assert.equal(e.schedule.end_local,'2026-10-24T20:00:00+09:00');
 assert.equal(e.schedule.start_brazil,'2026-10-23T21:00:00-03:00');
 assert.equal(e.schedule.end_brazil,'2026-10-24T08:00:00-03:00');
 assert.equal(e.schedule.local_timezone,'Asia/Seoul');
});
test('Charmander location card raids are in-person only; Charizard is timed research',()=>{
 const e=events.find(e=>e.id===ID);
 assert.ok(e.bonuses.some(b=>b.includes('Charmander')&&b.includes('1★')));
 assert.ok(e.pokemon.some(p=>p.name==='Charizard'&&p.note.includes('Pesquisa Temporária')));
 assert.ok(e.notes.some(n=>n.includes('NÃO podem ser usados')&&n.includes('Reide a Distância')));
 assert.ok(e.notes.some(n=>n.includes('7/11/2026')&&n.includes('20h')));
 assert.ok(e.notes.some(n=>n.includes('8.042')&&n.includes('5.997')));
 assert.ok(e.notes.some(n=>n.includes('9h às 14h')));
 assert.equal(e.notifications.enabled,false,'do not change push schedule silently');
});
test('stadium reference is copyable with exact precision and is not a fabricated raid gym',()=>{
 const e=events.find(e=>e.id===ID),p=e.locations[0],local=locals.find(x=>x.id===ID).locations[0];
 assert.equal(p.latitude,37.568222);
 assert.equal(p.longitude,126.897361);
 assert.equal(p.coordinate_text,'37.568222,126.897361');
 assert.equal(p.coordinate_type,'stadium_venue_reference');
 assert.equal(p.exact_raid_gym_verified,false);
 assert.equal(local.exact_pokestop_verified,false);
 assert.equal(e.gpx.enabled,false);
 const js=fs.readFileSync('spidey-app/app.js','utf8');
 assert.match(js,/stadium_venue_reference/);
 assert.match(js,/loc\.coordinate_text/);
 assert.match(js,/Ginásio de reide verificado/);
});
