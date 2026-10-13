const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('GBL Halloween delegated approval promotes the exact reviewed PNG and preserves protected refusals',()=>{
  const approval=JSON.parse(fs.readFileSync('docs/qa/GBL_27_1103_ART_APPROVAL_20261013.json'));
  const candidate=JSON.parse(fs.readFileSync(approval.candidate_record));
  const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  const master=window.SPIDEY_APPROVED_ART_MASTER;
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.equal(approval.browser_qa.status,'PASSED_PREVIEW');
  assert.equal(approval.browser_qa.checks,12);
  assert.equal(candidate.generation,'builtin imagegen');
  assert.equal(hash(approval.candidate_file),approval.sha256);
  assert.equal(hash(approval.approved_file),approval.sha256);
  assert.equal(master[approval.event_id].file,approval.approved_file.replace('spidey-app/',''));
  assert.equal(master[approval.event_id].sha256,approval.sha256);
  assert.equal(master[approval.event_id].width,approval.width);
  assert.equal(master[approval.event_id].height,approval.height);
  assert.equal(Object.keys(master).length,approval.prior_master_entries_preserved+1);
  for(const id of approval.blocked_generations_preserved)assert.equal(master[id],undefined);
});
