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
 assert.ok(stories.some(s=>s.event.id==='2026-10-dynamax-max-battle-day'));
 assert.ok(stories.some(s=>s.event.id==='2026-10-patterns-of-the-wild-indonesia'));
 for(let i=1;i<stories.length;i++)assert.ok(stories[i-1].updated>=stories[i].updated);
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

test('Halloween teaser stays separate from the community calendar and invents no Pokémon, costumes or bonuses',()=>{
 const event=JSON.parse(fs.readFileSync('tests/fixtures/halloween-community-teaser.json'));
 // Fixed historical preview: the live catalog is allowed to gain official details later.
 const story=build([event,...events.filter(e=>e.id!==event.id)],range,new Date('2026-10-04T20:00Z')).find(item=>item.events.some(e=>e.id===event.id));
 assert.ok(story,'The Halloween teaser must remain accessible when newer announcements arrive');
 assert.equal(story.event.id,event.id);
 assert.match(story.summary,/aguardam confirmação/);
 assert.equal(event.news.source.confidence,'community');
 assert.match(event.news.source.url,/pokemongoappmirror/);
 assert.equal(event.source.url,'https://pokemongohub.net/post/event/october-2026-events/');
 assert.equal(event.schedule.start_local,'2026-10-27T10:00:00-03:00');
 assert.equal(event.schedule.end_local,'2026-10-31T20:00:00-03:00');
 assert.equal(event.pokemon?.length||0,0);assert.equal(event.bonuses?.length||0,0);
});

test('official Boston, Night Out and TCG announcements are available without merging unrelated events',()=>{
 const stories=build(events,range,new Date('2026-10-04T20:00Z'));
 for(const id of ['2026-10-city-safari-boston-rescheduled','2026-10-pokemon-night-out-twitch','2026-09-tcg-30th-us-retail']){
  const story=stories.find(item=>item.events.some(event=>event.id===id));
  assert.ok(story,id);
  assert.equal(story.events.length,1,id);
  assert.equal(story.event.source.confidence,'official',id);
 }
});
