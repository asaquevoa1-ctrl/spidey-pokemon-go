'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const byId=id=>events.find(event=>event.id===id);

test('Tropical Paradise upgrades the existing placeholder without changing its id',()=>{
  const event=byId('2026-12-01-tropical-paradise');
  assert(event);
  assert.equal(event.source.url,'https://pokemongo.com/pt-BR/news/tropical-paradise-2026');
  assert.equal(event.schedule.precision,undefined);
  assert.equal(event.schedule.start_local,'2026-12-01T10:00:00-03:00');
  assert.equal(event.schedule.end_local,'2026-12-07T20:00:00-03:00');
  assert.match(event.pokemon[0].note,/Brilhante, sem garantia/);
  assert.match(event.notes.join(' '),/Encharcar.*6 pontos/);
  assert.match(event.notes.join(' '),/Água Gelada\+.*45 pontos.*160 pontos/);
});

test('official story groups the main event, additional encounters and claim deadline',()=>{
  const news=byId('official-news-tropical-paradise-2026');
  assert.equal(news.content_type,'news');
  assert.equal(news.calendar.mode,'hidden');
  assert.equal(news.audit.full_article_reviewed,true);
  assert.equal(news.audit.editorial_detail_pending,false);
  assert.deepEqual(news.related_event_ids,[
    '2026-12-01-tropical-paradise',
    '2026-12-04-tropical-paradise-additional-wild',
    '2026-12-07-tropical-paradise-claim-window'
  ]);
});

test('distinct Tropical Paradise windows preserve their exact local boundaries',()=>{
  const additional=byId('2026-12-04-tropical-paradise-additional-wild');
  const claim=byId('2026-12-07-tropical-paradise-claim-window');
  assert.equal(additional.schedule.start_local,'2026-12-04T10:00:00-03:00');
  assert.equal(additional.schedule.end_local,'2026-12-07T20:00:00-03:00');
  assert.equal(claim.schedule.start_local,'2026-12-07T20:00:00-03:00');
  assert.equal(claim.schedule.end_local,'2026-12-09T20:00:00-03:00');
  assert.match(claim.notes[0],/não é uma extensão/i);
});

test('new collector items are linked and no longer await curation',()=>{
  const pairs=[
    ['queue/pending/2026-11-25/g47ix-noticia-c710a841436e.json','2026-12-01-tropical-paradise'],
    ['queue/pending/2026-11-25/oficial-noticia-bb27b0afcab5.json','2026-12-01-tropical-paradise'],
    ['queue/pending/2026-11-25/make-a-splash-during-the-tropical-paradise-event-in-pokemon-go-57ab9f69d030.json','2026-12-01-tropical-paradise'],
    ['queue/pending/2026-11-25/g47ix-evento-b0ffcc022b72.json','2026-11-26-spotlight-noibat']
  ];
  for(const [file,eventId] of pairs){
    const item=JSON.parse(fs.readFileSync(file,'utf8'));
    assert.equal(item.status,'duplicado');
    assert.equal(item.related_event_id,eventId);
    assert.equal(item.editorial_detail_pending,false);
  }
});

test('the official article does not create unannounced individual tasks',()=>{
  const event=byId('2026-12-01-tropical-paradise');
  assert.equal(event.field_research_tasks,undefined);
  assert.equal(event.go_pass_tasks,undefined);
  assert.match(event.notes.join(' '),/sem listar tarefas individuais/i);
});
