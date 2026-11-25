'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const byId=id=>events.find(event=>event.id===id);

test('Pokémon Champions completes the official date-only placeholder without changing its id',()=>{
  const event=byId('2026-12-08-unannounced-event');
  assert(event);
  assert.equal(event.title,'Evento de Celebração de Pokémon Champions');
  assert.equal(event.source.url,'https://pokemongo.com/pt-BR/news/pokemon-champions-celebration-event-2026');
  assert.equal(event.schedule.precision,undefined);
  assert.equal(event.schedule.start_local,'2026-12-08T10:00:00-03:00');
  assert.equal(event.schedule.end_local,'2026-12-14T20:00:00-03:00');
  assert.equal(event.audit.previous_state,'official_date_only_preview');
  assert.equal(event.audit.history_preserved,true);
});

test('one official story groups four distinct confirmed windows',()=>{
  const news=byId('official-news-pokemon-champions-celebration-2026');
  assert.equal(news.content_type,'news');
  assert.equal(news.calendar.mode,'hidden');
  assert.equal(news.audit.full_article_reviewed,true);
  assert.equal(news.audit.editorial_detail_pending,false);
  assert.deepEqual(news.related_event_ids,[
    '2026-12-08-unannounced-event',
    '2026-12-09-pokemon-champions-five-star-raids',
    '2026-12-14-pokemon-champions-go-pass-claim',
    '2026-12-08-pokemon-home-champions-campaign'
  ]);
});

test('raid rotation stays date-only and does not invent individual boss slots',()=>{
  const raids=byId('2026-12-09-pokemon-champions-five-star-raids');
  assert.equal(raids.schedule.precision,'date');
  assert.equal(raids.schedule.start_date,'2026-12-09');
  assert.equal(raids.schedule.end_date,'2026-12-15');
  assert.match(raids.summary,/não informa a distribuição individual/);
  assert.match(raids.pokemon[0].note,/não são prometidos simultaneamente/);
  assert.match(raids.notes.join(' '),/Fundo Especial.*8\/12.*14\/12.*não é garantido/);
});

test('GO Pass claim and HOME campaign retain their independent boundaries',()=>{
  const claim=byId('2026-12-14-pokemon-champions-go-pass-claim');
  const campaign=byId('2026-12-08-pokemon-home-champions-campaign');
  assert.equal(claim.schedule.start_local,'2026-12-14T20:00:00-03:00');
  assert.equal(claim.schedule.end_local,'2026-12-16T20:00:00-03:00');
  assert.equal(campaign.schedule.start_local,'2026-12-08T01:00:00Z');
  assert.equal(campaign.schedule.end_local,'2026-12-18T14:59:00Z');
  assert.equal(campaign.schedule.start_brazil,'2026-12-07T22:00:00-03:00');
  assert.equal(campaign.schedule.end_brazil,'2026-12-18T11:59:00-03:00');
  assert.match(campaign.notes.join(' '),/não são itens do Pokémon GO/);
});

test('the announcement does not create unannounced tasks, coordinates, GPX or Premium art',()=>{
  const event=byId('2026-12-08-unannounced-event');
  assert.equal(event.field_research_tasks,undefined);
  assert.equal(event.go_pass_tasks,undefined);
  assert.deepEqual(event.locations,[]);
  assert.equal(event.gpx.enabled,false);
  assert.equal(event.presentation.requires_art,false);
  assert.equal(event.presentation.fallback_visual,'date');
});
