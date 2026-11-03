'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const events=JSON.parse(read('spidey-app/data/events.json')).events;
const e=events.find(x=>x.id==='2026-11-02-trainer-profile-buddy-backgrounds-2026');

test('Perfil do Treinador informa as duas fases da liberação sem inventar confirmação oficial',()=>{
 assert(e);
 assert.equal(e.status,'published');
 assert.equal(e.content_type,'news');
 assert.equal(e.category,'community_discovery');
 assert.equal(e.source.confidence,'community');
 assert.equal(e.news.published_on,'2026-11-02');
 assert.match(e.news.label,/COMUNIDADE.*CONFIRMAR/);
 assert.match(e.news.summary,/6\/11.*10h locais.*9\/11.*10h locais/);
 assert.match(e.summary,/Sendai.*Cidade do México/);
 assert(e.notes.some(t=>t.includes('VISIBILIDADE PARA AMIGOS')));
 assert(e.notes.some(t=>t.includes('não confirma esses horários')));
 assert(!e.notes.some(t=>/confirmado oficialmente em 6 e 9/i.test(t)));
});

test('Novidade não cria compromisso de calendário nem notificação indevida',()=>{
 assert.equal(e.calendar.mode,'hidden');
 assert.equal(e.notifications.enabled,false);
 assert.equal(e.presentation.requires_art,false);
 assert(!e.art?.url && !e.art?.file);
 const ids=events.map(x=>x.id);
 assert.equal(ids.filter(id=>id===e.id).length,1);
});

test('Artigo aparece em Novidades Premium na categoria da comunidade',()=>{
 const ctx={window:{},document:{readyState:'loading',addEventListener(){}},URL,Date,Intl,Map,console};
 vm.createContext(ctx);
 vm.runInContext(read('spidey-app/news-feed.js'),ctx);
 vm.runInContext(read('spidey-app/news-premium-20261102.js'),ctx);
 const now=new Date('2026-11-02T21:00:00-03:00');
 const groups=ctx.window.SpideyNewsPremium.chooseGroups(events.filter(x=>x.status==='published'),now);
 const article=groups.find(g=>g.event.id===e.id);
 assert(article,'Relato precisa aparecer nas Novidades desta semana');
 assert(groups.indexOf(article)<22,'Deve estar visível entre os primeiros cartões');
 assert.equal(article.event.source.confidence,'community');
});
