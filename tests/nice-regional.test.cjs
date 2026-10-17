const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const locals = JSON.parse(fs.readFileSync('spidey-app/data/local-events.json','utf8')).events;
const id = '2026-10-17-nice-regional';
const event = events.find(x=>x.id===id);
const local = locals.find(x=>x.id===id);

test('Nice Regional appears once in both catalogs with matching local window',()=>{
  assert.ok(event);
  assert.ok(local);
  assert.equal(events.filter(x=>x.id===id).length,1);
  assert.equal(locals.filter(x=>x.id===id).length,1);
  assert.equal(event.status,'published');
  assert.equal(event.schedule.local_timezone,'Europe/Paris');
  assert.equal(local.schedule.timezone,'Europe/Paris');
  assert.equal(new Date(event.schedule.start_local).toISOString(),'2026-10-17T07:00:00.000Z');
  assert.equal(new Date(event.schedule.end_local).toISOString(),'2026-10-18T18:00:00.000Z');
  assert.equal(new Date(event.schedule.start_brazil).toISOString(),new Date(event.schedule.start_local).toISOString());
  assert.equal(new Date(event.schedule.end_brazil).toISOString(),new Date(event.schedule.end_local).toISOString());
  assert.equal(local.source.confidence,'official'); // Championship, not bonuses.
});

test('Nice location is a venue reference only and must never enable unverified GPX',()=>{
  assert.equal(event.gpx.enabled,false);
  assert.equal(local.gpx.enabled,false);
  assert.equal(event.locations.length,1);
  assert.equal(event.locations[0].coordinate_type,'community_venue_reference');
  assert.equal(event.locations[0].exact_raid_gym_verified,false);
  assert.equal(event.locations[0].exact_pokestop_verified,false);
  assert.equal(event.locations[0].coordinate_text,'43.708100,7.282700');
  assert.equal(local.locations[0].coordinate_text,event.locations[0].coordinate_text);
});

test('Community bonus claims remain unverified and premium status is not invented',()=>{
  assert.deepEqual(event.bonuses,[]);
  assert.equal(local.community_reports.verified,false);
  assert.equal(local.artApproved,false);
  assert.equal(event.notifications.enabled,false);
  assert.ok(event.notes.some(note=>note.includes('FONTE COMUNITÁRIA')));
  const approved=fs.readFileSync('spidey-app/premium-approved-master.js','utf8');
  assert.equal(approved.includes('"'+id+'":'),false);
});

test('Retired NFL stays absent and future editorial priorities remain intact',()=>{
  const retired='2026-10-11-nfl-cardinals-pokemon-go-day';
  assert.equal(events.some(x=>x.id===retired),false);
  assert.equal(locals.some(x=>x.id===retired),false);
  assert.ok(events.some(x=>x.id==='2026-10-24-fc-seoul'));
  assert.ok(events.some(x=>x.id==='2026-ana-pokemon-jet-red'));
  assert.ok(events.some(x=>x.id==='2026-ana-pokemon-jet-green'));
  const trust=JSON.parse(fs.readFileSync('spidey-app/data/national-trust-2026.json','utf8'));
  assert.equal(trust.places.length,27);
});
