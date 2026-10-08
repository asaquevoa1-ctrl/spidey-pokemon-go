const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
const points = JSON.parse(fs.readFileSync('spidey-app/data/world-event-points.json')).points;
function setup() {
  const window = {addEventListener(){}, SPIDEY_APPROVED_ART_MASTER:{}, SPIDEY_PREVIEW_ART:{}};
  const context = vm.createContext({window, URL, Intl, Date, document:{readyState:'loading',addEventListener(){}},
    brazilDateKey:date => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(date),
    getBrazilRange:event => ({start:new Date(event.schedule.start_brazil||event.schedule.start_local),end:new Date(event.schedule.end_brazil||event.schedule.end_local)}),
    spideyCategoryLabel:event=>event.category, formatRange:()=>''});
  for (const name of ['fly-core','world-route-preview','preview-art','player-ui']) vm.runInContext(fs.readFileSync(`spidey-app/${name}.js`,'utf8'),context);
  return window;
}
const elgyem = events.find(event=>event.id==='2026-10-08-spotlight-elgyem');
test('Elgyem at 13:16 Brasília exposes all active localities, their coordinates and the next window',()=>{
  const world = setup().SpideyWorldRoute, now = new Date('2026-10-08T16:16:00Z');
  const model = world.model(elgyem,points,now);
  assert.deepEqual(Array.from(model.active,row=>row.timezone).sort(),['Europe/Madrid','Europe/Rome']);
  assert.equal(model.next.length,1);assert.equal(model.next[0].timezone,'Europe/London');
  assert.equal(model.next[0].start.toISOString(),'2026-10-08T17:00:00.000Z');
  const html = world.render(elgyem,points,now);
  for (const text of ['Onde jogar agora','Zaragoza, Espanha','Roma, Itália','Londres, Reino Unido','41.661609,-0.89464','41.889988,12.493033','13:00','14:00','44 min','Copiar coordenadas','Ver rota mundial completa']) assert.ok(html.includes(text),text);
  assert.equal(world.model(elgyem,points,new Date('2026-10-08T17:00:00Z')).active[0].timezone,'Europe/London');
});
test('Home retains an active world event after its Brazilian window closes',()=>{
  const w=setup(),now=new Date('2026-10-09T01:30:00Z');
  assert.ok(new Date(elgyem.schedule.end_brazil)<now);
  assert.equal(w.SpideyPlayer.homeSelection(events,points,now).focus.id,elgyem.id);
  assert.ok(w.SpideyWorldRoute.model(elgyem,points,now).active.some(row=>row.timezone==='America/Los_Angeles'));
  assert.equal(w.SpideyWorldRoute.model(elgyem,points,new Date('2026-10-09T05:30:00Z')).active[0].timezone,'Pacific/Pago_Pago');
  assert.ok(w.SpideyWorldRoute.render(elgyem,points,new Date('2026-10-09T05:30:00Z')).includes('ÚLTIMA CHANCE'));
  assert.equal(w.SpideyWorldRoute.model(elgyem,points,new Date('2026-10-09T05:00:00Z')).active.some(row=>row.timezone==='Pacific/Honolulu'),false);
});
test('a regional event never gains a global FLY route; Taipei is inactive overnight',()=>{
  const w=setup(),taipei=events.find(event=>event.id==='2026-10-pokexciting-taipei');
  assert.ok(taipei);assert.equal(w.SpideyWorldRoute.render(taipei,points),'');
  const windows=w.SpideyWorldRoute.windows(taipei,points);
  assert.equal(windows.length,2);
  assert.equal(windows[0].start.toISOString(),'2026-10-10T02:00:00.000Z');
  assert.equal(windows[0].end.toISOString(),'2026-10-10T14:00:00.000Z');
  const space=events.find(event=>event.id==='2026-10-world-space-week');
  const daytime=w.SpideyPlayer.homeSelection([taipei,space],points,new Date('2026-10-10T13:59:59Z'));
  assert.ok(daytime.active.some(event=>event.id===taipei.id));
  const night=w.SpideyPlayer.homeSelection([taipei,space],points,new Date('2026-10-10T14:00:00Z'));
  assert.ok(!night.active.some(event=>event.id===taipei.id));assert.ok(night.upcoming.some(event=>event.id===taipei.id));
  assert.equal(windows.some(row=>row.start<=new Date('2026-10-10T14:00:00Z')&&new Date('2026-10-10T14:00:00Z')<row.end),false);
  assert.equal(windows[1].start.toISOString(),'2026-10-11T02:00:00.000Z');
});
test('missing points and invalid event hours cannot claim a locality is active',()=>{
  const world=setup().SpideyWorldRoute;
  assert.equal(world.model(elgyem,[]).active.length,0);
  assert.ok(world.render(elgyem,null,new Date(),true).includes('Não foi possível carregar'));
  const invalid={...elgyem,schedule:{...elgyem.schedule,end_local:'2026-10-08T25:00:00-03:00'}};
  assert.equal(world.model(invalid,points).rows.length,0);
  assert.ok(world.render(invalid,points).includes('ainda não estão confirmados'));
});
