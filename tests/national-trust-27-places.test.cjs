const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const doc=JSON.parse(fs.readFileSync('spidey-app/data/national-trust-2026.json','utf8'));
const js=fs.readFileSync('spidey-app/national-trust-v1.js','utf8');
const html=fs.readFileSync('spidey-app/index.html','utf8');
const sw=fs.readFileSync('spidey-app/sw.js','utf8');
const window={};
vm.runInNewContext(js,{window,document:{readyState:'loading',addEventListener(){}}});
const core=window.SpideyNationalTrustCore;
test('National Trust 2026: official partnership is correctly dated and reward not falsely guaranteed',()=>{
 assert.equal(doc.official_source,'https://pokemongo.com/news/nationaltrust-2026');
 assert.equal(doc.event_end_date,'2026-12-31');
 assert.equal(doc.event_end_time_verified,false);
 assert.match(doc.reward_note,/potencial|pode conceder/i);
 assert.match(doc.reward_note,/30 lançamentos bons/);
 assert.equal(doc.tasks_summary.length,3);
 assert.ok(doc.tasks_summary[1].includes('5 dias diferentes'));
 assert.match(doc.availability_warning,/não garantiu/i);
 assert.match(doc.availability_warning,/GPS/i);
});
test('National Trust 2026: 27 distinct official site names grouped 8+5+8+6',()=>{
 const places=doc.places;
 assert.equal(places.length,27);
 assert.equal(new Set(places.map(p=>p.id)).size,27);
 assert.equal(new Set(places.map(p=>p.name)).size,27);
 const expectedGroups={'Sudoeste e País de Gales':8,'Norte e Irlanda do Norte':5,'Midlands e Leste':8,'Londres e Sudeste':6};
 for(const [group,count] of Object.entries(expectedGroups))assert.equal(places.filter(p=>p.group===group).length,count);
 for(const name of ['Chirk Castle and Garden','Mount Stewart','Cliveden','Wimpole Estate','Tyntesfield']){
   assert.ok(places.some(p=>p.name===name));
 }
});
test('all coordinates valid; preserve precision, especially Brazilian decimal commas normalized',()=>{
 const places=core.validPlaces(doc);
 assert.equal(places.length,27);
 for(const p of places){
   assert.equal(core.parseCoord(p.coordinates),p.coordinates,p.name);
   assert.equal(p.exact_pokestop_verified,false);
   assert.equal(p.exact_research_trigger_verified,false);
   assert.equal(p.coordinate_type,'community_site_reference');
 }
 assert.equal(places.find(p=>p.name==='Tyntesfield').coordinates,'51.44079,-2.71242');
 assert.equal(places.find(p=>p.name==='Wimpole Estate').coordinates,'52.14105,-0.04978');
 assert.equal(places.find(p=>p.name==='Belton Estate').coordinates,'52.94307,-0.617821');
 assert.equal(places.find(p=>p.name==='Clumber Park').coordinates,'53.27095,-1.051910');
 assert.equal(core.parseCoord('95.0,-2.7'),null);
 assert.equal(core.parseCoord('15,15,15'),null);
});
test('unverified/spoofed exact PokéStops never pass the coordinate loader',()=>{
 const p=doc.places[0];
 const fake={...p,exact_pokestop_verified:true};
 const q={...p,coordinate_type:'exact_pokestop'};
 assert.equal(core.validPlaces({...doc,places:[fake,q]}).length,0);
 assert.throws(()=>core.validPlaces({schema:'other',places:[]}));
});
test('one-tap copy, official sources, no GPS modification or fake no-cooldown guarantee',()=>{
 assert.match(js,/navigator\.clipboard\.writeText\(v\)/);
 assert.match(js,/data-coord/);
 assert.match(js,/NÃO|não são pontos exatos/i);
 assert.doesNotMatch(js,/navigator\.geolocation\.|watchPosition\(|getCurrentPosition\(/);
 assert.doesNotMatch(js,/innerHTML\s*=\s*(?:p\.name|p\.coordinates)/);
 assert.ok(html.includes('national-trust-v1.js?v=20261014-trust27a'));
 assert.ok(html.includes('national-trust-v1.css?v=20261014-trust27a'));
 assert.ok(sw.includes('./data/national-trust-2026.json'));
 assert.ok(sw.includes('./national-trust-v1.js'));
 assert.ok(sw.includes('./national-trust-v1.css'));
 assert.match(sw,/pvp\|national-trust-2026/);
 assert.match(sw,/pushsubscriptionchange/);
});
