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

test('full official pages keep Mystery Box, Max Particle and Remote Raid windows distinct',()=>{
 const into=byId('2026-11-09-into-the-wild');
 assert.match(into.notes.join(' '),/intervalo para reabertura.*Caixa Misteriosa/i);
 assert.equal(into.bonus_windows.find(w=>w.id==='mystery-box-cooldown').end_local,'2026-11-13T20:00:00-03:00');
 assert.equal(into.bonus_windows.find(w=>w.id==='meltan-gimmighoul-shiny').end_local,'2026-11-15T18:00:00-03:00');
 const dynamax=byId('2026-11-16-dynamax-trails');
 assert.match(dynamax.notes.join(' '),/2\.400/);
 assert.match(dynamax.notes.join(' '),/8× Partículas Max/);
 assert.match(dynamax.notes.join(' '),/20\/11 18h a 21\/11 23h em Brasília/);
 assert.equal(dynamax.bonus_windows[0].start_local,'2026-11-20T13:00:00-08:00');
 assert.equal(dynamax.bonus_windows[0].end_local,'2026-11-21T18:00:00-08:00');
 const global=byId('2026-11-go-wild-area-global');
 assert.equal(global.ticket.price_usd,11.99);
 assert.match(global.notes.join(' '),/US\$ 11,99/);
 assert.match(fs.readFileSync('spidey-app/wild-area-20261109.js','utf8'),/US\$ 11,99/);
});


const test20261113 = require('node:test');
const assert20261113 = require('node:assert/strict');
const fs20261113 = require('node:fs');
const catalog20261113 = JSON.parse(fs20261113.readFileSync('spidey-app/data/events.json','utf8')).events;

test20261113('official PT-BR move, Clefable ticket terms, Mexico City Friday update and news-only gameplay', () => {
  const into = catalog20261113.find(e => e.id === '2026-11-09-into-the-wild');
  const latios = into.pokemon.find(p => p.name === 'Latios Dinamax');
  assert.match(latios.method, /Purga de Esplendor/);
  assert.doesNotMatch(latios.method, /Esfera de Luz/);

  const clefable = catalog20261113.find(e => e.id === '2026-11-28-super-mega-raid-day-preview');
  const ticketText = [...clefable.notes, clefable.news.summary].join(' ');
  assert.match(ticketText, /US\$ 4,99/);
  assert.match(ticketText, /Grande Amigo/);
  assert.match(ticketText, /não são reembolsáveis/);
  assert.match(ticketText, /não podem ser adquiridos com PokéMoedas/);
  assert.match(ticketText, /até 17h locais/);
  assert.match(ticketText, /Passe de Batalha Premium adicional/);
  assert.equal(clefable.audit.ticket_purchase_end_local, '2026-11-28T17:00:00');
  assert.equal(clefable.audit.ticket_pokecoins_allowed, false);

  const mexico = catalog20261113.find(e => e.id === '2026-11-go-wild-area-mexico-city');
  assert.ok(mexico.notes.some(n => n.includes('experiências no Monumento a la Revolución terminaram mais cedo')));
  assert.ok(mexico.verification_sources.some(s => s.url.endsWith('/gowildarea-mexicocity-friday-update')));
  assert.equal(mexico.audit.friday_gameplay_unchanged, true);
  assert.equal(mexico.schedule.end_local, '2026-11-08T18:00:00-06:00');

  const gameplay = catalog20261113.find(e => e.id === '2026-10-08-gameplay-quality-of-life');
  assert.equal(gameplay.content_type, 'news');
  assert.equal(gameplay.calendar.mode, 'hidden');
  assert.equal(gameplay.schedule, undefined);
  assert.ok(gameplay.notes.some(n => n.includes('probabilidade de encontrar Células não mudou')));
  assert.ok(gameplay.notes.some(n => n.includes('check-in abre 15 minutos antes')));
  assert.equal(gameplay.audit.no_exact_rollout_date_published, true);
});


const test20261113b = require('node:test');
const assert20261113b = require('node:assert/strict');
const fs20261113b = require('node:fs');
const records20261113b = JSON.parse(fs20261113b.readFileSync('spidey-app/data/events.json','utf8')).events;

test20261113b('GO Pass, Pawniard, Boston and TCG full-text windows plus archived Eternatus teaser', () => {
  const paw = records20261113b.find(e => e.id === '2026-11-21-community-day-preview');
  assert.match(paw.news.summary, /Humilhação Dividida/);
  assert.match(paw.bonuses.join(' '), /Bisharp como seu companheiro/);
  assert.doesNotMatch(paw.notes.join(' '), /mesmo que não sejam seus companheiros/);
  assert.match(paw.notes.join(' '), /Grande Amigo ou superior/);
  assert.match(paw.notes.join(' '), /não reembolsável/);
  assert.match(paw.notes.join(' '), /não incluirá uma medalha/);
  assert.match(paw.notes.join(' '), /não contará com uma história/);
  assert.match(paw.notes.join(' '), /cinco Ultra Bolas/);

  const go = records20261113b.find(e => e.id === '2026-11-go-pass-groudon');
  const goText = [...go.notes, ...go.bonuses, go.news.summary].join(' ');
  for (const fragment of ['10 Ultra Bolas','5 Máximos Reviver','2 Passes de Batalha Premium','20 Ultra Bolas','10 Poções Máximas','sem limite diário de Pontos GO']) {
    assert.ok(goText.includes(fragment), fragment);
  }
  assert.ok(go.related_event_ids.includes('2026-11-go-pass-groudon-unlimited-points'));
  assert.ok(go.related_event_ids.includes('2026-11-go-pass-groudon-claim-window'));

  const noCap = records20261113b.find(e => e.id === '2026-11-go-pass-groudon-unlimited-points');
  assert.equal(noCap.schedule.start_local,'2026-11-28T00:00:00-03:00');
  assert.equal(noCap.schedule.end_local,'2026-11-29T23:59:00-03:00');
  const goClaim = records20261113b.find(e => e.id === '2026-11-go-pass-groudon-claim-window');
  assert.equal(goClaim.schedule.start_local,'2026-12-01T10:00:00-03:00');
  assert.equal(goClaim.schedule.end_local,'2026-12-03T10:00:00-03:00');

  const boston = records20261113b.find(e => e.id === '2026-10-city-safari-boston-research-claim-window');
  assert.equal(boston.schedule.start_date,'2026-10-24');
  assert.equal(boston.schedule.end_date,'2028-10-23');
  assert.ok(boston.related_event_ids.includes('2026-10-city-safari-boston-rescheduled'));
  const tcg = records20261113b.find(e => e.id === '2026-09-tcg-30th-research-claim-deadline');
  assert.equal(tcg.schedule.start_local,'2026-11-20T22:00:00-03:00');
  assert.ok(tcg.related_event_ids.includes('2026-09-tcg-30th-us-retail'));

  const teaser = records20261113b.find(e => e.id === '2026-10-26-eternatus-teaser-unconfirmed');
  assert.equal(teaser.status,'archived');
  assert.equal(teaser.calendar.mode,'hidden');
  assert.ok(teaser.related_event_ids.includes('2026-11-16-dynamax-trails'));
  assert.ok(teaser.related_event_ids.includes('2026-11-21-eternamax-eternatus-max-battles'));

  assert.equal(new Set(records20261113b.map(e => e.id)).size, records20261113b.length);
  assert.equal(records20261113b.filter(e => e.audit?.editorial_detail_pending === true).length, 0);
});
