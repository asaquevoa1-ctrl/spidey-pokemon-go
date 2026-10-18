const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const governance=JSON.parse(fs.readFileSync('config/spidey-governance.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('config/spidey-protected-approved-baseline.json','utf8'));
const qa=JSON.parse(fs.readFileSync(governance.rejected_batch.record,'utf8'));
const window={};
vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
const master=window.SPIDEY_APPROVED_ART_MASTER;
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;

test('all agents share one explicit current-decision document',()=>{
 assert.equal(governance.canonical_document,'SPIDEY_DECISIONS_CURRENT.md');
 const docs=['AGENTS.md','.github/copilot-instructions.md','SPIDEY_DECISIONS_CURRENT.md'];
 for(const f of docs)assert.ok(fs.existsSync(f),f);
 assert.ok(fs.readFileSync('AGENTS.md','utf8').includes(governance.canonical_document));
 assert.ok(fs.readFileSync('.github/copilot-instructions.md','utf8').includes('AGENTS.md'));
 assert.equal(governance.product.no_user_manual_upload_or_deploy,true);
 assert.equal(governance.product.no_repeated_individual_art_approvals,true);
 assert.equal(governance.identity.render_test_is_visual_approval,false);
 assert.equal(governance.identity.visual_comparison_required,true);
});

test('rejected ANA, Seoul, Trust art never returns to approved master or published Premium SVG directory',()=>{
 assert.equal(qa.status,governance.rejected_batch.status);
 assert.equal(qa.user_visual_review,'REJECTED');
 const ids=governance.rejected_batch.ids;
 assert.equal(ids.length,4);
 assert.deepEqual(Array.from(ids),qa.artworks.map(x=>x.id));
 for(const entry of qa.artworks){
  assert.equal(master[entry.id],undefined,'User explicitly rejected '+entry.id);
  assert.equal(fs.existsSync(path.join('spidey-app',entry.file)),false,'Rejected file republished: '+entry.file);
  for(const approved of Object.values(master)){
   assert.notEqual(approved.sha256,entry.sha256,'Rejected SHA republished via another event ID');
   assert.notEqual(approved.file,entry.file.replace(/^spidey-app\\//,''),'Rejected file redirected in master');
  }
 }
});

test('all previously approved Premium records remain immutable unless baseline and rationale explicitly changed',()=>{
 assert.ok(Object.keys(baseline.art).length>=70,'Baseline unexpectedly incomplete');
 for(const [id,ref] of Object.entries(baseline.art)){
  const art=master[id];
  assert.ok(art,'Previously approved art removed without documented baseline revision: '+id);
  assert.equal(art.file,ref.file,'Approved file path changed: '+id);
  assert.equal(art.sha256,ref.sha256,'Approved bytes changed: '+id);
  assert.equal(art.status,'APPROVED');
 }
});

test('protect relevant event data and published Seoul event without publishing false GPS claims',()=>{
 const red=events.find(e=>e.id==='2026-ana-pokemon-jet-red');
 const green=events.find(e=>e.id==='2026-ana-pokemon-jet-green');
 const seoul=events.find(e=>e.id==='2026-10-24-fc-seoul');
 assert.ok(red&&green&&seoul,'ANA and Seoul events are preserved');
 assert.equal(red.locations.length,7);assert.equal(green.locations.length,14);
 assert.equal(red.gpx.enabled,false);assert.equal(green.gpx.enabled,false);
 assert.equal(seoul.status,'published');assert.equal(seoul.gpx.enabled,false);
 const trust=JSON.parse(fs.readFileSync('spidey-app/data/national-trust-2026.json','utf8'));
 assert.equal(trust.places.length,27);
});
