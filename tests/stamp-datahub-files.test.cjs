const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const root='spidey-app/';
const rallies=JSON.parse(fs.readFileSync(root+'data/stamps.json','utf8')).rallies;
const manifest=JSON.parse(fs.readFileSync(root+'data/datahub/catalogo.json','utf8'));
const centre=rallies.find(x=>x.id==='pokemon-centre-japan-stamp-rally-2026');
const lids=rallies.find(x=>x.collection_type==='pokelids');
const ui=fs.readFileSync(root+'stamps-v2.js','utf8');
const html=fs.readFileSync(root+'index.html','utf8');
const sw=fs.readFileSync(root+'sw.js','utf8');
const coordinate=stop=>Number(stop.latitude).toFixed(6)+','+Number(stop.longitude).toFixed(6);

test('DataHub uses copy-and-paste lists, never TXT downloads',()=>{
 assert.equal(manifest.mode,'copy_and_paste');
 assert.equal(manifest.collections[0].count,18);
 assert.equal(manifest.collections[1].count,482);
 assert.equal(manifest.collections[1].groups,42);
 assert.ok(ui.includes('id="stampCoordPrefecture"'));
 assert.ok(ui.includes('id="rallyAllCoordinates"'));
 assert.ok(ui.includes('id="copyAllStampCoords"'));
 assert.ok(ui.includes('Copiar lista desta prefeitura'));
 assert.ok(ui.includes("copyPrefecture?.addEventListener('change', refreshCoordinateList)"));
 assert.ok(ui.includes("listCopy?.addEventListener('click'"));
 assert.ok(ui.includes('selectedCoordinates()'));
 assert.ok(ui.includes('textarea.value.length'));
 assert.ok(!ui.includes('Baixar TXT'));
 assert.ok(!ui.includes('data/datahub/pokelids-japan-482-lid-locations.txt'));
 assert.ok(!ui.includes('stampDatahubRegionDownload'));
 assert.ok(!ui.includes('URL.createObjectURL(new Blob([txt]'));
 for(const name of ['pokemon-center-japan-18-pokestops.txt','pokelids-japan-482-lid-locations.txt']){
  assert.equal(fs.existsSync(root+'data/datahub/'+name),false,'Do not publish old TXT: '+name);
  assert.equal(sw.includes(name),false,'Do not precache old TXT');
 }
 assert.match(html,/stamps-v2\.js\?v=20261027-mexico-reference1/);
 assert.match(html,/stamps-v2\.css\?v=20261018-stamp-copy-lists2/);
 assert.match(sw,/const CACHE = 'spidey-app-[0-9]{8}-/); // Keep verifying the copy-list UI above, not a frozen global cache version.
});

test('482 PokéLid physical locations form 42 independent prefecture copy lists',()=>{
 assert.equal(lids.stops.length,482);
 const grouped=new Map();
 for(const item of lids.stops){
   assert.equal(item.coordinate_type,'venue_reference');
   assert.equal(item.gpx_enabled,false);
   assert.ok(Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
   const list=grouped.get(item.prefecture)||[];list.push(coordinate(item));grouped.set(item.prefecture,list);
 }
 assert.equal(grouped.size,42);
 assert.deepEqual([...grouped].sort(([a],[b])=>a.localeCompare(b)).map(([name,coords])=>[name,coords.length]),manifest.prefectures.map(x=>[x.name,x.count]));
 assert.equal([...grouped.values()].reduce((n,v)=>n+v.length,0),482);
 for(const coords of grouped.values())assert.ok(coords.every(x=>/^-?\d{1,2}\.\d{6},-?\d{1,3}\.\d{6}$/.test(x)));
});

test('Pokémon Center has 18 community-confirmed coordinates and other rallies do not invent missing data',()=>{
 assert.equal(centre.stops.length,18);
 assert.equal(new Set(centre.stops.map(coordinate)).size,18);
 assert.ok(centre.stops.every(x=>x.coordinate_type==='exact_pokestop'&&x.coordinate_confidence==='community_verified'));
 for(const id of ['nagasaki-city-stamp-rally','pokexciting-cross-region-2026']){
   const rally=rallies.find(r=>r.id===id);
   assert.ok(rally.stops.every(p=>p.latitude==null&&p.longitude==null));
 }
 assert.ok(ui.includes('Ainda não temos coordenadas confirmadas para esta coleção.'));
});

test('images and existing GPX logic remain independent from copy lists',()=>{
 assert.equal(lids.stops.filter(x=>x.image_url&&x.official_url).length,482);
 assert.ok(ui.includes('const POKEMON_CENTER_STAMP_ART'));
 assert.ok(ui.includes('const gpxLink = detail.querySelector'));
 assert.ok(ui.includes('if (fullGpx && gpxLink)'));
 assert.ok(!ui.includes('Não é uma PokéStop verificada. Copie mesmo assim como se fosse.'));
});
