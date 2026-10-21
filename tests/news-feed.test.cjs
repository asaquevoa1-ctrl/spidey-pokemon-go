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

test('the confirmed Halloween Part II supersedes its community preview and keeps pass bonuses conditional',()=>{
 const e=events.find(e=>e.id==='2026-11-halloween-part-2');
 assert.equal(e.source.confidence,'official');
 assert.equal(e.source.url,'https://pokemongo.com/pt-BR/news/halloween-part-2-2026');
 assert.equal(e.schedule.start_local,'2026-11-01T10:00:00-03:00');
 assert.equal(e.schedule.end_local,'2026-11-05T20:00:00-03:00');
 assert.ok(!e.title.includes('em confirmação'));
 assert.ok(e.pokemon.some(p=>p.name==='Greavard'&&p.note.includes('Brilhante')));
 assert.ok(e.pokemon.some(p=>p.name==='Mega Sableye'&&p.note.includes('Sombra Noturna+')));
 assert.match(e.bonuses[0],/Ranque 10/);assert.match(e.bonuses[1],/Ranque 20/);
 assert.equal(e.gpx.enabled,false);
 const story=build(events,range,new Date('2026-10-11T22:00:00Z')).find(s=>s.events.some(x=>x.id===e.id));
 assert.ok(story);assert.equal(story.event.source.confidence,'official');
});

test('undated news stays in News and never becomes a calendar event',()=>{
 const stories=build(events,range,new Date('2026-10-11T22:00:00Z'));
 for(const id of ['2026-10-08-gameplay-quality-of-life','2026-10-08-dynamax-forms-datamine']){
  const event=events.find(e=>e.id===id),story=stories.find(s=>s.events.some(e=>e.id===id));
  assert.ok(event&&story,id);assert.equal(event.content_type,'news');assert.equal(event.calendar.mode,'hidden');
  assert.equal(event.schedule,undefined);assert.equal(event.notifications.enabled,false);
 }
 const datamine=events.find(e=>e.id==='2026-10-08-dynamax-forms-datamine');
 assert.equal(datamine.source.confidence,'community');assert.match(datamine.summary,/confirmar/i);
});

test('Mega Chandelure keeps the existing calendar identity and publishes the official reveal in News',()=>{
 const event=events.find(e=>e.id==='2026-10-super-mega-raid-day');
 assert.equal(event.slug,event.id);assert.equal(event.source.confidence,'official');
 assert.match(event.source.url,/chandelure-super-mega-raid-day-2026/);
 assert.equal(event.schedule.start_local,'2026-10-31T14:00:00-03:00');
 assert.equal(event.schedule.end_local,'2026-10-31T17:00:00-03:00');
 assert.ok(event.pokemon.some(p=>p.name==='Mega Chandelure'));
 assert.ok(event.bonuses.some(b=>/seis Passes de Reide gratuitos/.test(b)));
 assert.ok(event.bonuses.some(b=>/^Ingresso pago:/.test(b)));
 assert.equal(event.gpx.enabled,false);assert.equal(event.presentation.requires_art,false);
 const story=build(events,range,new Date('2026-10-13T22:00:48Z')).find(s=>s.events.some(e=>e.id===event.id));
 assert.ok(story);assert.match(story.title,/Mega Chandelure/);assert.equal(story.events.length,1);
});


test('curated 24 October guide stays separate from official Dynamax announcement despite sharing its primary source',()=>{
 const stories=build(events,range,new Date('2026-10-21T12:00Z'));
 const guide=stories.filter(story=>story.events.some(e=>e.id==='2026-10-24-spidey-full-day-guide'));
 const official=stories.filter(story=>story.events.some(e=>e.id==='2026-10-dynamax-max-battle-day'));
 assert.equal(guide.length,1);
 assert.equal(official.length,1);
 assert.notEqual(guide[0].key,official[0].key);
 assert.equal(guide[0].events.length,1,'guide stays a standalone editorial story');
 assert.ok(guide[0].event.source.url.startsWith('https://pokemongo.com/news/'));
});
