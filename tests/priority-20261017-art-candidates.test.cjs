const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const ART={
 '2026-ana-pokemon-jet-red':'ana-pokemon-jet-red-2026',
 '2026-ana-pokemon-jet-green':'ana-pokemon-jet-green-2026',
 '2026-10-24-fc-seoul':'fc-seoul-20261024',
 '2026-national-trust-27-sites':'national-trust-27-2026'
};
const catalog=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const brand=fs.readFileSync('assets/spidey-logo-oficial.jpg');
const qa=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json','utf8'));
const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
const master=window.SPIDEY_APPROVED_ART_MASTER;
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');

test('four distinct new Premium originals remain byte-identical to the reviewed candidates, with correct official logo and SHA-256',()=>{
 const hashes=new Set();
 for(const [id,basename] of Object.entries(ART)){
   const preview=fs.readFileSync('spidey-app/assets/events/review/'+basename+'-spidey-candidate-v1.svg');
   const approved=fs.readFileSync('spidey-app/assets/events/premium/'+basename+'-spidey-premium-v1.svg');
   assert.deepEqual(approved,preview,'The promoted file differs from QA');
   const s=approved.toString('utf8');
   assert.match(s,/<svg /);assert.match(s,/width="1122" height="1402"/);
   assert.doesNotMatch(s,/SpideyNexus/i);
   assert.ok(s.includes('data:image/png;base64,'));
   const logo=s.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
   assert.ok(logo,'official Spidey logo must be embedded');
   assert.equal(hash(Buffer.from(logo[1],'base64')),hash(brand));
   const entry=master[id];assert.ok(entry,'missing master record '+id);
   assert.equal(entry.status,'APPROVED');assert.equal(entry.display,'full_poster');
   assert.equal(entry.width,1122);assert.equal(entry.height,1402);
   assert.equal(entry.file,'assets/events/premium/'+basename+'-spidey-premium-v1.svg');
   assert.equal(entry.sha256,hash(approved));assert.ok(!hashes.has(entry.sha256));hashes.add(entry.sha256);
 }
 assert.equal(hashes.size,4);
});

test('ANA references, Seoul event and all 27 National Trust sites remain intact',()=>{
 const ids=Object.keys(ART);
 for(const id of ids)assert.ok(catalog.some(e=>e.id===id),id);
 const red=catalog.find(e=>e.id==='2026-ana-pokemon-jet-red');
 const green=catalog.find(e=>e.id==='2026-ana-pokemon-jet-green');
 const seoul=catalog.find(e=>e.id==='2026-10-24-fc-seoul');
 const trust=catalog.find(e=>e.id==='2026-national-trust-27-sites');
 assert.equal(red.locations.length,7);assert.equal(green.locations.length,14);
 assert.equal(red.gpx.enabled,false);assert.equal(green.gpx.enabled,false);
 assert.equal(red.status,'draft');assert.equal(green.status,'draft'); // ANA guide remains available without noisy year-long calendar.
 assert.equal(seoul.status,'published');assert.equal(seoul.presentation.requires_art,true);
 assert.equal(trust.calendar.mode,'hidden');assert.equal(trust.gpx.enabled,false);
 assert.equal(JSON.parse(fs.readFileSync('spidey-app/data/national-trust-2026.json','utf8')).places.length,27);
});

test('approved artwork appears in ANA and Trust dedicated guides without changing navigation, and QA is transparent',()=>{
 const ana=fs.readFileSync('spidey-app/ana-airports.js','utf8');
 const trust=fs.readFileSync('spidey-app/national-trust-v1.js','utf8');
 assert.ok(ana.includes("SPIDEY_APPROVED_ART_MASTER?.[phase]"));
 assert.ok(ana.includes("id=\\\"anaEventPoster\\\""));
 assert.ok(trust.includes("SPIDEY_APPROVED_ART_MASTER?.['2026-national-trust-27-sites']"));
 assert.ok(trust.includes('nt-poster-stage'));
 assert.equal(qa.individual_human_approval_claimed,false);
 assert.equal(qa.checks.android_physical,false);
 assert.equal(qa.artworks.length,4);
 for(const artwork of qa.artworks)assert.equal(master[artwork.id].sha256,artwork.sha256);
});
