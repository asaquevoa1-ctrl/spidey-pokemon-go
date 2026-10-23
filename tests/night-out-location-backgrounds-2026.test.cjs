const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root = 'spidey-app/';
const events = JSON.parse(fs.readFileSync(root+'data/events.json','utf8')).events;
const original = events.find(e=>e.id==='2026-10-pokemon-night-out-twitch');
const nights = [
  ['2026-pokemon-night-out-la','2026-10-24','Los Angeles',33.943723,-118.342295],
  ['2026-pokemon-night-out-london','2026-11-10','Londres',51.502579,0.003202],
];
test('Night Out has exactly two independently dated on-site events while preserving Twitch', () => {
  assert.ok(original,'Do not remove or duplicate the existing Twitch event');
  for (const [id,date,city,lat,lng] of nights) {
    const matches = events.filter(e=>e.id===id);
    assert.equal(matches.length,1,id);
    const e=matches[0];
    assert.equal(e.status,'published');
    assert.equal(e.schedule.precision,'date');
    assert.equal(e.schedule.start_date,date);
    assert.equal(e.schedule.end_date,date);
    assert.equal(e.source.confidence,'official');
    assert.equal(e.source.url,'https://pokemongo.com/news/pokemon-night-out-irl-details2026');
    assert.equal(e.location_background.confirmed,true);
    assert.equal(e.location_background.city,city);
    assert.deepEqual(e.location_background.eligible_pokemon,['Pikachu','Gengar']);
    assert.ok(e.bonuses.some(b=>b.includes('FUNDO DE LOCALIZAÇÃO EXCLUSIVO')));
    assert.ok(e.bonuses.some(b=>b.includes('Toxtricity')));
    assert.equal(e.locations[0].latitude,lat);
    assert.equal(e.locations[0].longitude,lng);
    assert.equal(e.locations[0].coordinate_type,'venue_reference');
    assert.equal(e.locations[0].exact_raid_gym_verified,false);
    assert.equal(e.gpx.enabled,false);
    assert.equal(e.notifications.enabled,false);
    for(const field of ['start_local','end_local','start_brazil','end_brazil'])assert.equal(e.schedule[field],undefined);
  }
});
test('Both city dates remain correct in their own timezone and do not masquerade as exact activity hours', () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync(root+'date-only.js','utf8'),{window,Date,Intl});
  for(const [id,date] of nights){
    const e=events.find(x=>x.id===id);
    assert.equal(window.SpideyDateOnly.valid(e),true);
    assert.match(window.SpideyDateOnly.label(e),/horário do evento a confirmar/);
    assert.ok(window.SpideyDateOnly.label(e).includes(date.split('-').reverse().join('/')));
  }
  assert.match(window.SpideyDateOnly.status(events.find(e=>e.id===nights[0][0]),new Date('2026-10-24T19:00:00Z')),/^Hoje/);
  assert.match(window.SpideyDateOnly.status(events.find(e=>e.id===nights[1][0]),new Date('2026-11-10T12:00:00Z')),/^Hoje/);
});
test('Reuses only the previously approved Premium Night Out poster, never alters original master', () => {
  const masterCode=fs.readFileSync(root+'premium-approved-master.js','utf8');
  const window={};vm.runInNewContext(masterCode,{window});
  const old=window.SPIDEY_APPROVED_ART_MASTER[original.id];
  assert.ok(old);
  for(const [id] of nights){
    const a=window.SPIDEY_APPROVED_ART_MASTER[id];
    assert.ok(a);
    assert.equal(a.file,old.file);
    assert.equal(a.sha256,old.sha256);
    assert.equal(a.approval_record,old.approval_record);
    assert.equal(a.approval_basis,'EXISTING_APPROVED_NIGHT_OUT_POSTER_REUSED_UNMODIFIED');
  }
});
test('Location background reward is visible in calendar detail and Home with no third-party GPS or new posters', () => {
  const html=fs.readFileSync(root+'index.html','utf8');
  const app=fs.readFileSync(root+'app.js','utf8');
  const player=fs.readFileSync(root+'player-ui.js','utf8');
  const sw=fs.readFileSync(root+'sw.js','utf8');
  const css=fs.readFileSync(root+'night-out-location-backgrounds.css','utf8');
  assert.ok(html.includes('night-out-location-backgrounds.css'));
  assert.ok(sw.includes("'./night-out-location-backgrounds.css'"));
  assert.ok(app.includes('nightOutBackgroundHighlight(event)'));
  assert.ok(player.includes('window.SpideyNightOutHighlight?.(e)'));
  assert.ok(css.includes('Fundo')||css.includes('fundos'));
  for(const file of ['app.js','player-ui.js','premium-approved-master.js']) assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(root+file,'utf8')));
  const code=app.slice(app.indexOf('function nightOutBackgroundHighlight(event) {'),app.indexOf('function openEvent(event) {'));
  const helper=new Function('window','event',code+'return window.SpideyNightOutHighlight(event)');
  for(const [id,,city] of nights){
    const output=helper({},events.find(e=>e.id===id));
    assert.ok(output.includes('Fundo de Localização confirmado'));
    assert.ok(output.includes(city));
    assert.ok(output.includes('Pikachu'));
    assert.ok(output.includes('Gengar'));
  }
  assert.equal(helper({},original),'');
});
