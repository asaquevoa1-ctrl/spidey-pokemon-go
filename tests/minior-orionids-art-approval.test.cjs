const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('Minior Orionids delegated approval promotes the exact reviewed PNG and preserves protected refusals',()=>{
  const approval=JSON.parse(fs.readFileSync('docs/qa/MINIOR_ORIONIDS_ART_APPROVAL_20261012.json'));
  const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  vm.runInNewContext(fs.readFileSync('spidey-app/preview-art.js','utf8'),{window});
  const master=window.SPIDEY_APPROVED_ART_MASTER;
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.equal(approval.browser_qa.status,'PASSED_PREVIEW');
  assert.equal(approval.browser_qa.checks,12);
  assert.equal(hash(approval.candidate_file),approval.sha256);
  assert.equal(hash(approval.approved_file),approval.sha256);
  assert.ok(fs.existsSync(approval.approved_file));
  assert.notEqual(master[approval.event_id].file,approval.approved_file.replace('spidey-app/',''));
  const current=approval.current_revision;
  assert.equal(current.format,'PNG');
  assert.equal(hash(current.file),current.sha256);
  assert.equal(hash(current.source_art_preserved.file),current.source_art_preserved.sha256);
  assert.equal(current.identity.logo_sha256,hash(current.identity.logo_file));
  assert.equal(current.identity.legacy_spider_visible,false);
  assert.equal(current.identity.spideynexus_text_present,false);
  assert.equal(current.raster_comparison.pixels_outside_region_changed,0);
  assert.equal(master[approval.event_id].file,current.file.replace('spidey-app/',''));
  assert.equal(master[approval.event_id].sha256,current.sha256);
  assert.equal(window.SPIDEY_PREVIEW_ART[approval.event_id],undefined);
  for(const id of approval.blocked_generations_preserved)assert.equal(master[id],undefined);
});
