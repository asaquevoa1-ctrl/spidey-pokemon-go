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

test('recent announcements without confirmed dates appear without creating calendar events',()=>{
 const articles=JSON.parse(fs.readFileSync('spidey-app/data/news.json')).articles;
 const before=JSON.stringify(events);
 const stories=build(events,range,new Date('2026-10-08T00:00Z'),articles);
 const eternatus=stories.find(story=>story.event.id==='2026-10-07-eternatus-return-preview');
 assert.ok(eternatus);
 assert.equal(eternatus.event.source.confidence,'datamine');
 assert.equal(eternatus.events.length,0);
 assert.equal(eternatus.event.schedule,undefined);
 assert.match(eternatus.summary,/não foi confirmada/);
 assert.equal(JSON.stringify(events),before);
});

test('official Halloween image and the existing community event share one story while keeping their different confidence',()=>{
 const articles=JSON.parse(fs.readFileSync('spidey-app/data/news.json')).articles;
 const stories=build(events,range,new Date('2026-10-08T00:00Z'),articles);
 const linked=stories.filter(story=>story.events.some(event=>event.id==='2026-11-halloween-part-2'));
 assert.equal(linked.length,1);
 assert.equal(linked[0].event.source.confidence,'official');
 assert.equal(linked[0].events[0].source.confidence,'community');
 assert.equal(linked[0].media.classification,'official_teaser');
 const image=fs.readFileSync('spidey-app/'+linked[0].media.file);
 assert.equal(require('node:crypto').createHash('sha256').update(image).digest('hex'),linked[0].media.sha256);
 assert.ok(stories.some(story=>story.events.some(event=>event.id==='2026-10-halloween-part-1')));
});

test('drafts, future posts and unsafe news URLs stay out of the public feed',()=>{
 const article=JSON.parse(fs.readFileSync('spidey-app/data/news.json')).articles[1];
 for(const change of [{status:'draft'},{published_at:'2027-01-01'},{source:{url:'javascript:alert(1)'}},{published_at:'invalid'}]){
  const stories=build([],range,new Date('2026-10-08T00:00Z'),[{...article,...change}]);
  assert.equal(stories.length,0);
 }
});

test('Wild Area news groups eight daily windows and keeps crowned raids separate from global Kyurem raids',()=>{
 const articles=JSON.parse(fs.readFileSync('spidey-app/data/news.json')).articles;
 const stories=build(events,range,new Date('2026-10-08T00:00Z'),articles);
 const story=stories.find(item=>item.event.id==='2026-10-07-go-wild-area-new-pokemon');
 assert.equal(story.events.length,8);
 assert.equal(story.event.source.confidence,'official');
 assert.equal(story.relatedSources.length,2);
 const sendai=story.events.find(e=>e.id==='2026-11-go-wild-area-sendai-06');
 assert.equal(sendai.schedule.start_brazil,'2026-11-05T22:00:00-03:00');
 assert.equal(sendai.schedule.end_brazil,'2026-11-06T06:00:00-03:00');
 assert.ok(sendai.pokemon.some(p=>p.name==='Zacian Espada Coroada'));
 assert.ok(!sendai.pokemon.some(p=>p.name.includes('Kyurem')));
 const saturday=story.events.find(e=>e.id==='2026-11-go-wild-area-global-14');
 const sunday=story.events.find(e=>e.id==='2026-11-go-wild-area-global-15');
 assert.ok(saturday.pokemon.some(p=>p.name==='Kyurem Branco'));
 assert.ok(sunday.pokemon.some(p=>p.name==='Kyurem Preto'));
 assert.ok(!saturday.pokemon.some(p=>p.name.includes('Coroada')));
 for(const e of story.events){
  assert.equal(range(e).end-range(e).start,8*3600000);
  assert.equal(e.notifications.enabled,false);
 }
});

test('GO Lab news opens the regional event without adding an unconfirmed global calendar window',()=>{
 const articles=JSON.parse(fs.readFileSync('spidey-app/data/news.json')).articles;
 const story=build(events,range,new Date('2026-10-08T00:00Z'),articles).find(item=>item.event.id==='2026-10-07-pokemon-go-lab-return');
 assert.equal(story.event.source.confidence,'community');
 assert.equal(story.events.length,0);
 assert.deepEqual(Array.from(story.localEventIds),['2026-10-pokemon-go-lab-big-adventure']);
 assert.match(story.details.join(' '),/aguardam confirmação/);
});
