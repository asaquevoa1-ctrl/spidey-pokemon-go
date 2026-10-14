const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('official-logo corrections promote reviewed v2 PNGs while preserving every v1 binary',()=>{
  const approval=JSON.parse(fs.readFileSync('docs/qa/LOGO_CORRECTION_APPROVAL_20261012.json'));
  const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  const master=window.SPIDEY_APPROVED_ART_MASTER;
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.equal(approval.browser_qa.status,'PASSED_PREVIEW');
  assert.equal(approval.browser_qa.checks,36);
  for(const item of approval.items){
    assert.equal(hash(item.candidate_file),item.sha256);
    assert.equal(hash(item.approved_file),item.sha256);
    const upgraded=JSON.parse(fs.readFileSync('docs/qa/SPIDEY_PREMIUM_REFERENCE_FIVE_ARTS_20261014.json')).assets.find(x=>x.event_id===item.event_id);
    if(upgraded){
      assert.equal(upgraded.old_file,item.approved_file.replace('spidey-app/',''));
      assert.equal(master[item.event_id].file,upgraded.file.replace('spidey-app/',''));
      assert.equal(master[item.event_id].sha256,upgraded.sha256);
    }else{
    assert.equal(master[item.event_id].file,item.approved_file.replace('spidey-app/',''));
    assert.equal(master[item.event_id].sha256,item.sha256);
    }
    assert.ok(fs.existsSync(item.prior_file_preserved));
  }
  for(const id of approval.protected_refusals_preserved)assert.equal(master[id],undefined);
});
