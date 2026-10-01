const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context=vm.createContext({window:{},URL,Date,Map,Math});
vm.runInContext(fs.readFileSync('spidey-app/news-feed.js','utf8'),context);
const build=context.window.SpideyNews.build,events=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
const range=e=>({start:new Date(e.schedule.start_brazil),end:new Date(e.schedule.end_brazil)});
test('one Minior announcement opens all three distinct calendar windows without merging community events',()=>{
 const stories=build(events,range,new Date('2026-10-01T22:00Z'));
 const minior=stories.filter(s=>s.events.some(e=>e.id.includes('minior-')));
 assert.equal(minior.length,1);assert.equal(minior[0].events.length,3);
 assert.deepEqual(Array.from(minior[0].events,e=>e.id),['2026-10-minior-orionids','2026-11-minior-leonids','2026-12-minior-geminids']);
 const community=events.filter(e=>e.source?.url==='https://pokemongohub.net/post/event/october-2026-events/'&&range(e).end>=new Date('2026-10-01T22:00Z'));
 assert.ok(community.length>1);for(const e of community)assert.equal(stories.find(s=>s.events.some(x=>x.id===e.id)).events.length,1);
 assert.ok(stories.slice(0,3).some(s=>s.event.id==='2026-10-dynamax-max-battle-day'));
 assert.ok(stories.slice(0,3).some(s=>s.event.id==='2026-10-patterns-of-the-wild-indonesia'));
});
test('an expired Minior window drops out while later windows and announcement remain accessible',()=>{
 const minior=build(events,range,new Date('2026-11-01T12:00Z')).find(s=>s.key==='official:/news/minior-meteor-showers-2026');
 assert.equal(minior.events.length,2);assert.equal(minior.events[0].id,'2026-11-minior-leonids');
 assert.equal(minior.title,'Minior chega com as chuvas de meteoros');
});
test('official locale/tracking variants deduplicate; unsafe or unpublished entries stay out',()=>{
 const e=events.find(e=>e.id==='2026-10-minior-orionids');
 const clone={...e,id:'alternate',source:{...e.source,url:'https://pokemongolive.com/pt-BR/news/minior-meteor-showers-2026/?utm_source=test#top'}};
 assert.equal(build([e,clone],range,new Date('2026-10-01')).length,1);
 assert.equal(build([{...e,status:'draft'},{...e,source:{url:'javascript:alert(1)'}}],range,new Date('2026-10-01')).length,0);
});
