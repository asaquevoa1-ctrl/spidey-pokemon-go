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
  // Registro histórico para recompor a assinatura original de 82 aprovações.
  // Apenas o vínculo incorreto do cartaz Twitch/LA com Londres foi revogado:
  // o arquivo original, o hash e TODAS as outras aprovações devem coincidir.
  const revokedLondonMapping={
    file:'assets/events/premium/pokemon-night-out-20261024-approved-v1.png',
    status:'APPROVED',display:'full_poster',width:1024,height:1536,
    sha256:'a340c9e232cbe34a9a392d300ca3a287cf5df9a54af7bdb3d1e98b8cece933d3',
    approval_record:'docs/qa/POKEMON_NIGHT_OUT_ART_APPROVAL_20261013.json',
    approval_basis:'EXISTING_APPROVED_NIGHT_OUT_POSTER_REUSED_UNMODIFIED',
    art_note:'Identidade Night Out existente; detalhes oficiais dos fundos especiais da cidade constam no texto do evento.'
  };
  assert.equal(master['2026-pokemon-night-out-london'],undefined);
  const old=Object.fromEntries(record.preserved.prior_master_ids.map(id=>[
    id,id==='2026-pokemon-night-out-london'?revokedLondonMapping:master[id]
  ]));
  assert.equal(Object.keys(old).length,82);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex'),record.preserved.master_json_sha256);
  for(const item of Object.values(old)){
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync('spidey-app/'+item.file)).digest('hex'),item.sha256);
  }
});
