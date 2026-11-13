'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const byId=id=>events.find(event=>event.id===id);

test('the three official collector headlines are fully reviewed',()=>{
 for(const id of ['official-news-auto-6e45ee38e2b8','official-news-auto-1027790d90b8','official-news-auto-8a38cf8f2093']){
  const event=byId(id);
  assert(event,id);
  assert.equal(event.audit.editorial_detail_pending,false,id);
  assert.equal(event.audit.classification,'official_announcement_editorially_verified',id);
 }
 assert.deepEqual(events.filter(event=>event.audit?.editorial_detail_pending===true).map(event=>event.id),[]);
});

test('Machamp research preserves acquisition and completion as distinct windows',()=>{
 const acquisition=byId('2026-11-06-gmax-machamp-research-acquisition');
 const completion=byId('2026-11-06-gmax-machamp-research-completion');
 assert.equal(acquisition.schedule.end_local,'2026-11-08T23:59:00-03:00');
 assert.equal(completion.schedule.end_local,'2026-11-15T23:59:00-03:00');
 assert.match(completion.summary,/Somente para quem recebeu/);
 assert.match(completion.notes.join(' '),/Doces Machop GG/);
 assert.match(completion.notes.join(' '),/tarefas individuais não foram publicadas/i);
 assert.equal(completion.pokemon[0].shiny,true);
});

test('Black Friday keeps the general promotion and shorter box window separate',()=>{
 const coins=byId('2026-11-08-black-friday-double-pokecoins');
 const box=byId('2026-11-08-seasonal-delights-box');
 assert.equal(coins.schedule.start_local,'2026-11-08T17:00:00-08:00');
 assert.equal(coins.schedule.end_local,'2026-11-29T20:00:00-08:00');
 assert.equal(coins.schedule.end_brazil,'2026-11-30T01:00:00-03:00');
 assert.equal(box.schedule.end_local,'2026-11-27T20:00:00-08:00');
 assert.equal(box.schedule.end_brazil,'2026-11-28T01:00:00-03:00');
 assert.match(box.notes.join(' '),/40 Incubadoras/);
 assert.match(box.notes.join(' '),/três compras/);
});

test('save-the-date creates exactly eleven date-only records without invented detail',()=>{
 const ids=[
  '2026-12-05-max-battle-day-save-date','2026-12-12-community-day-save-date',
  '2026-12-19-raid-day-save-date','2026-12-26-hatch-day-save-date',
  '2027-01-02-community-day-classic-save-date','2027-01-09-super-mega-raid-day-save-date',
  '2027-01-16-community-day-save-date','2027-01-23-max-battle-day-save-date',
  '2027-01-30-super-mega-raid-day-save-date','2027-02-06-community-day-save-date',
  '2027-02-13-raid-day-save-date'
 ];
 assert.deepEqual(byId('official-news-auto-8a38cf8f2093').related_event_ids,ids);
 for(const id of ids){
  const event=byId(id);
  assert.equal(event.schedule.precision,'date',id);
  for(const field of ['start_local','end_local','start_brazil','end_brazil']) assert.equal(event.schedule[field],undefined,`${id} ${field}`);
  assert.equal(event.pokemon,undefined,id);
  assert.equal(event.bonuses,undefined,id);
  assert.equal(event.notifications.enabled,false,id);
  assert.equal(event.gpx.enabled,false,id);
 }
 assert.equal(byId('2026-12-12-community-day-save-date').schedule.end_date,'2026-12-13');
});

test('date-only expiry uses the event IANA day through its last local second',()=>{
 const window={};
 vm.runInContext(fs.readFileSync('spidey-app/date-only.js','utf8'),vm.createContext({window,Date,Intl,Object}));
 const event=byId('2026-12-05-max-battle-day-save-date');
 assert.match(window.SpideyDateOnly.status(event,new Date('2026-12-06T02:59:59Z')),/^Hoje/);
 assert.equal(window.SpideyDateOnly.status(event,new Date('2026-12-06T03:00:00Z')),'Data encerrada');
});

test('the Mewtwo clone rumor remains historical and does not gain unannounced species',()=>{
 const rumor=byId('2026-11-03-clone-special-raid-day-rumor');
 assert.equal(rumor.status,'archived');
 assert.equal(rumor.superseded_by,'2026-12-19-raid-day-save-date');
 assert.equal(rumor.audit.official_date_confirmed,true);
 assert.equal(rumor.audit.species_still_unconfirmed,true);
 assert.equal(byId('2026-12-19-raid-day-save-date').pokemon,undefined);
});

test('Into the Wild keeps Pass, claim and Silver Bottle Cap deadlines distinct',()=>{
 const pass=byId('2026-11-09-into-the-wild-go-pass');
 const claim=byId('2026-11-09-into-the-wild-pass-claim');
 const cap=byId('2026-11-09-silver-bottle-cap-use-deadline');
 assert.equal(pass.schedule.end_local,'2026-11-15T18:00:00-03:00');
 assert.equal(claim.schedule.end_local,'2026-11-17T23:59:00-03:00');
 assert.equal(cap.schedule.end_local,'2026-11-22T23:59:00-03:00');
 assert.match(pass.summary,/Deluxe/);
 assert.match(cap.notes.join(' '),/Grande Companheiro/);
 assert.match(cap.notes.join(' '),/365 dias/);
 assert.match(cap.notes.join(' '),/Pokémon HOME/);
 assert.doesNotMatch(cap.summary,/SHUNDO|garant/i);
});


test('Wild Area avatar shop items remain a news detail, not a dated event',()=>{
 const story=byId('official-news-auto-5e1b1cd68f6c');
 assert.ok(story);
 assert.equal(story.calendar.mode,'hidden');
 assert.equal(story.audit.editorial_detail_pending,false);
 const text=[story.summary,story.news.summary,...story.notes].join(' ');
 for(const item of ['Capacete de Duraludon','Mochila de Duraludon Gigamax','Jaqueta do tipo Lutador']) assert.ok(text.includes(item),item);
 assert.match(text,/continuam (?:na loja após o evento|disponíveis após (?:seu encerramento|o evento)|disponíveis depois)/i);
 assert.equal(story.news.updated_on,'2026-11-12');
});


test('Área Selvagem lista os três itens de avatar da loja sem criar janela de calendário',()=>{
 const story=byId('official-news-auto-5e1b1cd68f6c');
 assert.ok(story);
 assert.equal(story.calendar.mode,'hidden');
 assert.equal(story.audit.editorial_detail_pending,false);
 const text=[story.summary,story.news.summary,...story.notes].join(' ');
 for(const item of ['Capacete de Duraludon','Mochila de Duraludon Gigamax','Jaqueta do tipo Lutador']) assert.ok(text.includes(item),item);
 assert.match(text,/continuam disponíveis após seu encerramento/i);
 assert.equal(story.news.updated_on,'2026-11-12');
 assert.equal(story.audit.canonical_fulltext_url,'https://pokemongo.com/pt-BR/news/get-ready-for-gowildarea-2026');
});
