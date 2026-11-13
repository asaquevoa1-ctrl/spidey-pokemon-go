const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('spidey-app/app.js','utf8');
const weekly=fs.readFileSync('spidey-app/weekly.js','utf8');
const dateOnly=fs.readFileSync('spidey-app/date-only.js','utf8');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const context={window:{},Date,Number,Boolean,Intl,URL,Map};
vm.createContext(context);
vm.runInContext(dateOnly,context);
vm.runInContext(fs.readFileSync('spidey-app/news-feed.js','utf8'),context);
context.getBrazilRange=e=>({start:new Date(e.schedule?.start_brazil||e.schedule?.start_local),end:new Date(e.schedule?.end_brazil||e.schedule?.end_local)});
const fn=app.slice(app.indexOf('function eventVisibleInPublicAgenda'),app.indexOf('function isEventActive'));
assert.ok(fn.startsWith('function eventVisibleInPublicAgenda'));
vm.runInContext(fn,context);
const visible=context.eventVisibleInPublicAgenda;
const when=new Date('2026-10-15T20:49:00-03:00');
test('expired September and October events are hidden but kept in the source catalog',()=>{
  const ended=events.filter(e=>e.status==='published'&&e.content_type!=='news'&&
    e.schedule?.end_brazil&&new Date(e.schedule.end_brazil)<=when);
  assert.ok(ended.length>=80,'must audit all historical events (was '+ended.length+')');
  for(const item of ended)assert.equal(visible(item,when),false,'expired: '+item.id);
  assert.ok(events.some(e=>e.id==='2026-09-gible-community-day-classic'),'history must not be deleted');
});
test('active, upcoming, date-only and news all honor their appropriate boundaries',()=>{
  const active=events.find(e=>e.id==='2026-10-raids-dialga');
  assert.equal(visible(active,when),true);
  const future=events.find(e=>e.id==='2026-10-24-fc-seoul');
  assert.equal(visible(future,when),true);
  const date=JSON.parse(fs.readFileSync('tests/fixtures/nfl-retired-20261011.json','utf8')).event;
  assert.equal(visible(date,new Date('2026-10-12T06:50:00Z')),true);
  assert.equal(visible(date,new Date('2026-10-12T08:30:00Z')),false);
  const news=events.find(e=>e.content_type==='news'&&e.status==='published');
  assert.equal(visible(news,when),true,'news archive must remain');
  assert.equal(visible(events.find(e=>e.id==='2026-10-26-eternatus-teaser-unconfirmed'),when),false,'superseded teaser stays in source history, not current News');
});
test('unfinished schedule does not remain advertised as active',()=>{
  assert.equal(visible({status:'published',schedule:{}},when),false);
  assert.equal(visible({status:'draft',schedule:{end_brazil:'2027-01-01T00:00:00-03:00'}},when),false);
  assert.equal(visible({status:'published',schedule:{end_brazil:'2026-10-15T20:48:00-03:00'}},when),false);
  assert.equal(visible({status:'published',schedule:{end_brazil:'2026-10-15T20:50:00-03:00'}},when),true);
});
test('UI actively prunes concluded events every minute, including when offline or in an old browser tab',()=>{
  assert.match(app,/function pruneExpiredPublicEvents\(\)/);
  assert.match(app,/setInterval\(\(\) => \{\s*if \(document\.visibilityState === 'visible'\) pruneExpiredPublicEvents\(\);\s*\}, 60 \* 1000\)/);
  assert.match(app,/function refreshContent\(\) \{\s*\/\/[^\n]*\n  pruneExpiredPublicEvents\(\);/);
  assert.match(app,/const sorted = events\.filter\(event => event\.content_type !== 'news' && eventVisibleInPublicAgenda\(event, now\)\)/);
  assert.match(weekly,/if\(event\)return eventVisibleInPublicAgenda\(event,now\)/);
  assert.doesNotMatch(app,/state\.events\s*=\s*eventsData\.events\s*;/);
});


const newsApi=context.window.SpideyNews;
const newsRange=e=>e.schedule?.precision==='date'
  ? context.window.SpideyDateOnly.bounds(e)
  : context.getBrazilRange(e);

test('Novidades encerra eventos com hora exatamente no instante final',()=>{
  const event={id:'boundary-hour',status:'published',source:{url:'https://pokemongo.com/news/boundary-hour'},
    schedule:{start_brazil:'2026-11-12T18:00:00-03:00',end_brazil:'2026-11-12T19:00:00-03:00'},
    news:{title:'Janela de teste',summary:'Teste de fronteira',published_on:'2026-11-12'}};
  assert.equal(newsApi.build([event],newsRange,new Date('2026-11-12T18:59:59.999-03:00')).length,1);
  assert.equal(newsApi.build([event],newsRange,new Date('2026-11-12T19:00:00-03:00')).length,0);
});

test('Novidades respeita o último dia civil no fuso IANA, não o fuso de Brasília',()=>{
  const event={id:'london-date-only',status:'published',source:{url:'https://pokemongo.com/news/london-date-only'},
    schedule:{precision:'date',start_date:'2026-11-10',end_date:'2026-11-10',local_timezone:'Europe/London'},
    news:{title:'Encontro em Londres',summary:'Data sem hora',published_on:'2026-11-10'}};
  const bounds=context.window.SpideyDateOnly.bounds(event);
  assert.equal(bounds.start.toISOString(),'2026-11-10T00:00:00.000Z');
  assert.equal(bounds.end.toISOString(),'2026-11-11T00:00:00.000Z');
  assert.equal(newsApi.build([event],newsRange,new Date('2026-11-10T23:59:59.999Z')).length,1);
  assert.equal(newsApi.build([event],newsRange,new Date('2026-11-11T00:00:00Z')).length,0);
});

test('Leônidas e Geminidas permanecem duas janelas de um único artigo Minior',()=>{
  const minior=events.filter(e=>['2026-11-minior-leonids','2026-12-minior-geminids'].includes(e.id));
  assert.equal(minior.length,2);
  const stories=newsApi.build(minior,newsRange,new Date('2026-11-12T20:00:00-03:00'));
  assert.equal(stories.length,1);
  assert.equal(stories[0].events.length,2);
  assert.deepEqual(new Set(stories[0].events.map(e=>e.id)),new Set(['2026-11-minior-leonids','2026-12-minior-geminids']));
});


test('eventos locais sem hora permanecem até o fim do último dia no fuso IANA',()=>{
  const event={id:'seoul-date-only',schedule:{precision:'date',start_date:'2026-11-14',end_date:'2026-11-15',local_timezone:'Asia/Seoul'}};
  assert.equal(context.window.SpideyDateOnly.status(event,new Date('2026-11-15T14:59:59Z')),'Hoje · horário a confirmar');
  assert.equal(context.window.SpideyDateOnly.status(event,new Date('2026-11-15T15:00:00Z')),'Data encerrada');
});


test('Into the Wild and Mexico City leave current surfaces at their exact local end', () => {
  const into = events.find(e => e.id === '2026-11-09-into-the-wild');
  assert.equal(visible(into,new Date('2026-11-13T19:59:59.999-03:00')),true);
  assert.equal(visible(into,new Date('2026-11-13T20:00:00-03:00')),false);
  assert.equal(newsApi.build([into],newsRange,new Date('2026-11-13T19:59:59.999-03:00')).length,1);
  assert.equal(newsApi.build([into],newsRange,new Date('2026-11-13T20:00:00-03:00')).length,0);

  const mexico = events.find(e => e.id === '2026-11-go-wild-area-mexico-city');
  assert.equal(visible(mexico,new Date('2026-11-08T17:59:59-06:00')),true);
  assert.equal(visible(mexico,new Date('2026-11-08T18:00:00-06:00')),false);
  assert.equal(newsApi.build([mexico],newsRange,new Date('2026-11-13T02:59:11-03:00')).length,0);
});


test('GO Pass, Boston and TCG claim windows expire at their exact local boundaries', () => {
  const noCap = events.find(e => e.id === '2026-11-go-pass-groudon-unlimited-points');
  assert.equal(visible(noCap,new Date('2026-11-28T00:00:00-03:00')),true);
  assert.equal(visible(noCap,new Date('2026-11-29T23:58:59-03:00')),true);
  assert.equal(visible(noCap,new Date('2026-11-29T23:59:01-03:00')),false);

  const goClaim = events.find(e => e.id === '2026-11-go-pass-groudon-claim-window');
  assert.equal(visible(goClaim,new Date('2026-12-01T10:00:00-03:00')),true);
  assert.equal(visible(goClaim,new Date('2026-12-03T10:00:00-03:00')),false);

  const boston = events.find(e => e.id === '2026-10-city-safari-boston-research-claim-window');
  assert.equal(visible(boston,new Date('2028-10-23T23:59:59-04:00')),true);
  assert.equal(visible(boston,new Date('2028-10-24T00:00:00-04:00')),false);

  const tcg = events.find(e => e.id === '2026-09-tcg-30th-research-claim-deadline');
  assert.equal(visible(tcg,new Date('2026-11-20T21:59:59.999-03:00')),true);
  assert.equal(visible(tcg,new Date('2026-11-20T22:00:00-03:00')),false);

  const goParent = events.find(e => e.id === '2026-11-go-pass-groudon');
  assert.equal(newsApi.build([goParent,noCap,goClaim],newsRange,new Date('2026-11-13T02:59:11-03:00')).length,1);
  const bostonParent = events.find(e => e.id === '2026-10-city-safari-boston-rescheduled');
  assert.equal(newsApi.build([bostonParent,boston],newsRange,new Date('2026-11-13T02:59:11-03:00')).length,1);
  const tcgParent = events.find(e => e.id === '2026-09-tcg-30th-us-retail');
  assert.equal(newsApi.build([tcgParent,tcg],newsRange,new Date('2026-11-13T02:59:11-03:00')).length,1);
});
