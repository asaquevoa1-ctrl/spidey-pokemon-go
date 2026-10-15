const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('spidey-app/app.js','utf8');
const weekly=fs.readFileSync('spidey-app/weekly.js','utf8');
const dateOnly=fs.readFileSync('spidey-app/date-only.js','utf8');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const context={window:{},Date,Number,Boolean,Intl};
vm.createContext(context);
vm.runInContext(dateOnly,context);
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
  const date=events.find(e=>e.id==='2026-10-11-nfl-cardinals-pokemon-go-day');
  assert.equal(visible(date,new Date('2026-10-12T06:50:00Z')),true);
  assert.equal(visible(date,new Date('2026-10-12T08:30:00Z')),false);
  const news=events.find(e=>e.content_type==='news');
  assert.equal(visible(news,when),true,'news archive must remain');
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
