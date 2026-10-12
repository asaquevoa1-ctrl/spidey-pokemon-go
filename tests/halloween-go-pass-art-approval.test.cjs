const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('Halloween GO Pass approval binds the exact reviewed poster and preserves protected refusals',()=>{
  const approval=JSON.parse(fs.readFileSync('docs/qa/HALLOWEEN_GO_PASS_ART_APPROVAL_20261012.json'));
  const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
  const event=events.find(item=>item.id===approval.event_id);
  const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  const master=window.SPIDEY_APPROVED_ART_MASTER;
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.equal(approval.browser_qa.status,'PASSED_PREVIEW');
  assert.equal(approval.browser_qa.checks,12);
  assert.equal(hash(approval.candidate_file),approval.sha256);
  assert.equal(hash(approval.approved_file),approval.sha256);
  assert.equal(master[approval.event_id].file,approval.approved_file.replace('spidey-app/',''));
  assert.equal(master[approval.event_id].sha256,approval.sha256);
  assert.equal(event.calendar.mode,'span');
  assert.equal(event.presentation.requires_art,true);
  for(const id of approval.protected_refusals_preserved)assert.equal(master[id],undefined);
});
