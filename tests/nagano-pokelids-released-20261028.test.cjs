'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const catalog=JSON.parse(fs.readFileSync('spidey-app/data/stamps.json','utf8'));
const national=catalog.rallies.find(x=>x.id==='pokelids-japan-national');
const nagano=national.stops.filter(x=>x.prefecture==='Nagano');
test('Nagano PokéLids have exactly 6 immutable official places, including the coordinate provided',()=>{
 assert.equal(national.stamp_count,482,'Do not overwrite historical national catalog');
 assert.equal(national.prefecture_count,42);
 assert.equal(national.stops.length,482);
 assert.equal(nagano.length,6);
 assert.deepEqual(nagano.map(x=>x.official_lid_number).sort((a,b)=>a-b),[481,482,483,484,485,486]);
 const ina=nagano.find(x=>x.id==='pokelid-482');
 assert.ok(ina);
 assert.equal(ina.city,'Ina');
 assert.equal(ina.latitude,35.882479);
 assert.equal(ina.longitude,137.919057);
 assert.ok(Math.abs(ina.latitude-35.88248)<0.00001);
 assert.ok(Math.abs(ina.longitude-137.91905)<0.00001);
 for(const s of nagano){
  assert.equal(s.coordinate_confidence,'official');
  assert.equal(s.coordinate_type,'venue_reference');
  assert.equal(s.gpx_enabled,false);
  assert.equal(s.go_availability,'check_scrapbook','Do not mistake lid location for a certified GO PokéStop coordinate');
  assert.match(s.official_url,/^https:\/\/local\.pokemon\.jp\/en\/manhole\/desc\/48[1-6]\/$/);
 }
});
test('New verified date and regional reward are attributed; shiny is possible but not guaranteed',()=>{
 const p=national.regional_spotlight;
 assert.ok(p);
 assert.equal(p.prefecture,'Nagano');
 assert.equal(p.region,'Chubu');
 assert.equal(p.release_date,'2026-10-01');
 assert.equal(p.available_stamps,6);
 assert.equal(p.checked_on,'2026-10-28');
 assert.match(p.body,/dois selos obtidos presencialmente/);
 assert.match(p.body,/Fundo de Localização de Nagano/);
 assert.match(p.shiny_note,/nunca é garantido/);
 assert.match(p.shiny_note,/presentes não contam/);
 assert.equal(p.source.url,'https://pokemongo-raku.com/post130804');
 assert.equal(p.official_rules_source.url,'https://pokemongo.com/ja/news/pokelid_full');
 assert.ok(!JSON.stringify(national).includes('shiny_guaranteed'));
});
test('Nagano highlight is present in the existing stamp gallery without fictional GPS or changing other modules',()=>{
 const ui=fs.readFileSync('spidey-app/stamps-v2.js','utf8');
 const css=fs.readFileSync('spidey-app/stamps-v2.css','utf8');
 const index=fs.readFileSync('spidey-app/index.html','utf8');
 assert.match(ui,/stamp-regional-spotlight/);
 assert.match(ui,/rally\.regional_spotlight\.heading/);
 assert.match(ui,/rally\.regional_spotlight\.shiny_note/);
 assert.match(css,/\.stamp-regional-spotlight/);
 assert.match(index,/rocket-guide\.js/);
 assert.doesNotMatch(index,/hunter-v1\.js|hunter-live-feed\.js/);
 assert.equal(catalog.rallies.filter(r=>r.id==='pokelids-japan-national').length,1);
 assert.equal(catalog.rallies.find(r=>r.id==='nagasaki-city-stamp-rally').stops.length,8);
});
