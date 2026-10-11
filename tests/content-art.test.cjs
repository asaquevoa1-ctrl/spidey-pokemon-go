const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), crypto=require('node:crypto'), vm=require('node:vm');
const approval=JSON.parse(fs.readFileSync('docs/qa/CONTENT_NFL_APPROVAL_20261011.json','utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function master(){const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});return window.SPIDEY_APPROVED_ART_MASTER;}
test('the October recurring batch preserves all 35 original approvals and binds five exact posters to thirteen dates',()=>{
  const entries=master();
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.equal(approval.artworks.length,5);
  assert.equal(approval.event_ids.length,13);
  assert.equal(Object.keys(approval.preserved_master_entries).length,35);
  assert.equal(Object.keys(entries).length,48);
  for(const [id,old]of Object.entries(approval.preserved_master_entries)){
    assert.deepEqual(JSON.parse(JSON.stringify(entries[id])),old);
    assert.equal(hash('spidey-app/'+old.file),old.sha256);
  }
  assert.equal(hash(approval.candidate_record),approval.candidate_record_sha256);
  assert.equal(hash(approval.candidate_browser_record),approval.candidate_browser_sha256);
  assert.equal(hash(approval.authorization_record),approval.authorization_sha256);
  for(const art of approval.artworks){
    assert.equal(hash(art.candidate_file),art.sha256);
    assert.equal(hash(art.approved_file),art.sha256);
    const png=fs.readFileSync(art.approved_file);
    assert.equal(png.readUInt32BE(16),art.width);assert.equal(png.readUInt32BE(20),art.height);
    for(const id of art.event_ids){assert.equal(entries[id].file,art.approved_file.replace('spidey-app/',''));assert.equal(entries[id].sha256,art.sha256);}
  }
  for(const id of approval.blocked_generations_preserved)assert.equal(entries[id],undefined);
});
