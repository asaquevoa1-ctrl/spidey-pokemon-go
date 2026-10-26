'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
test('Eternatus official teaser is a NEWS ONLY and unconfirmed lead-out window, never calendar event',()=>{
 const x=events.find(e=>e.id==='2026-10-26-eternatus-teaser-unconfirmed');
 assert.ok(x);assert.equal(x.content_type,'news');assert.equal(x.calendar.mode,'hidden');
 assert.equal(x.audit.date_range_verified_officially,false);
 assert.equal(x.audit.not_a_calendar_event,true);
 assert.equal(x.notifications.enabled,false);
 assert.ok(x.news.summary.includes('14–23/11'));
 assert.ok(x.notes.some(n=>n.includes('NÃO comprova')));
 assert.ok(x.notes.some(n=>n.includes('Brilhante')));
 assert.equal(x.schedule,undefined);
 assert.equal(x.art,undefined);
 assert.equal(events.filter(e=>e.id===x.id).length,1);
 assert.ok(events.find(e=>e.id==='2026-11-go-wild-area-global'));
});
test('No false shiny or battle promise, original Halloween claim deadline preserved',()=>{
 const x=events.find(e=>e.id==='2026-10-26-eternatus-teaser-unconfirmed');
 for(const term of ['Batalhas Max confirmadas','Eternatus Brilhante confirmado','garantido de Eternatus']){
  assert.equal(x.summary.includes(term),false);
 }
 const halloween=events.find(e=>e.id==='2026-10-halloween-go-pass');
 assert.equal(halloween.claim_deadline.end_brazil,'2026-11-07T20:00:00-03:00');
});
