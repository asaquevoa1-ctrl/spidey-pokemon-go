'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = name => JSON.parse(fs.readFileSync('spidey-app/data/' + name + '.json','utf8'));
const id = '2026-10-31-dia-de-muertos-paseo-reforma';
const sources = [read('events'),read('local-events')];
const get = doc => doc.events.find(e => e.id === id);
test('Día de Muertos advertises Gengar Gigamax 6-star battle once per catalog, not as a global FLY raid', () => {
  for(const doc of sources) {
    assert.equal(doc.events.filter(e=>e.id===id).length,1);
    const e=get(doc);
    assert.match(e.title,/Gengar Gigamax 6★/);
    assert.match(e.title,/Selos/);
    assert.match(e.title,/Paseo de la Reforma/);
    assert.ok(e.bonuses.some(t=>/Gengar Gigamax/.test(t)&&/6 estrelas|seis estrelas|6★|6 estrelas/.test(t)));
    assert.match(JSON.stringify(e),/Brilhante/);
    assert.match(JSON.stringify(e),/Fundo de Localização/);
    assert.equal(e.locations[0].exact_power_spot_verified,false);
    assert.equal(e.locations[0].exact_pokestop_verified,false);
    assert.equal(e.gpx.enabled,false);
    assert.equal(e.source.url,'https://pokemongo.com/es-MX/news/dia-de-muertos-2026');
  }
  assert.equal(get(sources[0]).category,'local_event');
  assert.ok(!get(sources[0]).tags.includes('Global'));
});
test('Reforma event uses published 10 AM CDMX / 1 PM Brazil on 31 Oct and 8 PM / 11 PM on Nov 5',()=>{
  const e=get(sources[0]), l=get(sources[1]);
  assert.equal(e.schedule.start_local,'2026-10-31T10:00:00-06:00');
  assert.equal(e.schedule.end_local,'2026-11-05T20:00:00-06:00');
  assert.equal(e.schedule.start_brazil,'2026-10-31T13:00:00-03:00');
  assert.equal(e.schedule.end_brazil,'2026-11-05T23:00:00-03:00');
  assert.equal(Date.parse(e.schedule.start_local),Date.parse(e.schedule.start_brazil));
  assert.equal(Date.parse(e.schedule.end_local),Date.parse(e.schedule.end_brazil));
  assert.equal(l.schedule.start_time,'10:00');assert.equal(l.schedule.end_time,'20:00');
  assert.equal(l.schedule.timezone,'America/Mexico_City');
});
test('Remote Max Battle participation is described conditionally; location backgrounds require in-person play',()=>{
  const all = sources.map(d=>get(d));
  for(const e of all){
    const message=[e.summary,e.note,...(e.notes||[])].filter(Boolean).join(' ');
    assert.match(message,/Passe de Reide a Distância/);
    assert.match(message,/Partículas Max/);
    assert.match(message,/19\/05\/2025/);
    assert.match(message,/Fundo de Localização/);
    assert.match(message,/presencial/);
    assert.match(message,/disponibilidade/);
    assert.doesNotMatch(message,/Não prometer combate remoto/);
    assert.match(message,/NÃO (comprova|Ponto de Energia|significa)/);
  }
  assert.equal(get(sources[0]).notifications.enabled,false,'Do not create unsolicited worldwide alert for regional Max event');
});
test('Duskull stamps remain their own event and no exact stop or GPS is invented',()=>{
  const rally=read('stamps').rallies.find(r=>r.id==='2026-dia-de-muertos-reforma-stamp-guide');
  assert.ok(rally&&rally.status==='published');
  assert.equal(get(sources[0]).locations[0].coordinate_text,'19.4269903,-99.1676463');
  assert.match(get(sources[0]).summary,/Selos/);
});
