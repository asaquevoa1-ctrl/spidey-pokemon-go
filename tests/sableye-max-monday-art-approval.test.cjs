const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
test('Sableye Max Monday delegated approval promotes exact reviewed PNG and preserves refusals',()=>{
  const approval=JSON.parse(fs.readFileSync('docs/qa/SABLEYE_MAX_MONDAY_ART_APPROVAL_20261018.json'));
  const candidate=JSON.parse(fs.readFileSync(approval.candidate_record));
  const event=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events.find(item=>item.id===approval.event_id);
  const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  const master=window.SPIDEY_APPROVED_ART_MASTER;
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.ok(['PENDING_CI','PASSED_PREVIEW'].includes(approval.browser_qa.status));
  assert.equal(approval.browser_qa.checks,12);
  assert.equal(candidate.generation,'builtin imagegen');
  assert.equal(candidate.sources.official_schedule.confidence,'official');
  assert.equal(candidate.sources.community_catalog.confidence,'verified_community');
  assert.equal(candidate.schedule.daily_window_printed_on_poster,false);
  assert.equal(event.source.confidence,'official');
  assert.equal(event.verification_sources[0].confidence,'community');
  assert.equal(event.presentation.requires_art,true);
  assert.equal(hash(approval.authorization_record),approval.authorization_sha256);
  assert.equal(hash(approval.candidate_file),approval.sha256);
  assert.equal(hash(approval.approved_file),approval.sha256);
  assert.equal(fs.statSync(approval.approved_file).size,approval.bytes);
  assert.equal(master[approval.event_id].file,approval.approved_file.replace('spidey-app/',''));
  assert.equal(master[approval.event_id].sha256,approval.sha256);
  // This historical baseline predates the independently approved 24 October flow poster.
  const priorMaster=Object.fromEntries(Object.entries(master).filter(([id])=>id!=='2026-10-24-spidey-full-day-guide'));
  assert.equal(Object.keys(priorMaster).filter(id=>!['2026-pokemon-night-out-la','2026-pokemon-night-out-london'].includes(id)).length,approval.prior_master_entries_preserved+1); // Reuse of already approved Night Out poster does not create a new art asset.
  assert.equal(new Set(Object.values(priorMaster).map(item=>item.file)).size,approval.prior_unique_images_preserved+1);
  for(const id of approval.blocked_generations_preserved)assert.equal(master[id],undefined);
});
