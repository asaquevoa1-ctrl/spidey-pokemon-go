const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const sandbox={window:{},Intl,Date,Set,Object,Math,fetch:()=>{throw Error('unexpected fetch')}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('spidey-app/fly-core.js','utf8'),sandbox);
const core=sandbox.window.SpideyFlyCore,points=JSON.parse(fs.readFileSync('spidey-app/data/world-event-points.json')).points;
const event={id:'qa-window',status:'published',category:'community_day',tags:['Global'],schedule:{start_local:'2026-10-10T14:00:00-03:00',end_local:'2026-10-10T17:00:00-03:00'}};
test('event date controls DST, half-hour offsets and previous Brazilian day',()=>{
 assert.equal(core.localToDate('2026-10-10','14:00','Pacific/Auckland').toISOString(),'2026-10-10T01:00:00.000Z');
 assert.equal(core.localToDate('2026-07-10','14:00','Pacific/Auckland').toISOString(),'2026-07-10T02:00:00.000Z');
 assert.equal(core.localToDate('2026-10-10','14:00','Asia/Kolkata').toISOString(),'2026-10-10T08:30:00.000Z');
 assert.equal(core.localToDate('2026-10-10','14:00','Pacific/Kiritimati').toISOString(),'2026-10-10T00:00:00.000Z');
});
test('nonexistent/ambiguous DST times and invalid schedule fail closed',()=>{
 for(const [date,clock,zone] of [['2026-03-08','02:30','America/New_York'],['2026-11-01','01:30','America/New_York'],['2026-02-30','14:00','Asia/Taipei'],['2026-10-10','25:00','Asia/Taipei'],['2026-10-10','14:00','invalid']])assert.equal(core.localToDate(date,clock,zone),null);
 assert.equal(core.route({...event,schedule:{}},points).length,0);
 assert.equal(core.route({...event,tags:[]},points).length,0);
});
test('chronological route, simultaneous windows, now/next/end/last chance',()=>{
 const before=core.route(event,points,new Date('2026-10-09T22:00Z'));
 assert.equal(before.length,points.length);assert.equal(before[0].timezone,'Pacific/Kiritimati');assert.equal(before[0].status,'PRÓXIMO');
 for(let i=1;i<before.length;i++)assert.ok(before[i].start>=before[i-1].start);
 const current=core.route(event,points,new Date('2026-10-10T01:30Z'));assert.ok(current.some(p=>p.status==='ATIVO AGORA'));assert.ok(current.some(p=>p.status==='PRÓXIMO'));
 const last=core.route(event,points,new Date('2026-10-11T03:30Z'));assert.ok(last.some(p=>p.status==='ÚLTIMA CHANCE'));assert.ok(last.some(p=>p.status==='ENCERRADO'));
 assert.ok(core.route(event,points,new Date('2026-10-12')).every(p=>p.status==='ENCERRADO'));
});
test('official global Cinderace window is available on the world route with its actual date',()=>{
 const e=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events.find(e=>e.id==='2026-10-gigantamax-cinderace-max-day');
 assert.equal(core.eligible(e),true);
 const rows=core.route(e,points,new Date('2026-10-02T12:00Z'));
 assert.equal(rows.length,28);
 const taipei=rows.find(p=>p.timezone==='Asia/Taipei');
 assert.equal(taipei.start.toISOString(),'2026-10-03T06:00:00.000Z');
 assert.equal(taipei.end.toISOString(),'2026-10-03T09:00:00.000Z');
 assert.equal(core.eligible({...e,tags:['Cinderace','Gigamax']}),false);
});
test('preserve both geography bases and approved assets',()=>{
 assert.equal(points.length,28);assert.ok(points.some(p=>p.name.includes('Taipei')&&p.essential));assert.ok(points.some(p=>p.name.includes('Osaka')));assert.ok(points.some(p=>p.name.includes('Shinjuku')));
 vm.runInContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),sandbox);
 const crypto=require('node:crypto');for(const entry of Object.values(sandbox.window.SPIDEY_APPROVED_ART_MASTER))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('spidey-app/'+entry.file)).digest('hex'),entry.sha256);
 assert.ok(!sandbox.window.SPIDEY_APPROVED_ART_MASTER['harvest-festival-2026']);
});
test('Lake Trio regional route preserves event identity, India exception, DST and unknown island boundaries',()=>{
 const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
 const trio=events.filter(e=>e.id==='2026-10-dynamax-max-battle-day');assert.equal(trio.length,1);
 const rows=core.route(trio[0],points,new Date('2026-10-01T22:00Z'));assert.equal(rows.length,28);
 for(const [zone,pokemon,start,end] of [
  ['Asia/Taipei','Uxie','2026-10-24T06:00:00.000Z','2026-10-24T09:00:00.000Z'],
  ['Asia/Kolkata','Mesprit','2026-10-24T08:30:00.000Z','2026-10-24T11:30:00.000Z'],
  ['Europe/London','Mesprit','2026-10-24T13:00:00.000Z','2026-10-24T16:00:00.000Z'],
  ['America/New_York','Azelf','2026-10-24T18:00:00.000Z','2026-10-24T21:00:00.000Z'],
  ['America/Sao_Paulo','Azelf','2026-10-24T17:00:00.000Z','2026-10-24T20:00:00.000Z']
 ]){
  const p=rows.find(p=>p.timezone===zone);assert.equal(p.featuredPokemon,pokemon);assert.equal(p.start.toISOString(),start);assert.equal(p.end.toISOString(),end);
 }
 for(const zone of ['Pacific/Kiritimati','Pacific/Honolulu','Pacific/Pago_Pago'])assert.equal(rows.find(p=>p.timezone===zone).featuredPokemon,null);
 assert.ok(core.route(events.find(e=>e.id==='2026-10-gigantamax-cinderace-max-day'),points).every(p=>p.featuredPokemon===null));
});
test('offline cache contains every local shell file',()=>{
 const sw=fs.readFileSync('spidey-app/sw.js','utf8');const files=[...sw.matchAll(/'\.\/([^']+)'/g)].map(x=>x[1]);for(const file of files)assert.ok(fs.existsSync('spidey-app/'+file),file);
});
