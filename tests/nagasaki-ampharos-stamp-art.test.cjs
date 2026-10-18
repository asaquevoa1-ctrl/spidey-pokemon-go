const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const ui=fs.readFileSync('spidey-app/stamps-v2.js','utf8');
const data=JSON.parse(fs.readFileSync('spidey-app/data/stamps.json','utf8')).rallies;
test('selo Ampharos da coleção Nagasaki é único e utilizado pelas oito paradas',()=>{
 const nagasaki=data.find(r=>r.id==='nagasaki-city-stamp-rally');
 assert.equal(nagasaki.stops.length,8);
 assert.ok(nagasaki.stops.every(s=>s.id.startsWith('nagasaki-city-')));
 assert.ok(ui.includes("const NAGASAKI_STAMP_DESIGN = 'https://www.serebii.net/pokemongo/stamps/61.png'"));
 assert.ok(ui.includes("startsWith('nagasaki-city-')"));
 assert.ok(ui.includes("O selo de Nagasaki tem o desenho de Ampharos."));
});
test('o novo desenho não altera os 18 selos Pokémon Center nem 482 PokéLids',()=>{
 const centers=data.find(r=>r.id==='pokemon-centre-japan-stamp-rally-2026');
 const lids=data.find(r=>r.collection_type==='pokelids');
 assert.equal(centers.stops.length,18);
 assert.equal(lids.stops.length,482);
 assert.ok(ui.includes('POKEMON_CENTER_STAMP_ART'));
 assert.ok(ui.includes("for (const field of IMAGE_FIELDS)"));
 assert.ok(fs.readFileSync('spidey-app/index.html','utf8').includes('stamps-v2.js?v=20261018-nagasaki-art1'));
});
