'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const byId=id=>events.find(event=>event.id===id);

test('all automatically collected official headlines have been reviewed',()=>{
 const pending=events.filter(event=>event.audit?.editorial_detail_pending===true);
 assert.deepEqual(pending.map(event=>event.id),[]);
});

test('Twilight Wishes keeps its existing ID and distinct research windows',()=>{
 const event=byId('2026-11-24-twilight-wishes-preview');
 const headline=byId('official-news-auto-f0093c412c9b');
 assert(event);
 assert.equal(event.source.confidence,'official');
 assert.equal(event.schedule.start_local,'2026-11-24T10:00:00-03:00');
 assert.equal(event.schedule.end_local,'2026-11-30T20:00:00-03:00');
 assert.deepEqual(event.field_research_windows.map(window=>[window.start_local,window.end_local]),[
  ['2026-11-24T10:00:00','2026-11-26T10:00:00'],
  ['2026-11-26T10:00:00','2026-11-30T20:00:00']
 ]);
 assert.equal(headline.status,'archived');
 assert.equal(headline.superseded_by,event.id);
});

test('ongoing stamp rallies remain news and do not become a dated calendar event',()=>{
 const story=byId('official-news-auto-1eda22614526');
 assert.equal(story.status,'published');
 assert.equal(story.calendar.mode,'hidden');
 assert.equal(story.audit.no_planned_end_date,true);
 assert.equal(story.audit.distinct_from_event_stamp_rallies,true);
 assert.deepEqual(story.related_stamp_rally_ids,['lapras-sendai-tohoku','hawlucha-mexico-city']);
 assert.match(story.news.summary,/oito Poképaradas/);
});

test('Mexico City guide shows only officially published research detail and city activities',()=>{
 const event=byId('2026-11-go-wild-area-mexico-city');
 const html=fs.readFileSync('spidey-app/index.html','utf8');
 assert(event.verification_sources.some(source=>source.url.includes('gowa_cdmx_additional_info')));
 assert(event.notes.some(note=>note.includes('Tarefas e recompensas individuais ainda não foram publicadas')));
 assert.match(html,/id="wildMxCity"/);
 assert.match(html,/Monumento a la Revolución/);
 assert.match(html,/10h às 12h50/);
 assert.match(html,/Foro Lucerna/);
 assert.doesNotMatch(html,/Samsung.*testad/i);
});

test('LAIC 2027 is one official story with three separate daily windows',()=>{
 const event=byId('2026-11-20-laic-2027-sao-paulo');
 assert(event);
 assert.equal(event.source.confidence,'official');
 assert.equal(event.source.url,'https://pokemongo.com/pt-BR/news/pokemon-go-at-laic2027');
 assert.equal(event.schedule.local_timezone,'America/Sao_Paulo');
 assert.deepEqual(event.schedule.sessions.map(session=>[session.start,session.end]),[
  ['2026-11-20T08:00:00-03:00','2026-11-20T18:00:00-03:00'],
  ['2026-11-21T08:00:00-03:00','2026-11-21T18:00:00-03:00'],
  ['2026-11-22T08:00:00-03:00','2026-11-22T18:00:00-03:00']
 ]);
 assert.equal(event.gpx.enabled,false);
 assert.equal(event.audit.editorial_detail_pending,false);
 assert.equal(event.audit.no_gameplay_bonuses_announced,true);
 assert.equal(events.filter(item=>item.source?.url?.includes('pokemon-go-at-laic2027')).length,1);
});
