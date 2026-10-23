const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('National Trust delegated approval uses the exact cosmic-S PNG and preserves the rejected SVG',()=>{
  const approval=JSON.parse(fs.readFileSync('docs/qa/NATIONAL_TRUST_ART_APPROVAL_20261023.json'));
  const candidate=JSON.parse(fs.readFileSync(approval.candidate_record));
  const rejected=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json'));
  const event=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events.find(item=>item.id===approval.event_id);
  const window={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  const master=window.SPIDEY_APPROVED_ART_MASTER;
  assert.equal(approval.approval_basis,'USER_DELEGATED_VISUAL_QA_AND_CURRENT_COSMIC_IDENTITY');
  assert.equal(approval.individual_human_approval_claimed,false);
  assert.ok(['PENDING_CI','PASSED_PREVIEW'].includes(approval.browser_qa.status));
  assert.equal(approval.browser_qa.checks,12);
  assert.equal(approval.browser_qa.fixture,'qa-only-calendar-and-weekly-visibility');
  assert.equal(candidate.generation,'builtin imagegen');
  assert.equal(candidate.visual_review.status,'PASSED_LOCAL_VISUAL_REVIEW');
  assert.equal(candidate.identity.logo_sha256,hash(candidate.identity.logo_file));
  assert.equal(candidate.visual_review.legacy_spider_visible,false);
  assert.equal(candidate.visual_review.spideynexus_text_present,false);
  assert.equal(hash(approval.authorization_record),approval.authorization_sha256);
  assert.equal(hash(approval.candidate_file),approval.sha256);
  assert.equal(hash(approval.approved_file),approval.sha256);
  assert.equal(fs.statSync(approval.approved_file).size,approval.bytes);
  assert.equal(master[approval.event_id].file,approval.approved_file.replace('spidey-app/',''));
  assert.equal(master[approval.event_id].sha256,approval.sha256);
  assert.equal(master[approval.event_id].width,1024);
  assert.equal(master[approval.event_id].height,1536);
  const document={addEventListener(){},querySelectorAll(){return []}};
  const context=vm.createContext({window,document,URL,state:{events:[event]},eventList:{},renderEvents(){},openEvent(){},MutationObserver:class{observe(){}},setTimeout(){},queueMicrotask(){}});
  for(const file of ['preview-art.js','art-system.js','premium-event-art.js'])vm.runInContext(fs.readFileSync('spidey-app/'+file,'utf8'),context);
  for(const role of ['thumb','card','weekly','hero','poster']){
    const resolved=window.SpideyArt.resolve(event,role);
    assert.equal(resolved.url,master[approval.event_id].file);
    assert.equal(resolved.sha256,approval.sha256);
  }
  assert.ok(Object.keys(master).length>=approval.prior_master_entries_preserved+1);
  assert.equal(event.source.confidence,'official');
  assert.equal(event.source.url,approval.source.url);
  assert.equal(event.status,'published');
  assert.equal(event.calendar.mode,'hidden');
  const old=rejected.artworks.find(item=>item.id===approval.event_id);
  assert.equal(rejected.status,'REJECTED_BY_USER_AFTER_PUBLICATION');
  assert.equal(old.sha256,candidate.rejected_art_preserved.sha256);
  assert.equal(fs.existsSync(old.file),false);
  for(const id of approval.blocked_generations_preserved)assert.equal(master[id],undefined);
});
