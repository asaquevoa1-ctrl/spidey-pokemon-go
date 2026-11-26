'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const byId=id=>events.find(event=>event.id===id);
const queue=relative=>JSON.parse(fs.readFileSync(path.join('queue','pending',relative),'utf8'));

test('official GBL support update remains news-only and does not invent a release date',()=>{
 const news=byId('official-news-go-battle-league-known-issues-20261125');
 assert(news);
 assert.equal(news.content_type,'news');
 assert.equal(news.calendar.mode,'hidden');
 assert.equal(news.schedule,undefined);
 assert.equal(news.source.confidence,'official');
 assert.equal(news.presentation.requires_art,false);
 assert.equal(news.notifications.enabled,false);
 assert.equal(news.audit.editorial_detail_pending,false);
 assert.equal(news.audit.full_article_reviewed,true);
 assert.equal(news.audit.no_release_date_inferred,true);
 assert.match(news.notes.join(' '),/não informa o número nem a data da versão futura/i);
});

test('support statuses are factual and keep investigation, future fix and resolution distinct',()=>{
 const text=byId('official-news-go-battle-league-known-issues-20261125').notes.join(' ');
 assert.match(text,/Em investigação: condições adversas de rede/i);
 assert.match(text,/Corrigidos em versão futura:/i);
 assert.match(text,/Resolvidos:/i);
 for(const forbidden of ['versão 0.','lançamento em 26/11','correção garantida em dezembro']) assert.doesNotMatch(text,new RegExp(forbidden,'i'));
});

test('new collector records are integrated or linked to canonical stories',()=>{
 const expected={
  '2026-11-26/datamine-pokeminers-b72d267661d5.json':['integrado','official-news-go-battle-league-known-issues-20261125'],
  '2026-11-26/oficial-noticia-5b61119da278.json':['integrado','official-news-gigantamax-inteleon-max-battle-day-2026'],
  '2026-11-26/the-secret-agent-pokemon-is-on-a-big-mission-report-for-duty-on-gigant-5fe550f0a849.json':['duplicado','official-news-gigantamax-inteleon-max-battle-day-2026'],
  '2026-11-26/g47ix-noticia-091183ebb973.json':['duplicado','official-news-gigantamax-inteleon-max-battle-day-2026'],
  '2026-11-26/oficial-noticia-6fd534363b54.json':['integrado','official-news-pokemon-champions-celebration-2026'],
  '2026-11-26/get-ready-for-the-pokemon-champions-celebration-event-fd1224ac1b8b.json':['duplicado','official-news-pokemon-champions-celebration-2026'],
  '2026-11-26/g47ix-noticia-7d9538f78e62.json':['duplicado','official-news-pokemon-champions-celebration-2026']
 };
 for(const [file,[status,related]] of Object.entries(expected)){
  const item=queue(file);
  assert.equal(item.status,status,file);
  assert.equal(item.related_event_id,related,file);
  assert.equal(item.editorial_detail_pending,false,file);
 }
});

test('older rolling-page collector item stays archived and linked instead of being deleted',()=>{
 const old=queue('2026-11-07/datamine-pokeminers-ffdec8024ee7.json');
 assert.equal(old.status,'arquivado');
 assert.equal(old.etapa_editorial,'substituido_por_atualizacao_confirmada');
 assert.equal(old.related_event_id,'official-news-go-battle-league-known-issues-20261125');
 assert.equal(old.editorial_detail_pending,false);
});
