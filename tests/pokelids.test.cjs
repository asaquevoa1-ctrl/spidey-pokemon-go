const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const catalog = JSON.parse(fs.readFileSync('spidey-app/data/stamps.json','utf8'));

test('all482 official lids remain uniquely represented across42 prefectures without granting exact-stop GPX', async () => {
  const rally = catalog.rallies.find(r => r.id === 'pokelids-japan-national');
  assert.equal(rally.stops.length,482);
  assert.equal(new Set(rally.stops.map(s => s.id)).size,482);
  assert.equal(new Set(rally.stops.map(s => s.prefecture)).size,42);
  for (const stop of rally.stops) {
    assert.equal(stop.coordinate_type,'venue_reference');
    assert.equal(stop.gpx_enabled,false);
    assert.ok(Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude));
    assert.ok(stop.image_url.startsWith('https://local.pokemon.jp/img/p/manhole/'));
    assert.ok(stop.official_url.endsWith(`/desc/${stop.official_lid_number}/`));
  }
  const {rallyGpx} = await import('../lib/rally-gpx.js');
  assert.equal(rallyGpx(catalog,rally.id).status,409);
});

test('Nagasaki has eight official venues and cannot export guessed coordinates', async () => {
  const rally = catalog.rallies.find(r => r.id === 'nagasaki-city-stamp-rally');
  assert.equal(rally.stops.length,8);
  assert.ok(rally.stops.every(s => s.latitude === null && s.longitude === null));
  const {rallyGpx} = await import('../lib/rally-gpx.js');
  assert.equal(rallyGpx(catalog,rally.id).status,409);
});
