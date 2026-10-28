const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
const locals=JSON.parse(fs.readFileSync('spidey-app/data/local-events.json')).events;
const la=locals.find(e=>e.id==='2026-pokemon-night-out-la');
const london=locals.find(e=>e.id==='2026-pokemon-night-out-london');
function setup(cards=[]){
 const window={addEventListener(){}};
 const context=vm.createContext({window,Date,Intl,URL,Map,Set,Object,Math,
   document:{readyState:'loading',addEventListener(){},querySelectorAll(){return cards;}}});
 for(const name of ['date-only.js','fly-core.js','trust-world-v1.js','news-feed.js'])vm.runInContext(fs.readFileSync('spidey-app/'+name,'utf8'),context);
 return window;
}
test('date-only local events end at their own local midnight, independently of translated labels',()=>{
 const w=setup(),before=JSON.stringify(la);
 assert.equal(w.SpideyWorld.visible(la,new Date('2026-10-25T06:59:59.999Z')),true);
 assert.equal(w.SpideyWorld.visible(la,new Date('2026-10-25T07:00:00Z')),false);
 assert.equal(w.SpideyWorld.visible(la,new Date('2026-10-28T21:00:00Z')),false);
 assert.equal(w.SpideyWorld.visible(london,new Date('2026-10-28T21:00:00Z')),true);
 assert.equal(JSON.stringify(la),before,'Preserve the historical event and approved art');
});
test('expiry removes stale Home and FLY cards without destroying records or later events',()=>{
 const removed=[];
 const cards=[la,la,london].map((e,index)=>({dataset:{worldEvent:e.id},remove(){removed.push(index)}}));
 const w=setup(cards);w.SPIDEY_WORLD_EVENTS.push(la,london);
 w.SpideyWorld.pruneExpired(new Date('2026-10-28T21:00:00Z'));
 assert.deepEqual(removed,[0,1]);
 assert.equal(w.SPIDEY_WORLD_EVENTS.filter(e=>e.id===la.id).length,1);
 assert.equal(w.SpideyWorld.visible({schedule:{start_date:'2026-10-24'}},new Date()),false);
});
test('official announcement replaces the old teaser and one news story opens the three real calendar windows',()=>{
 const w=setup(),trail=events.find(e=>e.id==='2026-11-16-dynamax-trails');
 const teaser=events.find(e=>e.id==='2026-10-26-eternatus-teaser-unconfirmed');
 const selected=events.filter(e=>e.source?.url?.includes('dynamax-trails-eternamax-eternatus-2026'));
 const range=e=>({start:new Date(e.schedule.start_brazil),end:new Date(e.schedule.end_brazil)});
 const stories=w.SpideyNews.build([...selected,teaser],range,new Date('2026-10-28T21:00:00Z'));
 assert.equal(stories.length,1);assert.equal(stories[0].events.length,4);
 assert.equal(teaser.status,'archived');assert.equal(teaser.superseded_by,trail.id);
 assert.equal(trail.source.confidence,'official');assert.ok(!trail.title.includes('prévia'));
 assert.equal(trail.schedule.start_brazil,'2026-11-16T10:00:00-03:00');
 assert.equal(trail.schedule.end_brazil,'2026-11-23T20:00:00-03:00');
 assert.equal(trail.claim_deadline.end_brazil,'2026-11-25T20:00:00-03:00');
 assert.match(trail.early_access.condition,/primeiro marco/);
 assert.equal(trail.early_access.start_local,'2026-11-14T10:00:00-03:00');
 assert.match(trail.pokemon[0].note,/quem já capturou recebe 100 Doces/);
 assert.match(trail.pokemon[0].note,/Passe GO gratuito/);
 const cost=trail.power_up_guide;
 assert.deepEqual([cost.from_level,cost.to_level,cost.candy,cost.candy_xl],[15,50,8900,8900]);
 assert.equal(cost.includes_max_moves,false);
 assert.equal(cost.includes_second_charged_attack,false);
 assert.equal(cost.source.confidence,'verified_community','Community costs must not become official event promises');
 assert.ok(trail.notes.some(n=>/8\.900 Doces e 8\.900 Doces GG/.test(n)&&/nível 15 ao 50/.test(n)&&/comunidade/.test(n)));
});
test('Eternamax battle window never promises capture or conflates the remote raid limit timezone',()=>{
 const w=setup(),e=events.find(e=>e.id==='2026-11-21-eternamax-eternatus-max-battles');
 assert.equal(e.schedule.start_local,'2026-11-21T11:00:00-03:00');
 assert.equal(e.schedule.end_local,'2026-11-21T14:00:00-03:00');
 assert.match(e.pokemon[0].note,/não há captura/);
 assert.equal(e.remote_raid_limit.start_brazil,'2026-11-20T18:00:00-03:00');
 assert.equal(e.remote_raid_limit.end_brazil,'2026-11-21T23:00:00-03:00');
 assert.equal(w.SpideyFlyCore.eligible(e),true);
 assert.equal(e.gpx.enabled,false);assert.equal(e.notifications.enabled,false);
});
test('newly announced November 19 Spotlight has all three Galar starters and the catch candy bonus',()=>{
 const w=setup(),e=events.find(e=>e.id==='2026-11-19-spotlight-galar-starters');
 assert.equal(e.schedule.start_local,'2026-11-19T18:00:00-03:00');
 assert.equal(e.schedule.end_local,'2026-11-19T19:00:00-03:00');
 assert.deepEqual(e.pokemon.map(p=>p.name),['Grookey','Scorbunny','Sobble']);
 assert.match(e.bonuses[0],/2× Doces por captura/);
 assert.equal(e.source.confidence,'official');assert.equal(w.SpideyFlyCore.eligible(e),true);
 assert.equal(w.SpideyFlyCore.eligible(events.find(e=>e.id==='2026-11-16-dynamax-trails')),false);
});
