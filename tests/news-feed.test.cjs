const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context=vm.createContext({window:{},URL,Date,Map,Math,Intl,Object});
vm.runInContext(fs.readFileSync('spidey-app/date-only.js','utf8'),context);
vm.runInContext(fs.readFileSync('spidey-app/news-feed.js','utf8'),context);
const build=context.window.SpideyNews.build,events=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
const range=e=>{
 if(context.window.SpideyDateOnly?.valid(e))return context.window.SpideyDateOnly.bounds(e);
 const schedule=e.schedule||{};
 const start=Date.parse(schedule.start_brazil||schedule.start_local||'');
 const end=Date.parse(schedule.end_brazil||schedule.end_local||'');
 return {start:Number.isFinite(start)?new Date(start):null,end:Number.isFinite(end)?new Date(end):null};
};
test('one Minior announcement opens all three distinct calendar windows without merging community events',()=>{
 const stories=build(events,range,new Date('2026-10-01T22:00Z'));
 const minior=stories.filter(s=>s.events.some(e=>e.id.includes('minior-')));
 assert.equal(minior.length,1);assert.equal(minior[0].events.length,6);
 assert.deepEqual(Array.from(minior[0].events,e=>e.id),['2026-10-minior-orionids','2026-11-minior-leonids','2026-12-minior-geminids','2027-05-minior-eta-aquariids','2027-07-minior-southern-delta-aquariids','2027-08-minior-perseids']);
 const community=events.filter(e=>e.source?.url==='https://pokemongohub.net/post/event/october-2026-events/'&&range(e).end>=new Date('2026-10-01T22:00Z'));
 assert.ok(community.length>1);for(const e of community)assert.equal(stories.find(s=>s.events.some(x=>x.id===e.id)).events.length,1);
 assert.ok(stories.some(s=>s.event.id==='2026-10-dynamax-max-battle-day'));
 assert.ok(stories.some(s=>s.event.id==='2026-10-patterns-of-the-wild-indonesia'));
 for(let i=1;i<stories.length;i++)assert.ok(stories[i-1].updated>=stories[i].updated);
});
test('an expired Minior window drops out while later windows and announcement remain accessible',()=>{
 const minior=build(events,range,new Date('2026-11-01T12:00Z')).find(s=>s.key==='official:/news/minior-meteor-showers-2026');
 assert.equal(minior.events.length,5);assert.equal(minior.events[0].id,'2026-11-minior-leonids');
 assert.deepEqual(Array.from(minior.events,e=>e.id),['2026-11-minior-leonids','2026-12-minior-geminids','2027-05-minior-eta-aquariids','2027-07-minior-southern-delta-aquariids','2027-08-minior-perseids']);
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

test('undated current news stays in News while a confirmed discovery becomes historical',()=>{
 const stories=build(events,range,new Date('2026-10-11T22:00:00Z'));
 for(const id of ['2026-10-08-gameplay-quality-of-life']){
  const event=events.find(e=>e.id===id),story=stories.find(s=>s.events.some(e=>e.id===id));
  assert.ok(event&&story,id);assert.equal(event.content_type,'news');assert.equal(event.calendar.mode,'hidden');
  assert.equal(event.schedule,undefined);assert.equal(event.notifications.enabled,false);
 }
 const datamine=events.find(e=>e.id==='2026-10-08-dynamax-forms-datamine');
 assert.equal(datamine.source.confidence,'community');assert.equal(datamine.status,'archived');
 assert.equal(datamine.superseded_by,'2026-11-09-into-the-wild');
 assert.equal(stories.some(s=>s.events.some(e=>e.id===datamine.id)),false);
 assert.equal(datamine.calendar.mode,'hidden');assert.equal(datamine.schedule,undefined);
 assert.equal(datamine.notifications.enabled,false);
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


test('news-only announcements linked to expired windows leave current News while evergreen updates remain',()=>{
 const now=new Date('2026-11-13T08:22:57Z');
 const stories=build(events,range,now);
 for(const id of ['official-news-auto-3226a2a8b105','official-news-auto-1eda22614526']){
  assert.equal(stories.some(story=>story.events.some(event=>event.id===id)),false,id);
 }
 for(const id of ['official-news-auto-6e45ee38e2b8','official-news-auto-5e1b1cd68f6c','official-news-auto-8a38cf8f2093','2026-11-11-storage-cap-increase','2026-11-max-mondays-community-outlook']){
  assert.ok(stories.some(story=>story.events.some(event=>event.id===id)),id);
 }
});

test('an official notice remains through its last related event window and expires at the exact end',()=>{
 const before=build(events,range,new Date('2026-11-15T20:59:59Z'));
 assert.ok(before.some(story=>story.events.some(event=>event.id==='official-news-auto-2ff7990f7c9c')));
 const atEnd=build(events,range,new Date('2026-11-15T21:00:00Z'));
 assert.equal(atEnd.some(story=>story.events.some(event=>event.id==='official-news-auto-2ff7990f7c9c')),false);
});

test('Machamp research notice stays current through its separate completion deadline',()=>{
 const before=build(events,range,new Date('2026-11-16T02:58:59Z'));
 assert.ok(before.some(story=>story.events.some(event=>event.id==='official-news-auto-6e45ee38e2b8')));
 const atEnd=build(events,range,new Date('2026-11-16T02:59:00Z'));
 assert.equal(atEnd.some(story=>story.events.some(event=>event.id==='official-news-auto-6e45ee38e2b8')),false);
});

test('date-only related stories expire after the last IANA event day; unknown references do not invent an end',()=>{
 const before=build(events,range,new Date('2027-02-14T02:59:59Z'));
 assert.ok(before.some(story=>story.events.some(event=>event.id==='official-news-auto-8a38cf8f2093')));
 const atEnd=build(events,range,new Date('2027-02-14T03:00:00Z'));
 assert.equal(atEnd.some(story=>story.events.some(event=>event.id==='official-news-auto-8a38cf8f2093')),false);
 const missing={id:'test-missing-related-news',content_type:'news',status:'published',source:{url:'https://example.com/missing-related',confidence:'community'},related:['not-in-catalog'],news:{title:'Fonte comunitária a confirmar',summary:'Sem data oficial.'}};
 const withMissing=build([...events,missing],range,new Date('2026-11-13T08:22:57Z'));
 assert.ok(withMissing.some(story=>story.events.some(event=>event.id===missing.id)));
});


test('community-only November forecasts remain in News, not as dated calendar events',()=>{
 const ids=["2026-11-25-raids-deoxys-four-forms","2026-11-16-mega-banette-raids","2026-11-25-mega-metagross-raids","2026-11-18-raid-hour-cresselia-darkrai","2026-11-25-raid-hour-deoxys","2026-11-26-spotlight-noibat","2026-11-21-shadow-tornadus-weekend","2026-11-28-shadow-tornadus-weekend","2026-11-23-max-espurr","2026-11-30-max-cryogonal"];
 const storyId='2026-11-max-mondays-community-outlook';
 const story=events.find(e=>e.id===storyId);const superseded=events.find(e=>e.id==='2026-11-16-max-surprise');assert.equal(superseded?.status,'archived');assert.equal(superseded?.audit?.official_confirmation_found,true);assert.equal(superseded?.audit?.superseded_by_event_id,'2026-11-16-dynamax-trails');assert.equal(story?.related_event_ids?.includes('2026-11-16-max-surprise'),false);
 assert.ok(story);assert.equal(story.status,'published');assert.equal(story.content_type,'news');
 assert.equal(story.schedule,undefined);assert.equal(story.calendar?.mode,'hidden');
 assert.match(story.news?.label||'',/COMUNIDADE.*ESTREIA A CONFIRMAR/);
 assert.equal(story.source?.confidence,'verified_community');assert.equal(story.audit?.official_confirmation_found,false);
 assert.equal(story.audit?.calendar_entry_created,false);assert.equal(story.presentation?.requires_art,false);
 assert.equal(story.presentation?.fallback_visual,'spidey-logo');
 for(const id of ids){const event=events.find(e=>e.id===id);assert.ok(event,id);assert.equal(event.status,'archived',id);assert.equal(event.schedule,undefined,id);assert.equal(event.calendar?.mode,'hidden',id);assert.equal(event.audit?.linked_news_id,storyId,id);assert.ok(event.audit?.original_community_schedule,id);assert.equal(event.notifications?.enabled,false,id);assert.equal(event.gpx?.enabled,false,id);}
 const groups=build(events,range,new Date('2026-11-18T12:00:00Z'));
 assert.ok(groups.some(group=>group.events.some(event=>event.id===storyId)));
 for(const id of ids)assert.equal(groups.some(group=>group.events.some(event=>event.id===id)),false,id);
 assert.equal(events.find(e=>e.id==='2026-11-16-dynamax-trails')?.status,'published');
 assert.equal(events.find(e=>e.id==='2026-11-19-spotlight-galar-starters')?.status,'published');
});

test('Twilight Wishes has one story and distinct field-research and GO Pass claim windows',()=>{
 const ids=['2026-11-24-twilight-wishes-preview','2026-11-24-twilight-wishes-field-research-phase-1','2026-11-26-twilight-wishes-field-research-phase-2','2026-11-24-twilight-wishes-pass-claim-deadline'];
 const records=ids.map(id=>events.find(e=>e.id===id));
 for(const event of records){assert.ok(event);assert.equal(event.status,'published');assert.equal(event.source?.confidence,'official');assert.equal(event.source?.url,'https://pokemongo.com/pt-BR/news/twilight-wishes-2026');}
 const main=records[0],phase1=records[1],phase2=records[2],claim=records[3];
 assert.match(main.notes.join(' '),/Maschiff/);assert.match(main.notes.join(' '),/Mega Beedrill/);assert.match(main.notes.join(' '),/3× Poeira Estelar/);
 assert.deepEqual([phase1.schedule.start_local,phase1.schedule.end_local],['2026-11-24T10:00:00-03:00','2026-11-26T10:00:00-03:00']);
 assert.deepEqual([phase2.schedule.start_local,phase2.schedule.end_local],['2026-11-26T10:00:00-03:00','2026-11-30T20:00:00-03:00']);
 assert.deepEqual([claim.schedule.start_local,claim.schedule.end_local],['2026-11-24T10:00:00-03:00','2026-12-02T20:00:00-03:00']);
 const groups=build(events,range,new Date('2026-11-25T12:00:00Z'));
 const story=groups.find(group=>group.events.some(event=>event.id===main.id));assert.ok(story);
 for(const id of ids)assert.ok(story.events.some(event=>event.id===id),id);
 assert.equal(groups.filter(group=>group.events.some(event=>ids.includes(event.id))).length,1);
 const beforeEnd=build(events,range,new Date('2026-12-02T22:59:59Z'));
 const atEnd=build(events,range,new Date('2026-12-02T23:00:00Z'));
 assert.ok(beforeEnd.some(group=>group.events.some(event=>event.id===claim.id)));
 assert.equal(atEnd.some(group=>group.events.some(event=>event.id===claim.id)),false);
});


test('Clefable Super Mega Raid Day retains its three official windows and conditional bonuses',()=>{
 const main=events.find(e=>e.id==='2026-11-28-super-mega-raid-day-preview');
 const challenge=events.find(e=>e.id==='2026-11-27-clefable-global-challenge');
 const rewards=events.find(e=>e.id==='2026-11-30-clefable-global-rewards');
 assert.ok(main&&challenge&&rewards);
 assert.deepEqual([main.schedule.start_brazil,main.schedule.end_brazil],['2026-11-28T14:00:00-03:00','2026-11-28T17:00:00-03:00']);
 assert.deepEqual([challenge.schedule.start_brazil,challenge.schedule.end_brazil],['2026-11-27T22:00:00-03:00','2026-11-29T01:00:00-03:00']);
 assert.deepEqual([rewards.schedule.start_brazil,rewards.schedule.end_brazil],['2026-11-30T17:00:00-03:00','2026-12-13T17:00:00-03:00']);
 assert.match(main.notes.join(' '),/até seis Passes de Reide/);assert.match(main.notes.join(' '),/até 14 Passes de Reide/);
 assert.match(main.notes.join(' '),/limite de Reides a Distância aumenta para 20/);assert.match(main.notes.join(' '),/Metagross/);
 assert.match(challenge.notes.join(' '),/limite de Reides a Distância aumenta para 20/);
 assert.match(rewards.notes.join(' '),/Liga de Batalha GO/);
 const during=build(events,range,new Date('2026-11-28T18:00:00Z'));
 const story=during.find(group=>group.events.some(event=>event.id===main.id));assert.ok(story);
 assert.ok(story.events.some(event=>event.id===challenge.id));assert.ok(story.events.some(event=>event.id===rewards.id));
 const beforeEnd=build(events,range,new Date('2026-12-13T19:59:59Z'));
 const atEnd=build(events,range,new Date('2026-12-13T20:00:00Z'));
 assert.ok(beforeEnd.some(group=>group.events.some(event=>event.id===rewards.id)));
 assert.equal(atEnd.some(group=>group.events.some(event=>event.id===rewards.id)),false);
});
