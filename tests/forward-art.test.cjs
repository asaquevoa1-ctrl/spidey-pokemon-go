const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
test('the forward Premium batch preserves every prior approval and binds its reviewed originals to the right events',()=>{
 const approval=JSON.parse(fs.readFileSync('docs/qa/FORWARD_ART_APPROVAL_20261011.json'));
 const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
 const master=window.SPIDEY_APPROVED_ART_MASTER;
 assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
 assert.equal(approval.individual_human_approval_claimed,false);
 assert.equal(hash(approval.authorization_record),approval.authorization_sha256);
 assert.equal(hash(approval.candidate_record),approval.candidate_record_sha256);
 assert.equal(hash(approval.candidate_browser_record),approval.candidate_browser_sha256);
 for(const [id,old]of Object.entries(approval.preserved_master_entries)){
  assert.deepEqual(JSON.parse(JSON.stringify(master[id])),old);
  assert.equal(hash('spidey-app/'+old.file),old.sha256);
 }
 for(const art of approval.artworks){
  assert.equal(hash(art.candidate_file),art.sha256);assert.equal(hash(art.approved_file),art.sha256);
  const png=fs.readFileSync(art.approved_file);assert.equal(png.readUInt32BE(16),art.width);assert.equal(png.readUInt32BE(20),art.height);
  for(const id of art.event_ids){assert.equal(master[id].file,art.approved_file.replace('spidey-app/',''));assert.equal(master[id].sha256,art.sha256);}
 }
 for(const id of approval.blocked_generations_preserved)assert.equal(master[id],undefined);
});
