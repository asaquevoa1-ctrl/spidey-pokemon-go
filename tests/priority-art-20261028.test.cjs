const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const record=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_APPROVAL_20261028.json'));
const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
const master=window.SPIDEY_APPROVED_ART_MASTER;
test('Giratina, Gastly and November GO Pass use the four reviewed raster posters',()=>{
  assert.equal(record.generation,'builtin imagegen');
  assert.equal(record.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(record.individual_human_approval_claimed,false);
  assert.equal(record.assets.length,4);
  for(const art of record.assets){
    const data=fs.readFileSync(art.file);
    assert.equal(data.subarray(0,4).toString(),'RIFF');
    assert.equal(data.subarray(8,12).toString(),'WEBP');
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'),art.sha256);
    assert.equal(master[art.event_id].file,art.file.replace('spidey-app/',''));
    assert.equal(master[art.event_id].sha256,art.sha256);
    assert.equal(master[art.event_id].display,'full_poster');
    assert.equal(master[art.event_id].width,1024);
    assert.equal(master[art.event_id].height,1536);
    assert.ok(fs.readFileSync('spidey-app/sw.js','utf8').includes(art.file.replace('spidey-app/','')));
  }
  assert.notEqual(master['2026-10-raids-giratina-origin'].file,master['2026-10-28-raid-hour-giratina-forma-origem'].file);
  assert.equal(record.rejected_versions.length,2);
  for(const rejected of record.rejected_versions){
    assert.equal(rejected.status,'REJECTED_BY_USER');
    for(const current of Object.values(master)){
      assert.notEqual(current.sha256,rejected.sha256,'A rejected Giratina must never return as approved');
      assert.notEqual(current.file,rejected.file.replace('spidey-app/',''));
    }
    assert.ok(!fs.readFileSync('spidey-app/sw.js','utf8').includes(rejected.file.replace('spidey-app/','')));
  }
  for(const id of record.blocked_generations_preserved)assert.equal(master[id],undefined);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(record.identity.original_logo)).digest('hex'),record.identity.logo_sha256);
});
test('priority art adds coverage without changing an earlier approval',()=>{
  const old=Object.fromEntries(record.preserved.prior_master_ids.map(id=>[id,master[id]]));
  assert.equal(Object.keys(old).length,82);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex'),record.preserved.master_json_sha256);
  for(const item of Object.values(old)){
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync('spidey-app/'+item.file)).digest('hex'),item.sha256);
  }
});
