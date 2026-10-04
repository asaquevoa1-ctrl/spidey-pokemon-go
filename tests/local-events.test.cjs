const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const sandbox=vm.createContext({window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}},Intl,Date,Set,Object,Math});
vm.runInContext(fs.readFileSync('spidey-app/fly-core.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('spidey-app/trust-world-v1.js','utf8'),sandbox);
const world=sandbox.window.SpideyWorld,event=JSON.parse(fs.readFileSync('spidey-app/data/local-events.json','utf8')).events[0];

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

test('missing, reversed or invalid local hours remain unconfirmed instead of inventing a deadline',()=>{
  assert.equal(world.eventWindow({}).status,'HORÁRIO A CONFIRMAR');
  for(const schedule of [{...event.schedule,timezone:'invalid/zone'},{...event.schedule,end_date:'2026-09-30'},{...event.schedule,end_time:'25:00'}])
    assert.equal(world.eventWindow({...event,schedule}).status,'HORÁRIO A CONFIRMAR');
});
