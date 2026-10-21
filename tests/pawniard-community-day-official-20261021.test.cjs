'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const root = 'spidey-app/';
const events = JSON.parse(fs.readFileSync(root+'data/events.json','utf8')).events;
const official = 'https://pokemongo.com/en/news/communityday-november-2026-pawniard';
const id = '2026-11-21-community-day-preview';
const event = events.find(e=>e.id===id);

test('Pawniard official announcement updates existing November 21 entry without calendar duplicate',()=>{
  assert.ok(event);
  assert.equal(events.filter(e=>e.id===id).length,1);
  assert.equal(events.filter(e=>e.category==='community_day' && e.schedule?.start_brazil?.startsWith('2026-11-21')).length,1);
  assert.equal(event.status,'published');
  assert.match(event.title,/Pawniard/);
  assert.equal(event.source.confidence,'official');
  assert.equal(event.source.url,official);
  assert.equal(event.schedule.start_local,'2026-11-21T14:00:00-03:00');
  assert.equal(event.schedule.end_local,'2026-11-21T17:00:00-03:00');
  assert.equal(event.schedule.start_brazil,event.schedule.start_local);
  assert.equal(event.schedule.end_brazil,event.schedule.end_local);
  assert.equal(event.news?.source?.url,official);
  assert.equal(event.news?.published_on,'2026-10-21');
  assert.ok(event.notifications.enabled);
});
test('Pawniard bonuses distinguish 14h–17h from extended 14h–21h',()=>{
  const bonuses=event.bonuses.join(' ');
  const notes=event.notes.join(' ');
  assert.ok(bonuses.includes('1/4 da distância'));
  assert.ok(bonuses.includes('2× Doces'));
  assert.ok(bonuses.includes('2× chance'));
  assert.ok(bonuses.includes('nível 31'));
  assert.ok(bonuses.includes('3 horas'));
  assert.ok(bonuses.includes('50% menos'));
  assert.match(bonuses,/até (as )?21h/i);
  assert.ok(notes.includes('75 em Batalhas de Treinador'));
  assert.ok(notes.includes('85 em Ginásios'));
  assert.ok(notes.includes('1 chefe de reide'));
  assert.ok(notes.includes('companh'));
  assert.ok(notes.includes('US$ 1,99'));
  assert.ok(event.pokemon.some(p=>p.name==='Kingambit' && p.note.includes('Kowtow Cleave')));
  assert.ok(event.pokemon.some(p=>p.name==='Pawniard' && p.note.includes('Brilhante')));
});
test('No third-party GO Hub poster is passed off as approved Spidey art',()=>{
  assert.equal(event.presentation.requires_art,false);
  assert.equal(event.presentation.fallback_visual,'date');
  assert.equal(event.presentation.no_unverified_poster,true);
  assert.ok(!event.art || !event.art.url);
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(root+'premium-approved-master.js','utf8'),sandbox);
  assert.equal(sandbox.window.SPIDEY_APPROVED_ART_MASTER?.[id],undefined);
  assert.equal(event.gpx.enabled,false);
  assert.ok(event.verification_sources.every(x=>x.confidence==='official'));
  assert.ok(!event.notes.join(' ').includes('aguardam anúncio oficial'));
});
test('Confirmed Pawniard release shows as its own Novidades story',()=>{
  const sandbox={window:{},URL,Date,Map,Math};
  vm.runInNewContext(fs.readFileSync(root+'news-feed.js','utf8'),sandbox);
  const range=e=>{
    const a=e.schedule?.start_brazil||e.schedule?.start_local||e.schedule?.start_date;
    const b=e.schedule?.end_brazil||e.schedule?.end_local||e.schedule?.end_date;
    return a&&b?{start:new Date(a),end:new Date(b)}:null;
  };
  const stories=sandbox.window.SpideyNews.build(events,range,new Date('2026-10-21T10:00:00-03:00'));
  const story=stories.find(s=>s.events.some(e=>e.id===id));
  assert.ok(story,'Novidades must surface November Community Day');
  assert.match(story.title,/Pawniard/);
  assert.equal(story.events.length,1,'Do not merge with unrelated announcements');
});
