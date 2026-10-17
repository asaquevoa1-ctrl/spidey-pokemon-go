const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');

const ART={
 '2026-ana-pokemon-jet-red':'ana-pokemon-jet-red-2026-spidey-candidate-v1.svg',
 '2026-ana-pokemon-jet-green':'ana-pokemon-jet-green-2026-spidey-candidate-v1.svg',
 '2026-10-24-fc-seoul':'fc-seoul-20261024-spidey-candidate-v1.svg',
 'national-trust':'national-trust-27-2026-spidey-candidate-v1.svg'
};
const catalog=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const brand=fs.readFileSync('assets/spidey-logo-oficial.jpg');
function artwork(filename){return fs.readFileSync('spidey-app/assets/events/review/'+filename,'utf8')}

test('four distinct originals are staged for QA without silently granting Premium approval',()=>{
 const master=fs.readFileSync('spidey-app/premium-approved-master.js','utf8');
 const seen=new Set();
 for(const [id,file] of Object.entries(ART)){
   const s=artwork(file);assert.ok(s.includes('<svg ') && s.includes('</svg>'));
   assert.match(s,/width="1122" height="1402"/);
   assert.match(s,/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
   assert.doesNotMatch(s,/SpideyNexus/i);
   assert.ok(s.includes('data:image/png;base64,'));
   const logoMatch=s.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
   assert.ok(logoMatch,'Official logo embedded');
   assert.equal(crypto.createHash('sha256').update(Buffer.from(logoMatch[1],'base64')).digest('hex'),crypto.createHash('sha256').update(brand).digest('hex'),'Must preserve official logo bytes');
   assert.equal(master.includes('"'+id+'":'),false,'Review-only candidate is not APPROVED');
   const hash=crypto.createHash('sha256').update(s).digest('hex');
   assert.ok(!seen.has(hash));seen.add(hash);
 }
 assert.equal(seen.size,4);
});

test('ANA and FC Seoul verified content stays available and National Trust stays at 27 points',()=>{
 for(const id of Object.keys(ART).filter(id=>id!=='national-trust'))assert.ok(catalog.some(e=>e.id===id),id);
 const red=catalog.find(e=>e.id==='2026-ana-pokemon-jet-red');
 const green=catalog.find(e=>e.id==='2026-ana-pokemon-jet-green');
 assert.equal(red.locations.length,7);
 assert.equal(green.locations.length,14);
 assert.equal(red.gpx.enabled,false);
 assert.equal(green.gpx.enabled,false);
 assert.equal(JSON.parse(fs.readFileSync('spidey-app/data/national-trust-2026.json','utf8')).places.length,27);
});

test('SVG previews carry distinct protagonist copy and defensible location information',()=>{
 const red=artwork(ART['2026-ana-pokemon-jet-red']), green=artwork(ART['2026-ana-pokemon-jet-green']);
 assert.ok(red.includes('CHARMANDER'));assert.ok(red.includes('6 AEROPORTOS'));
 assert.ok(green.includes('BULBASAUR'));assert.ok(green.includes('14 AEROPORTOS'));
 const seoul=artwork(ART['2026-10-24-fc-seoul']);
 assert.ok(seoul.includes('FC SEOUL'));assert.ok(seoul.includes('CHARIZARD'));
 const trust=artwork(ART['national-trust']);
 assert.ok(trust.includes('NATIONAL TRUST'));assert.ok(trust.includes('27 LOCAIS'));
});
