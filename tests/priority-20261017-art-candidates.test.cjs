const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ids=["2026-ana-pokemon-jet-red","2026-ana-pokemon-jet-green","2026-10-24-fc-seoul","2026-national-trust-27-sites"],names=["ana-pokemon-jet-red-2026","ana-pokemon-jet-green-2026","fc-seoul-20261024","national-trust-27-2026"];
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const qa=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json','utf8'));
const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
const master=window.SPIDEY_APPROVED_ART_MASTER;
test('four rejected posters have been withdrawn from registry and published files',()=>{
 assert.equal(qa.status,'REJECTED_BY_USER_AFTER_PUBLICATION');assert.equal(qa.user_visual_review,'REJECTED');
 for(let i=0;i<ids.length;i++){
  assert.equal(master[ids[i]],undefined,'User-rejected art cannot remain approved: '+ids[i]);
  assert.equal(fs.existsSync('spidey-app/assets/events/premium/'+names[i]+'-spidey-premium-v1.svg'),false);
  assert.ok(fs.existsSync('spidey-app/assets/events/review/'+names[i]+'-spidey-candidate-v1.svg'),'Review original remains for historical evidence');
 }
});
test('event and coordinates persist with neutral date fallback',()=>{
 for(const id of ids){const e=events.find(x=>x.id===id);assert.ok(e,id);assert.equal(e.presentation.requires_art,false);assert.equal(e.presentation.fallback_visual,'date')}
 const a=events.find(x=>x.id===ids[0]),b=events.find(x=>x.id===ids[1]);
 assert.equal(a.locations.length,7);assert.equal(b.locations.length,14);assert.equal(a.gpx.enabled,false);assert.equal(b.gpx.enabled,false);
 assert.equal(events.find(x=>x.id===ids[2]).status,'published');
 const trust=events.find(x=>x.id===ids[3]);assert.equal(trust.calendar.mode,'hidden');assert.equal(trust.gpx.enabled,false);
 assert.equal(JSON.parse(fs.readFileSync('spidey-app/data/national-trust-2026.json','utf8')).places.length,27);
});
test('invalidated approval and refreshed cache prevents republishing rejections',()=>{
 const html=fs.readFileSync('spidey-app/index.html','utf8');
 assert.ok(html.includes('premium-approved-master.js?v=20261017-mega-charizard-xy-raids-art1'));
 assert.equal(qa.individual_human_approval_claimed,false);assert.equal(qa.artworks.length,4);
});
