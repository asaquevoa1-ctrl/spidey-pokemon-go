'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const events=JSON.parse(read('spidey-app/data/events.json')).events;
const e=events.find(x=>x.id==='2026-11-02-trainer-profile-buddy-backgrounds-2026');
const official=events.find(x=>x.id==='official-news-auto-5e1b1cd68f6c');

test('Relato comunitário é preservado e ligado ao anúncio oficial que confirmou as duas fases',()=>{
 assert(e);
 assert.equal(e.status,'archived');
 assert.equal(e.content_type,'news');
 assert.equal(e.category,'community_discovery');
 assert.equal(e.source.confidence,'community');
 assert.equal(e.news.published_on,'2026-11-02');
 assert.match(e.news.label,/HISTÓRICO.*CONFIRMADO/);
 assert.match(e.news.summary,/6\/11.*10h locais.*9\/11.*10h locais/);
 assert.equal(e.superseded_by,official.id);
 assert.equal(e.audit.confirmed_by_official_announcement,true);
 assert(official);
 assert.equal(official.status,'published');
 assert.equal(official.source.confidence,'official');
 assert.equal(official.audit.editorial_detail_pending,false);
 assert.match(official.news.summary,/6\/11.*10h locais.*9\/11.*10h locais/);
 assert(official.notes.some(t=>t.includes('Amigos só veem o fundo')));
});

test('Novidade não cria compromisso de calendário nem notificação indevida',()=>{
 assert.equal(e.calendar.mode,'hidden');
 assert.equal(e.notifications.enabled,false);
 assert.equal(e.presentation.requires_art,false);
 assert(!e.art?.url && !e.art?.file);
 const ids=events.map(x=>x.id);
 assert.equal(ids.filter(id=>id===e.id).length,1);
});

test('Novidades mostra somente a história oficial, sem duplicar o relato arquivado',()=>{
 const ctx={window:{},document:{readyState:'loading',addEventListener(){}},URL,Date,Intl,Map,console};
 vm.createContext(ctx);
 vm.runInContext(read('spidey-app/news-feed.js'),ctx);
 vm.runInContext(read('spidey-app/news-premium-20261102.js'),ctx);
 const now=new Date('2026-11-02T21:00:00-03:00');
 const groups=ctx.window.SpideyNewsPremium.chooseGroups(events.filter(x=>x.status==='published'),now);
 const article=groups.find(g=>g.event.id===official.id);
 assert(article,'Anúncio oficial precisa aparecer nas Novidades desta semana');
 assert.equal(groups.some(g=>g.event.id===e.id),false);
 assert.equal(article.event.source.confidence,'official');
});
