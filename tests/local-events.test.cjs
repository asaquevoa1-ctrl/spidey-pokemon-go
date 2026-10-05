const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const sandbox=vm.createContext({window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}},Intl,Date,Set,Object,Math});
vm.runInContext(fs.readFileSync('spidey-app/fly-core.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('spidey-app/trust-world-v1.js','utf8'),sandbox);
const events=JSON.parse(fs.readFileSync('spidey-app/data/local-events.json','utf8')).events;
const world=sandbox.window.SpideyWorld,event=events.find(e=>e.id==='2026-10-comic-con-malaga');

test('Málaga uses its one Spanish window and stops being active exactly at 15h Brasília on October 4',()=>{
  const window=world.eventWindow(event,new Date('2026-10-04T17:59:59Z'));
  assert.equal(window.start.toISOString(),'2026-10-01T07:00:00.000Z');
  assert.equal(window.end.toISOString(),'2026-10-04T18:00:00.000Z');
  assert.equal(window.status,'ACONTECENDO AGORA');
  assert.equal(world.eventWindow(event,new Date('2026-10-04T18:00:00Z')).status,'ENCERRADO');
  assert.equal(world.eventWindow(event,new Date('2026-10-01T06:59:59Z')).status,'EM BREVE');
  const b=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  assert.equal(b.format(window.end),'15:00');
  assert.equal(sandbox.window.SpideyFlyCore.eligible({...event,category:'community_day',status:'published',tags:['local']}),false);
});

test('Chicago opens each day, respects the US daylight change and closes at the final deadline',()=>{
  const chicago=events.find(e=>e.id==='2026-chicago-fossil-museum');
  const october=world.eventWindow(chicago,new Date('2026-10-05T13:00:00Z'));
  assert.equal(october.start.toISOString(),'2026-10-05T14:00:00.000Z');
  assert.equal(october.end.toISOString(),'2026-10-06T02:00:00.000Z');
  assert.equal(october.status,'ABRE HOJE');
  assert.equal(world.eventWindow(chicago,new Date('2026-10-05T14:00:00Z')).status,'ACONTECENDO AGORA');
  const night=world.eventWindow(chicago,new Date('2026-10-06T02:00:00Z'));
  assert.equal(night.status,'ABRE AMANHÃ');assert.equal(night.start.toISOString(),'2026-10-06T14:00:00.000Z');
  const winter=world.eventWindow(chicago,new Date('2026-11-01T14:00:00Z'));
  assert.equal(winter.start.toISOString(),'2026-11-01T15:00:00.000Z');
  assert.equal(winter.end.toISOString(),'2026-11-02T03:00:00.000Z');
  assert.equal(world.eventWindow(chicago,new Date('2027-04-12T02:00:00Z')).status,'ENCERRADO');
  assert.equal(chicago.gpx.enabled,false);assert.equal(chicago.locations[0].exact_pokestop_verified,false);
});

test('missing, reversed or invalid local hours remain unconfirmed instead of inventing a deadline',()=>{
  assert.equal(world.eventWindow({}).status,'HORÁRIO A CONFIRMAR');
  for(const schedule of [{...event.schedule,timezone:'invalid/zone'},{...event.schedule,end_date:'2026-09-30'},{...event.schedule,end_time:'25:00'}])
    assert.equal(world.eventWindow({...event,schedule}).status,'HORÁRIO A CONFIRMAR');
});
