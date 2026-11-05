const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const catalog=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const main=catalog.find(event=>event.id==='2026-11-28-super-mega-raid-day-preview');
const challenge=catalog.find(event=>event.id==='2026-11-27-clefable-global-challenge');
const rewards=catalog.find(event=>event.id==='2026-11-30-clefable-global-rewards');

function publicVisibility(){
  const app=fs.readFileSync('spidey-app/app.js','utf8');
  const context={window:{},Date,Number,Boolean,Intl};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('spidey-app/date-only.js','utf8'),context);
  context.getBrazilRange=event=>({
    start:new Date(event.schedule?.start_brazil||event.schedule?.start_local),
    end:new Date(event.schedule?.end_brazil||event.schedule?.end_local)
  });
  const source=app.slice(app.indexOf('function eventVisibleInPublicAgenda'),app.indexOf('function isEventActive'));
  vm.runInContext(source,context);
  return context.eventVisibleInPublicAgenda;
}

test('official announcement completes the existing preview without changing its ID',()=>{
  assert.ok(main);
  assert.equal(main.title,'Dia de Super Megarreides de Mega Clefable');
  assert.equal(main.source.confidence,'official');
  assert.equal(main.audit.prediction_history.preserved_id,true);
  assert.equal(main.audit.editorial_detail_pending,false);
  assert.equal(main.schedule.start_local,'2026-11-28T14:00:00-03:00');
  assert.equal(main.schedule.end_local,'2026-11-28T17:00:00-03:00');
  assert.match(main.notes.join(' '),/Explosão Lunar\+/);
  assert.match(main.notes.join(' '),/Metagross/);
  assert.ok(main.bonuses.some(item=>item.includes('seis Passes')));
  assert.ok(main.bonuses.some(item=>item.includes('14 Passes')));
});

test('global challenge and earned bonus windows remain distinct in the calendar',()=>{
  assert.ok(challenge);
  assert.ok(rewards);
  assert.equal(challenge.schedule.start_brazil,'2026-11-27T22:00:00-03:00');
  assert.equal(challenge.schedule.end_brazil,'2026-11-29T01:00:00-03:00');
  assert.equal(rewards.schedule.start_brazil,'2026-11-30T17:00:00-03:00');
  assert.equal(rewards.schedule.end_brazil,'2026-12-13T17:00:00-03:00');
  assert.match(rewards.bonuses.join(' '),/dependerá do número de níveis/);
  assert.equal(rewards.audit.conditional_values_not_invented,true);
});

test('each Clefable window leaves current surfaces exactly at its closing boundary',()=>{
  const visible=publicVisibility();
  for(const [event,before,at] of [
    [main,'2026-11-28T19:59:59.999Z','2026-11-28T20:00:00.000Z'],
    [challenge,'2026-11-29T03:59:59.999Z','2026-11-29T04:00:00.000Z'],
    [rewards,'2026-12-13T19:59:59.999Z','2026-12-13T20:00:00.000Z']
  ]){
    assert.equal(visible(event,new Date(before)),true,event.id+' before end');
    assert.equal(visible(event,new Date(at)),false,event.id+' at end');
  }
});

test('duplicate collector notices are grouped into the canonical stories',()=>{
  const cases=[
    ['queue/pending/2026-11-05/oficial-noticia-93e38efdde46.json','2026-11-28-super-mega-raid-day-preview'],
    ['queue/pending/2026-11-05/dance-under-the-moonlight-during-clefable-super-mega-raid-day-b9031d8d7593.json','2026-11-28-super-mega-raid-day-preview'],
    ['queue/pending/2026-11-05/g47ix-noticia-46c18379f52d.json','2026-11-go-wild-area-mexico-city'],
    ['queue/pending/2026-11-05/g47ix-noticia-b03cf0032950.json','2026-11-go-wild-area-mexico-city']
  ];
  for(const [path,id] of cases){
    const item=JSON.parse(fs.readFileSync(path,'utf8'));
    assert.equal(item.status,'curated',path);
    assert.ok(item.app_event_ids.includes(id),path);
    assert.equal(item.arte_obrigatoria,false,path);
    assert.ok(fs.existsSync(item.curated_path),item.curated_path);
  }
});
