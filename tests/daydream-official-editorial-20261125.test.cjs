'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const byId=id=>events.find(event=>event.id===id);

test('all automatic official headlines have full editorial review',()=>{
  const ids=['official-news-auto-3ecb87a52d86','official-news-auto-e64ac0063928','official-news-auto-265735736d49','official-news-auto-b07016703fe4','official-news-auto-51ffde89c630'];
  for(const id of ids){
    const item=byId(id);
    assert(item,id);
    assert.equal(item.audit.editorial_detail_pending,false,id);
    assert.equal(item.audit.classification,'official_announcement_editorially_verified',id);
    assert.equal(item.audit.full_article_reviewed,true,id);
  }
  assert.deepEqual(events.filter(item=>item.audit?.editorial_detail_pending===true),[]);
});

test('December Community Day keeps the two main days and extended window separate',()=>{
  const saturday=byId('2026-12-12-community-day-save-date');
  const sunday=byId('2026-12-13-community-day-sunday');
  const extended=byId('2026-12-12-community-day-extended-bonuses');
  assert.equal(saturday.schedule.start_local,'2026-12-12T14:00:00-03:00');
  assert.equal(saturday.schedule.end_local,'2026-12-12T17:00:00-03:00');
  assert.deepEqual(saturday.pokemon.map(x=>x.name),['Vulpix','Vulpix de Alola','Grookey','Scorbunny','Lechonk','Tinkatink','Piplup']);
  assert.equal(sunday.schedule.start_local,'2026-12-13T14:00:00-03:00');
  assert.equal(sunday.schedule.end_local,'2026-12-13T17:00:00-03:00');
  assert.deepEqual(sunday.pokemon.map(x=>x.name),['Zorua','Pawniard','Sobble','Nickit','Frigibax','Gible','Deino']);
  assert.equal(extended.schedule.start_local,'2026-12-12T09:00:00-03:00');
  assert.equal(extended.schedule.end_local,'2026-12-13T21:00:00-03:00');
});

test('Choose Your Path preserves four official expiration windows',()=>{
  const ids=['2026-12-15-choose-your-path','2027-01-12-choose-your-path','2027-01-26-choose-your-path','2027-02-16-choose-your-path'];
  assert.deepEqual(ids.map(id=>byId(id).schedule.end_local),[
    '2026-12-21T20:00:00-03:00','2027-01-18T20:00:00-03:00','2027-02-01T20:00:00-03:00','2027-02-21T20:00:00-03:00'
  ]);
  for(const id of ids){
    assert.equal(byId(id).source.confidence,'official');
    assert.match(byId(id).notes.join(' '),/fuso em que a pesquisa foi originalmente recebida/i);
  }
});

test('GO Pass main, claim and Timed Incubator deadlines stay distinct',()=>{
  const pass=byId('2026-12-go-pass-kyurem');
  const claim=byId('2027-01-05-go-pass-december-claim-window');
  const incubator=byId('2027-01-12-timed-incubator-expiry');
  assert.equal(pass.schedule.end_local,'2027-01-05T10:00:00-03:00');
  assert.equal(claim.schedule.end_local,'2027-01-07T10:00:00-03:00');
  assert.equal(incubator.schedule.end_local,'2027-01-12T10:00:00-03:00');
  assert.match(pass.pokemon[0].note,/sem garantia/i);
  assert.match(pass.notes.join(' '),/US\$ 7,99/);
});

test('GBL has thirteen non-overlapping official rotations',()=>{
  const ids=byId('official-news-auto-e64ac0063928').related_event_ids;
  assert.equal(ids.length,13);
  const windows=ids.map(id=>byId(id).schedule);
  for(let i=1;i<windows.length;i++) assert.equal(windows[i-1].end_local,windows[i].start_local);
  assert.equal(windows[0].start_local,'2026-12-01T18:00:00-03:00');
  assert.equal(windows.at(-1).end_local,'2027-03-02T18:00:00-03:00');
});

test('date-only official placeholders expire after the final IANA day',()=>{
  const window={};
  vm.runInContext(fs.readFileSync('spidey-app/date-only.js','utf8'),vm.createContext({window,Date,Intl,Object}));
  const event=byId('2026-12-22-winter-holiday');
  assert.match(window.SpideyDateOnly.status(event,new Date('2026-12-29T02:59:59Z')),/Hoje|Em andamento/);
  assert.equal(window.SpideyDateOnly.status(event,new Date('2026-12-29T03:00:00Z')),'Data encerrada');
  assert.equal(event.pokemon,undefined);
  assert.equal(event.bonuses,undefined);
});

test('paid gifts remain news-only without a fabricated global date',()=>{
  const item=byId('2026-11-paid-gifts-regional-rollout');
  assert.equal(item.calendar.mode,'hidden');
  assert.equal(item.schedule,undefined);
  assert.match(item.summary,/Brasil ainda não foi anunciado/);
  assert.match(item.notes.join(' '),/20 presentes pagos por dia/);
});

test('collector queue is linked without pending editorial detail',()=>{
  const files=[
    'queue/pending/2026-11-24/share-the-joy-with-paid-gifts-coming-to-pokemon-go-702fb0a7f9dd.json',
    'queue/pending/2026-11-25/g47ix-noticia-5b24bc5042f6.json',
    'queue/pending/2026-11-25/oficial-noticia-234a6eb3d1b6.json',
    'queue/pending/2026-11-25/oficial-noticia-d0988074df17.json'
  ];
  for(const file of files){
    const item=JSON.parse(fs.readFileSync(file,'utf8'));
    assert.equal(item.editorial_detail_pending,false,file);
    assert(item.related_event_id,file);
    assert.notEqual(item.status,'aguardando_curadoria_premium',file);
  }
});
