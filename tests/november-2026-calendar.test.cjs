const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const doc = JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));
const events=doc.events;
const find = id => events.find(e => e.id === id);
const nov = events.filter(e=> e.id.startsWith('2026-11-'));
test('november 2026 curated batch is present once with no duplicated Halloween or GO Wild Area',()=>{
 const ids=events.map(e=>e.id);
 assert.equal(new Set(ids).size,ids.length);
 for(const id of ['2026-11-halloween-part-2','2026-11-go-wild-area-global','2026-11-go-wild-area-sendai','2026-11-go-wild-area-mexico-city','2026-11-09-into-the-wild','2026-11-09-daily-discovery-pause']){
   assert.ok(find(id),'Missing '+id);
 }
 for(const id of ['2026-11-04-raids-giratina-altered','2026-11-09-raids-cresselia-darkrai','2026-11-25-raids-deoxys-four-forms','2026-11-16-mega-banette-raids','2026-11-25-mega-metagross-raids','2026-11-04-raid-hour-altered-giratina','2026-11-18-raid-hour-cresselia-darkrai','2026-11-25-raid-hour-deoxys','2026-11-02-max-machop','2026-11-16-max-surprise','2026-11-23-max-espurr','2026-11-30-max-cryogonal','2026-11-05-spotlight-teddiursa','2026-11-26-spotlight-noibat','2026-11-21-community-day-preview','2026-11-28-super-mega-raid-day-preview']){
   assert.ok(find(id), 'Missing schedule '+id);
 }
 assert.ok(nov.length>=30,'Previously published November events and 24 new records are preserved');
});
test('remaining unconfirmed November previews do not invent hours, posters, Pokemon or GPX',()=>{
 for(const id of ['2026-11-16-dynamax-trails','2026-11-24-twilight-wishes-preview','2026-11-28-super-mega-raid-day-preview','2026-11-16-max-surprise']){
   const e=find(id);
   assert.equal(e.schedule.precision,'date');
   assert.equal(e.schedule.start_local,undefined);
   assert.equal(e.pokemon.length,0);
   assert.equal(e.presentation.requires_art,false);
   assert.equal(e.presentation.no_unverified_poster,true);
   assert.equal(e.gpx.enabled,false);
   assert.notEqual(e.source.confidence,'official');
   assert.ok(e.title.includes('prévia')||e.title.includes('surpresa'));
 }
});
test('spotlight and raid hours use correct local and Brasília 18 to 19, not generic UTC',()=>{
 for(const id of ['2026-11-04-raid-hour-altered-giratina','2026-11-18-raid-hour-cresselia-darkrai','2026-11-25-raid-hour-deoxys','2026-11-05-spotlight-teddiursa','2026-11-26-spotlight-noibat']){
   const e=find(id),s=e.schedule;
   assert.ok(s.start_brazil.endsWith('18:00:00-03:00'),id);
   assert.ok(s.end_brazil.endsWith('19:00:00-03:00'),id);
   assert.equal(s.local_timezone,'America/Sao_Paulo');
 }
});
test('official absence of Daily Discoveries 9-15 and Into the Wild precise times',()=>{
 const pause=find('2026-11-09-daily-discovery-pause');
 assert.equal(pause.source.confidence,'official');
 assert.equal(pause.schedule.start_date,'2026-11-09');
 assert.equal(pause.schedule.end_date,'2026-11-15');
 assert.ok(!events.some(e=>e.schedule?.start_date==='2026-11-12' && e.category==='spotlight_hour'));
 const wild=find('2026-11-09-into-the-wild');
 assert.equal(wild.source.confidence,'official');
 assert.equal(wild.schedule.start_brazil,'2026-11-09T10:00:00-03:00');
 assert.equal(wild.schedule.end_brazil,'2026-11-13T20:00:00-03:00');
 assert.ok(wild.notes.some(n=>n.includes('Passe GO')));
});
test('Cresselia and Darkrai date discrepancy is explicit and Sableye extension does not replace approved artwork',()=>{
 const regular=find('2026-11-09-raids-cresselia-darkrai');
 assert.equal(regular.schedule.start_date,'2026-11-09');
 assert.ok(regular.notes.some(n=>n.includes('16 a 24')));
 assert.equal(regular.source.confidence,'verified_community');
 const sab=find('2026-10-mega-sableye-raids');
 assert.equal(sab.schedule.end_local,'2026-11-08T10:00:00-03:00');
 assert.equal(sab.presentation.requires_art,true);
 assert.equal(sab.calendar.mode,'span');
});
test('new date-only events are understood by existing Brazilian calendar without fabricated start times',()=>{
 const window={};
 vm.runInNewContext(fs.readFileSync('spidey-app/date-only.js','utf8'), {window,Date,Intl});
 for(const id of ['2026-11-04-raids-giratina-altered','2026-11-09-raids-cresselia-darkrai','2026-11-25-raids-deoxys-four-forms','2026-11-30-max-cryogonal']){
   const e=find(id);
   assert.equal(window.SpideyDateOnly.valid(e),true,id);
   assert.ok(window.SpideyDateOnly.label(e).includes('horário do evento a confirmar'));
 }
});
