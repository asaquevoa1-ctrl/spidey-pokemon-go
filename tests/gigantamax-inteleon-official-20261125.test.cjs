'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));
const byId=id=>data.events.find(event=>event.id===id);

test('Inteleon completes the existing save-date id with official local hours',()=>{
 const event=byId('2026-12-05-max-battle-day-save-date');
 assert(event);
 assert.equal(event.title,'Dia de Batalhas Max: Inteleon Gigamax');
 assert.equal(event.source.url,'https://pokemongo.com/pt-BR/news/gigantamax-inteleon-max-battle-day-2026');
 assert.equal(event.schedule.start_local,'2026-12-05T14:00:00-03:00');
 assert.equal(event.schedule.end_local,'2026-12-05T17:00:00-03:00');
 assert.equal(event.pokemon[0].name,'Inteleon Gigamax');
 assert.equal(event.pokemon[0].shiny,true);
 assert.match(event.pokemon[0].note,/sem garantia/i);
 assert.equal(event.audit.confirmed_from_save_date,true);
 assert.equal(event.presentation.requires_art,false);
 assert.equal(event.gpx.enabled,false);
 assert.equal(event.notifications.enabled,false);
});

test('official story groups but does not collapse three different windows',()=>{
 const news=byId('official-news-gigantamax-inteleon-max-battle-day-2026');
 assert(news);
 assert.equal(news.audit.editorial_detail_pending,false);
 assert.equal(news.audit.full_article_reviewed,true);
 assert.deepEqual(news.related_event_ids,[
  '2026-12-04-inteleon-remote-raid-limit',
  '2026-12-05-inteleon-exploration-bonuses',
  '2026-12-05-max-battle-day-save-date'
 ]);

 const remote=byId('2026-12-04-inteleon-remote-raid-limit');
 assert.equal(remote.schedule.start_local,'2026-12-04T16:00:00-08:00');
 assert.equal(remote.schedule.end_local,'2026-12-05T20:00:00-08:00');
 assert.equal(remote.schedule.start_brazil,'2026-12-04T21:00:00-03:00');
 assert.equal(remote.schedule.end_brazil,'2026-12-06T01:00:00-03:00');
 assert.match(remote.notes.join(' '),/não afirma participação remota/i);

 const explore=byId('2026-12-05-inteleon-exploration-bonuses');
 assert.equal(explore.schedule.start_local,'2026-12-05T00:00:00-03:00');
 assert.equal(explore.schedule.end_local,'2026-12-05T17:00:00-03:00');
 assert.match(explore.notes.join(' '),/primeiro coletar todas/i);
});

test('ticket details remain useful without invented tasks or local price',()=>{
 const event=byId('2026-12-05-max-battle-day-save-date');
 const text=[event.summary,...event.notes].join(' ');
 for(const fact of ['1 Cogumelo Max','25.000 PE','6.400 Partículas Max','800 Partículas Max']) assert.match(text,new RegExp(fact.replace('.', '\\.')));
 assert.match(text,/tarefas individuais.*não foram publicadas/i);
 assert.doesNotMatch(text,/R\$|Poképarada confirmada|coordenada confirmada/i);
});

test('season teaser links the later confirmation and leaves other dates unannounced',()=>{
 const season=byId('2026-12-daydream-destinations-season');
 const inteleon=season.pokemon.find(item=>item.name==='Inteleon Gigamax');
 const toxtricity=season.pokemon.find(item=>item.name==='Toxtricity Gigamax');
 assert.match(inteleon.note,/05\/12.*14h.*17h/);
 assert.match(toxtricity.note,/data específica não informada/i);
 assert.deepEqual(season.related_event_ids,['2026-12-05-max-battle-day-save-date']);
});
