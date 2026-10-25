'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const official='https://pokemongo.com/en/news/go-wild-area-stamp-rally-details-2026';
const expected={
 '2026-11-go-wild-area-sendai':['Tsutsujigaoka Park','Daterium','Jyukyo Park Sendai Station West','Sendai City Museum','Nishi Park','Nishikicho Park','AEON Mall Sendai Kamisugi'],
 '2026-11-go-wild-area-mexico-city':['Monumento a la Revolución','Jardín Pushkin','Parque México','Centro de Cultura Digital / Estela de Luz','Parque América','Liverpool Polanco','Mexicráneo + Ángel de la Independencia']
};
test('22/10 official GO Wild Area stamp clarification supersedes outdated 9am and Extra Day assumptions',()=>{
 for(const [id,places] of Object.entries(expected)){
   const e=events.find(x=>x.id===id);
   assert.ok(e,id);
   const s=e.stamp_rally;
   assert.ok(s,'Missing stamp-rally source');
   assert.equal(s.source_url,official);
   assert.equal(s.start_time_local,'10:00');
   assert.equal(s.end_time_local,'20:00');
   assert.equal(s.main_ticket_day_only,true);
   assert.equal(s.extra_day_gives_second_rally,false);
   assert.equal(s.timezone,e.schedule.local_timezone);
   assert.equal(s.locations.length,7);
   assert.deepEqual(s.locations.map(x=>x.name),places);
   assert.ok(s.locations.every(p=>p.coordinates_verified===false && p.lat===undefined && p.lng===undefined));
   assert.ok(e.notes.some(s=>s.includes('10h às 20h') && s.includes('dia principal')));
   assert.ok(!e.notes.some(s=>s.includes('funciona das 9h às 20h')));
   assert.equal(e.gpx?.enabled,false,'Do not invent GPX');
 }
});
test('November global Wild Area, Community Day and Rocket coexist with local city rallies',()=>{
 const global=events.find(x=>x.id==='2026-11-go-wild-area-global');
 const pawniard=events.find(x=>x.id==='2026-11-21-community-day-preview');
 assert.ok(global && pawniard);
 assert.equal(global.schedule.start_local,'2026-11-14T10:00:00-03:00');
 assert.equal(pawniard.schedule.start_local,'2026-11-21T14:00:00-03:00');
 assert.equal(events.filter(e=>expected[e.id]).length,2);
 assert.ok(fs.existsSync('spidey-app/data/rocket-lineups.json'));
});
