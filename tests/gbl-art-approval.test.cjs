const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('GBL delegated approval promotes the exact reviewed PNG and no protected refusal',()=>{
  const approval=JSON.parse(fs.readFileSync('docs/qa/GBL_ART_APPROVAL_20261012.json'));
  const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  vm.runInNewContext(fs.readFileSync('spidey-app/preview-art.js','utf8'),{window});
  const master=window.SPIDEY_APPROVED_ART_MASTER;
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.equal(hash(approval.candidate_file),approval.sha256);
  assert.equal(hash(approval.approved_file),approval.sha256);
  assert.ok(fs.existsSync(approval.approved_file));
  assert.notEqual(master[approval.event_id].file,approval.approved_file.replace('spidey-app/',''));
  assert.equal(window.SPIDEY_PREVIEW_ART[approval.event_id],undefined);
  for(const id of approval.blocked_generations_preserved)assert.equal(master[id],undefined);
});
