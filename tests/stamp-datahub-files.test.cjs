const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const root='spidey-app/data/';
const all=JSON.parse(fs.readFileSync(root+'stamps.json','utf8')).rallies;
const manifest=JSON.parse(fs.readFileSync(root+'datahub/catalogo.json','utf8'));
const pc=all.find(x=>x.id==='pokemon-centre-japan-stamp-rally-2026');
const lids=all.find(x=>x.collection_type==='pokelids');
const text=fs.readFileSync('spidey-app/stamps-v2.js','utf8');
const html=fs.readFileSync('spidey-app/index.html','utf8');
const readLines=file=>fs.readFileSync(root+'datahub/'+file,'utf8').trim().split('\n');
const coord=x=>x.latitude.toFixed(6)+','+x.longitude.toFixed(6);

test('TXT files contain exactly 18 community-confirmed PokéStops and 482 physical PokéLid venues',()=>{
 const a=readLines('pokemon-center-japan-18-pokestops.txt');
 const b=readLines('pokelids-japan-482-lid-locations.txt');
 assert.equal(a.length,18);assert.equal(b.length,482);
 assert.deepEqual(a,pc.stops.map(coord));
 assert.deepEqual(b,lids.stops.map(coord));
 assert.equal(new Set(a).size,18);assert.equal(new Set(b).size,482);
 for(const line of [...a,...b]){
   assert.match(line,/^-?\d{1,2}\.\d{6},-?\d{1,3}\.\d{6}$/);
   const [lat,lon]=line.split(',').map(Number);
   assert.ok(Math.abs(lat)<=90&&Math.abs(lon)<=180);
 }
 assert.ok(pc.stops.every(x=>x.coordinate_type==='exact_pokestop'&&x.coordinate_confidence==='community_verified'));
 assert.ok(lids.stops.every(x=>x.coordinate_type==='venue_reference'&&x.coordinate_confidence==='official'));
});
test('each of the 42 regions is accurately counted and the app generates prefecture-only TXT locally',()=>{
 const count=new Map();
 for(const stop of lids.stops)count.set(stop.prefecture,(count.get(stop.prefecture)||0)+1);
 assert.equal(count.size,42);
 assert.deepEqual(manifest.prefectures.map(x=>[x.name,x.count]),[...count].sort(([a],[b])=>a.localeCompare(b)));
 assert.ok(text.includes("id=\"stampDatahubPrefecture\""));
 assert.ok(text.includes("stampDatahubRegionDownload"));
 assert.ok(text.includes("selected.map(pokelidVenueCoord)"));
 assert.ok(text.includes("URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}))"));
 assert.ok(text.includes("URL.revokeObjectURL(currentUrl)"));
});
test('download links load versioned stamp UI and never claim venue coordinates as PokéStops',()=>{
 assert.ok(html.includes('stamps-v2.js?v=20261018-datahub1'));
 assert.ok(html.includes('stamps-v2.css?v=20261018-datahub1'));
 assert.ok(text.includes('data/datahub/pokemon-center-japan-18-pokestops.txt'));
 assert.ok(text.includes('data/datahub/pokelids-japan-482-lid-locations.txt'));
 assert.ok(text.includes('não coordenadas verificadas das PokéStops'));
 assert.ok(manifest.note.includes('Compatibilidade'));
 assert.equal(manifest.files[0].coordinate_type,'exact_pokestop');
 assert.equal(manifest.files[1].coordinate_type,'venue_reference');
 assert.ok(!text.includes('spidey-app/assets/events/premium/national-trust-27-2026-spidey-premium-v1.svg'));
});
test('482 official PokéLid art entries persist, 17 distinct Pokemon Center stamp illustrations linked, Yokohama not invented',()=>{
 assert.equal(lids.stops.filter(x=>x.image_kind==='lid_artwork'&&x.image_url&&x.official_url).length,482);
 const map=text.match(/const POKEMON_CENTER_STAMP_ART = Object\.freeze\(\{([\s\S]*?)\}\);/);
 assert.ok(map,'stamp art index missing');
 const rows=[...map[1].matchAll(/'([a-z0-9-]+)':(\d+)/g)].map(m=>({id:m[1],image:Number(m[2])}));
 assert.equal(rows.length,17);
 assert.equal(new Set(rows.map(x=>x.id)).size,17);
 assert.equal(new Set(rows.map(x=>x.image)).size,17);
 for(const {id,image} of rows){assert.ok(pc.stops.some(x=>x.id===id),id);assert.ok(image>=145&&image<=161)}
 assert.ok(!rows.some(x=>x.id==='pokemon-centre-yokohama'));
 assert.ok(text.includes('https://www.serebii.net/pokemongo/stamps/'));
 assert.ok(text.includes('STAMP_ART_SOURCE'));
});
test('CSP permite somente os dois hosts de imagens de selos e privacidade informa terceiros',()=>{
 const build=fs.readFileSync('scripts/build_spidey_pages.py','utf8');
 assert.ok(build.includes("img-src 'self' data: blob: https://local.pokemon.jp https://www.serebii.net;"));
 const html=fs.readFileSync('spidey-app/index.html','utf8');
 assert.ok(html.includes('imagens das PokéLids (local.pokemon.jp) e dos selos Pokémon Center (serebii.net)'));
 assert.ok(fs.readFileSync('spidey-app/sw.js','utf8').includes('spidey-app-20261018-stamp-datahub1'));
});
