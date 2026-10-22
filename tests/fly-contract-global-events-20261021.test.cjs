'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const load=p=>fs.readFileSync('spidey-app/'+p,'utf8');
const all=JSON.parse(load('data/events.json')).events;
const points=JSON.parse(load('data/world-event-points.json')).points;
const sandbox={window:{},Intl,Date,Math,Object,Set,fetch:()=>{throw Error('Unexpected network during FLY QA')}};
vm.runInNewContext(load('fly-core.js'),sandbox);
const core=sandbox.window.SpideyFlyCore;
const recurring=new Set(['spotlight_hour','raid_hour','community_day','community_day_classic','raid_day','max_monday','max_battle_day','research_day','hatch_day','incense_day']);
const hasExactLocalWindow=e=>/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(e.schedule?.start_local||'')
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(e.schedule?.end_local||'');
const scoped=all.filter(e=>e.status==='published'&&recurring.has(e.category)&&hasExactLocalWindow(e)
  &&!e.locations?.length&&!e.tags?.some(t=>/presencial|regional|local|ticket|ingresso/i.test(t)));

test('Mandatory FLY contract: every published recurring worldwide event with exact hours is accessible',()=>{
  assert.ok(scoped.length>=35,'Unexpectedly few eligible recurrent events');
  for(const e of scoped){
    assert.ok((e.tags||[]).some(t=>String(t).toLowerCase()==='global'),e.id+' not tagged Global');
    assert.equal(core.eligible(e),true,'Missing from FLY event selector: '+e.id);
    const local=core.route(e,points,new Date('2026-01-01T00:00:00Z'));
    assert.equal(local.length,points.length,'Missing world route for '+e.id);
    assert.ok(local.length>=67,'Need the fully credited global point set for '+e.id);
    assert.ok(local.every(p=>Number.isFinite(+p.start)&&Number.isFinite(+p.end)&&p.start<p.end),'Bad time conversion: '+e.id);
    assert.ok(local.every(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)),'Missing coordinates: '+e.id);
    for(let i=1;i<local.length;i++) assert.ok(local[i].start>=local[i-1].start,'Route not chronological: '+e.id);
  }
});

test('Different event types automatically appear: Morelull, new November spotlight, raid hours, community day, raid day and Max Monday',()=>{
  for(const id of ['2026-10-22-spotlight-morelull','2026-11-05-spotlight-teddiursa',
    '2026-11-04-raid-hour-altered-giratina','2026-11-21-community-day-preview',
    '2026-10-super-mega-raid-day','2026-10-26-max-monday-sableye']){
    const e=all.find(x=>x.id===id);assert.ok(e,id);
    assert.ok(scoped.some(x=>x.id===id),'Event missing from automatic Global coverage: '+id);
    assert.equal(core.route(e,points,new Date('2026-01-01T00:00Z')).length,points.length,id);
  }
});

test('Unknown date-only previews do not invent hours or world coordinates',()=>{
  for(const id of ['2026-11-28-super-mega-raid-day-preview','2026-11-16-max-surprise']){
    const e=all.find(x=>x.id===id);assert.ok(e);
    assert.equal(core.eligible(e),false,'No local clock to convert: '+id);
    assert.equal(core.route(e,points).length,0);
  }
});

test('Permanent global route discovery automatically surfaces every nearby eligible event',()=>{
  const ui=load('fly-v1.js'),css=load('fly-v1.css'),html=load('index.html'),sw=load('sw.js');
  assert.doesNotThrow(()=>new vm.Script(ui,{filename:'fly-v1.js'}));
  assert.ok(ui.includes('function upcomingGlobalRoutes(list,now)'));
  assert.ok(ui.includes('core.route(e,points,new Date(0))'));
  assert.ok(ui.includes('id="flyUpcomingRoutes"'));
  assert.ok(ui.includes('data-fly-select='));
  assert.ok(ui.includes("mode='all'"));
  assert.ok(ui.includes('upcomingGlobalRoutes(list,now)'));
  assert.ok(ui.includes('spotlightStatus(list,now)'), 'Morelull shortcut stays');
  assert.ok(ui.includes('const MORELULL_ID'));
  assert.ok(css.includes('.fly-upcoming-item'));
  assert.ok(html.includes('fly-v1.js?v=20261022-credits-dst1'));
  assert.ok(sw.includes('spidey-app-20261022-credits-dst-v1'));
  assert.ok(load('app.js').includes('openMorelullFly'));
});

test('FLY route works as a permanent global event feature without false GPX claims',()=>{
  assert.ok(points.length>=67);
  assert.ok(points.every(p=>p.coordinate_type==='city_reference'));
  const future=all.filter(e=>e.status==='published'&&recurring.has(e.category)&&!hasExactLocalWindow(e));
  assert.ok(future.length>0);
  for(const e of future)assert.equal(core.eligible(e),false);
});
