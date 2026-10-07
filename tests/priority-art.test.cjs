const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
function setup(){
 const window={},document={addEventListener(){},querySelectorAll(){return []}};
 const data=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));
 const context=vm.createContext({window,document,URL,state:{events:data.events||data},eventList:{},renderEvents(){},openEvent(){},MutationObserver:class{observe(){}},setTimeout(){},queueMicrotask(){}});
 for(const file of ['premium-approved-master.js','preview-art.js','art-system.js','premium-event-art.js','weekly.js'])vm.runInContext(fs.readFileSync('spidey-app/'+file,'utf8').replace(/\nloadWeeklyData\(\);\s*$/,''),context);
 return {window,context};
}
const goPassApproval=JSON.parse(fs.readFileSync('docs/qa/GO_PASS_APPROVAL_20261003.json','utf8'));
const latiosApproval=JSON.parse(fs.readFileSync('docs/qa/LATIOS_APPROVAL_20261003.json','utf8'));
const scenicSundayApproval=JSON.parse(fs.readFileSync('docs/qa/SCENIC_SUNDAY_APPROVAL_20261003.json','utf8'));
const showcaseTuesdayApproval=JSON.parse(fs.readFileSync('docs/qa/SHOWCASE_TUESDAY_APPROVAL_20261003.json','utf8'));
const remainingArtBatch=JSON.parse(fs.readFileSync('docs/qa/REMAINING_ART_BATCH_20261003.json','utf8'));
const weeklyArtCompletion=JSON.parse(fs.readFileSync('docs/qa/WEEKLY_ART_COMPLETION_20261004.json','utf8'));
const wildAreaArtApproval=JSON.parse(fs.readFileSync('docs/qa/WILD_AREA_ART_APPROVAL_20261007.json','utf8'));
test('Wild Area uses the three reviewed posters in every role without replacing earlier approvals or changing the catalog',()=>{
 const {window:w,context}=setup(),batch=wildAreaArtApproval;
 const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const review=JSON.parse(fs.readFileSync(batch.candidate_record,'utf8'));
 assert.equal(batch.status,'APPROVED_DELEGATED_QA_PASSED');
 assert.equal(batch.approval_basis,'USER_DELEGATED_VISUAL_QA');
 assert.equal(hash(batch.authorization_record),batch.authorization_sha256);
 assert.equal(hash(batch.candidate_record),batch.candidate_record_sha256);
 assert.equal(hash('spidey-app/data/events.json'),batch.catalog_sha256);
 assert.equal(Object.keys(batch.preserved_master_entries).length,32);
 assert.equal(Object.keys(w.SPIDEY_APPROVED_ART_MASTER).length,35);
 assert.equal(batch.artworks.length,3);assert.equal(review.status,'PENDING_REVIEW');
 for(const [id,old] of Object.entries(batch.preserved_master_entries)){
  assert.deepEqual(JSON.parse(JSON.stringify(w.SPIDEY_APPROVED_ART_MASTER[id])),old);
  assert.equal(hash('spidey-app/'+old.file),old.sha256);
 }
 for(const a of batch.artworks){
  const master=w.SPIDEY_APPROVED_ART_MASTER[a.event_id],png=fs.readFileSync(a.approved_file);
  assert.deepEqual(png,fs.readFileSync(a.candidate_file));assert.equal(hash(a.approved_file),a.sha256);
  assert.equal(png.length,a.bytes);assert.equal(png.readUInt32BE(16),a.width);assert.equal(png.readUInt32BE(20),a.height);
  assert.equal(master.status,'APPROVED');assert.equal(master.display,'full_poster');
  assert.equal('spidey-app/'+master.file,a.approved_file);assert.equal(master.sha256,a.sha256);
  assert.equal(w.SPIDEY_PREVIEW_ART[a.event_id],undefined);assert.equal(w.SpideyReviewArt.poster({id:a.event_id}),null);
  for(const role of ['thumb','card','weekly','hero','poster']){
   const asset=w.SpideyArt.resolve({id:a.event_id},role);
   assert.equal(asset.url,master.file);assert.equal(asset.sha256,a.sha256);assert.match(asset.sourceRole,/^premium_catalog:/);
  }
  assert.equal(context.weeklyArtUrl({id:a.event_id}),master.file+'?v='+a.sha256.slice(0,12));
  for(const ref of a.generation.references)assert.equal(hash(ref.file),ref.sha256);
 }
 for(const id of batch.blocked_generations_preserved)assert.equal(w.SPIDEY_APPROVED_ART_MASTER[id],undefined);
});
test('the weekly completion binds seven original posters across roles, preserves all 25 earlier masters and respects generation refusals',()=>{
 const {window:w,context}=setup(),batch=weeklyArtCompletion;
 const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 assert.equal(batch.status,'APPROVED_DELEGATED_QA_PASSED');
 assert.equal(batch.approval_basis,'USER_DELEGATED_VISUAL_QA');
 assert.equal(batch.artworks.length,7);assert.equal(Object.keys(batch.preserved_master_entries).length,25);
 assert.equal(hash(batch.authorization_record),batch.authorization_sha256);
 for(const [id,old] of Object.entries(batch.preserved_master_entries)){
  assert.deepEqual(JSON.parse(JSON.stringify(w.SPIDEY_APPROVED_ART_MASTER[id])),old);
  assert.equal(hash('spidey-app/'+old.file),old.sha256);
 }
 for(const a of batch.artworks){
  const master=w.SPIDEY_APPROVED_ART_MASTER[a.event_id],bytes=fs.readFileSync(a.approved_file);
  assert.deepEqual(bytes,fs.readFileSync(a.candidate_file));assert.equal(hash(a.approved_file),a.sha256);
  assert.equal(bytes.length,a.bytes);assert.equal(bytes.readUInt32BE(16),a.width);assert.equal(bytes.readUInt32BE(20),a.height);
  assert.equal('spidey-app/'+master.file,a.approved_file);assert.equal(master.status,'APPROVED');assert.equal(master.display,'full_poster');
  for(const role of ['thumb','card','weekly','hero','poster']){
   const asset=w.SpideyArt.resolve({id:a.event_id},role);assert.equal(asset.url,master.file);assert.equal(asset.sha256,a.sha256);
  }
  assert.equal(context.weeklyArtUrl({id:a.event_id}),master.file+'?v='+a.sha256.slice(0,12));
  for(const ref of a.generation.references)assert.equal(hash(ref.file),ref.sha256);
 }
 for(const id of batch.blocked_generations_preserved)assert.equal(w.SPIDEY_APPROVED_ART_MASTER[id],undefined);
 assert.equal(batch.artworks.find(a=>a.event_id==='2026-10-halloween-part-1').source_classification,'community_mirror');
});
test('October GO Pass approval binds the displayed PNG, preserves earlier masters and keeps paid/rank conditions explicit',()=>{
 const {window:w,context}=setup(),record=JSON.parse(fs.readFileSync('docs/qa/GO_PASS_REVIEW_20261003.json','utf8'));
 const c=record.candidates[0],events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events,e=events.find(e=>e.id===c.event_id);
 assert.equal(record.status,'PENDING_REVIEW');assert.equal(record.approval,null);
 const approval=goPassApproval,a=approval.artworks[0],master=w.SPIDEY_APPROVED_ART_MASTER[e.id];
 assert.equal(approval.status,'APPROVED');assert.equal(approval.decision.text,'Fantástico\nEu aprovo');assert.equal(approval.decision.at,'2026-10-03T09:04:55-03:00');
 assert.deepEqual(approval.event_ids,['2026-10-go-pass']);assert.equal(approval.artworks.length,1);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(approval.candidate_record)).digest('hex'),approval.candidate_record_sha256);
 assert.equal(c.event_id,'2026-10-go-pass');assert.equal(c.revision,1);assert.equal(c.source_classification,'official');
 assert.equal(e.schedule.start_local,'2026-10-06T10:00:00-03:00');assert.equal(e.schedule.end_local,'2026-11-03T10:00:00-03:00');
 assert.equal(e.title,'Passe GO: Outubro');assert.equal(e.source.confidence,'official');assert.equal(e.source.url,'https://pokemongo.com/pt-BR/news/go-pass-october-2026');
 assert.ok(e.bonuses.includes('Globo da Sorte como recompensa final do Passe GO Deluxe (versão paga).'));
 assert.ok(e.bonuses.includes('Ao atingir o Ranque 50: 2× duração do Incenso de Aventura Diário.'));
 assert.equal(e.calendar.mode,'hidden');assert.equal(e.gpx.enabled,false);
 const file=fs.readFileSync(c.file),hash=crypto.createHash('sha256').update(file).digest('hex');
 assert.equal(hash,c.sha256);assert.equal(file.length,c.bytes);assert.equal(file.readUInt32BE(16),c.width);assert.equal(file.readUInt32BE(20),c.height);
 assert.deepEqual(fs.readFileSync(a.approved_file),file);assert.equal(a.candidate_file,c.file);assert.equal(a.candidate_revision,c.revision);
 assert.equal(a.displayed_asset.file,c.file);assert.equal(a.displayed_asset.sha256,c.sha256);assert.match(a.displayed_asset.via,/PNG completo exibido diretamente no chat/);
 assert.equal(master.status,'APPROVED');assert.equal(master.display,'full_poster');assert.equal(master.sha256,c.sha256);assert.equal('spidey-app/'+master.file,a.approved_file);
 assert.equal(master.width,c.width);assert.equal(master.height,c.height);assert.equal(master.approval_record,'docs/qa/GO_PASS_APPROVAL_20261003.json');assert.equal(w.SPIDEY_PREMIUM_EVENT_ART[e.id].visualApproved,true);
 assert.equal(w.SPIDEY_PREVIEW_ART[e.id],undefined);assert.equal(w.SpideyReviewArt.poster(e),null);
 for(const role of ['thumb','card','weekly','hero','poster']){
  const art=w.SpideyArt.resolve(e,role);assert.equal(art.url,master.file);assert.equal(art.sha256,c.sha256);assert.equal(art.standard,'spidey-premium-v1');assert.match(art.sourceRole,/^premium_catalog:/);
 }
 assert.equal(context.weeklyArtUrl(e),master.file+'?v='+c.sha256.slice(0,12));
 assert.equal(approval.previous_master_sha256,record.preserved_master_sha256);assert.equal(Object.keys(approval.preserved_master_entries).length,14);
 assert.deepEqual(approval.preserved_master_entries,record.preserved_master_entries);
 assert.deepEqual(Object.keys(w.SPIDEY_APPROVED_ART_MASTER).sort(),[...Object.keys(approval.preserved_master_entries),e.id,...latiosApproval.event_ids,...scenicSundayApproval.event_ids,...showcaseTuesdayApproval.event_ids,...remainingArtBatch.event_ids,...weeklyArtCompletion.event_ids,...wildAreaArtApproval.event_ids].sort());
 for(const [id,old] of Object.entries(approval.preserved_master_entries))assert.deepEqual(JSON.parse(JSON.stringify(w.SPIDEY_APPROVED_ART_MASTER[id])),old);
 for(const old of Object.values(record.preserved_master_entries))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('spidey-app/'+old.file)).digest('hex'),old.sha256);
});
test('human approval binds only the exact two reviewed posters across roles and Weekly',()=>{
 const {window:w,context}=setup();
 const record=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_APPROVAL_20261001.json','utf8'));
 const review=JSON.parse(fs.readFileSync(record.candidate_record,'utf8'));
 assert.equal(record.status,'APPROVED');assert.equal(record.decision.text,'Sim, aprovo');
 assert.deepEqual(record.event_ids,['2026-10-harvest-taken-over','2026-10-gigantamax-cinderace-max-day']);
 assert.equal(record.artworks.length,2);assert.equal(review.status,'PENDING_REVIEW');
 for(const candidate of record.artworks){
  const e={id:candidate.event_id},approved=w.SPIDEY_APPROVED_ART_MASTER[e.id];
  assert.equal(approved.status,'APPROVED');assert.equal(approved.display,'full_poster');
  assert.equal(w.SPIDEY_PREVIEW_ART[e.id],undefined);assert.equal(w.SpideyReviewArt.poster(e),null);
  assert.equal(w.SPIDEY_PREMIUM_EVENT_ART[e.id].visualApproved,true);
  assert.equal('spidey-app/'+approved.file,candidate.approved_file);
  assert.equal(approved.approval_record,'docs/qa/PRIORITY_ART_APPROVAL_20261001.json');
  const file=fs.readFileSync(candidate.approved_file);
  assert.deepEqual(file,fs.readFileSync(candidate.candidate_file));
  assert.equal(crypto.createHash('sha256').update(file).digest('hex'),candidate.sha256);
  assert.equal(approved.sha256,candidate.sha256);assert.equal(approved.width,file.readUInt32BE(16));assert.equal(approved.height,file.readUInt32BE(20));
  assert.equal(candidate.sha256,review.candidates.find(c=>c.event_id===e.id).sha256);
  for(const role of ['thumb','card','weekly','hero','poster']){
   const a=w.SpideyArt.resolve(e,role);assert.equal(a.url,approved.file);assert.equal(a.standard,'spidey-premium-v1');assert.match(a.sourceRole,/^premium_catalog:/);
  }
  assert.equal(context.weeklyArtUrl(e),approved.file+'?v='+approved.sha256.slice(0,12));
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(candidate.input_file)).digest('hex'),candidate.input_sha256);
 }
 const applin={id:'2026-09-harvest-festival-applin'};
 assert.equal(w.SPIDEY_APPROVED_ART_MASTER[applin.id],undefined);
 assert.equal(w.SPIDEY_PREVIEW_ART[applin.id],undefined);assert.equal(w.SpideyReviewArt.poster(applin),null);assert.equal(context.weeklyArtUrl(applin),'');
 for(const id of ['2026-10-zorua-community-day']){
  assert.equal(w.SPIDEY_APPROVED_ART_MASTER[id].status,'APPROVED');assert.equal(w.SPIDEY_PREVIEW_ART[id],undefined);
 }
});
test('approved masters and unavailable originals stay protected from unrelated candidate posters',()=>{
 const {window:w}=setup(),candidate=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_REVIEW_20261001.json','utf8')).candidates[0];
 const record={file:candidate.file.replace(/^spidey-app\//,''),sha256:candidate.sha256,width:candidate.width,height:candidate.height,status:'PENDING_REVIEW',display:'full_poster'};
 w.SPIDEY_PREVIEW_ART={...w.SPIDEY_PREVIEW_ART,'2026-09-raids-xerneas':record,'2026-10-gigantamax-cinderace-max-day':record,broken:record};
 const x=w.SPIDEY_APPROVED_ART_MASTER['2026-09-raids-xerneas'];
 assert.equal(w.SpideyArt.resolve({id:'2026-09-raids-xerneas'},'hero').url,x.file);
 assert.equal(w.SpideyArt.resolve({id:'2026-10-gigantamax-cinderace-max-day'},'hero').url,w.SPIDEY_APPROVED_ART_MASTER['2026-10-gigantamax-cinderace-max-day'].file);
 w.SPIDEY_APPROVED_ART_MASTER={...w.SPIDEY_APPROVED_ART_MASTER,broken:{file:'broken.avif',sha256:'abc'}};
 w.SPIDEY_UNAVAILABLE_ART={...w.SPIDEY_UNAVAILABLE_ART,'broken.avif':'TRUNCATED_CONTAINER'};
 assert.equal(w.SpideyArt.resolve({id:'broken'},'hero'),null);
 assert.equal(w.SpideyReviewArt.poster({id:'broken'}),null);
});
test('Seedot human decision binds the exact reviewed PNG and preserves earlier masters',()=>{
 const {window:w,context}=setup();
 const approval=JSON.parse(fs.readFileSync('docs/qa/SEEDOT_APPROVAL_20261001.json','utf8'));
 const review=JSON.parse(fs.readFileSync(approval.candidate_record,'utf8'));
 assert.equal(approval.status,'APPROVED');assert.equal(approval.decision.text,'Sim, aprovo');
 assert.equal(review.status,'PENDING_REVIEW');assert.equal(review.candidates.length,1);
 const c=review.candidates[0],a=approval.artworks[0],e={id:c.event_id},master=w.SPIDEY_APPROVED_ART_MASTER[e.id];
 assert.deepEqual(approval.event_ids,[c.event_id]);assert.equal(approval.artworks.length,1);
 assert.equal(master.status,'APPROVED');assert.equal(master.display,'full_poster');
 assert.equal(master.approval_record,'docs/qa/SEEDOT_APPROVAL_20261001.json');
 assert.equal('spidey-app/'+master.file,a.approved_file);assert.equal(a.candidate_file,c.file);
 const file=fs.readFileSync(a.approved_file);
 assert.deepEqual(file,fs.readFileSync(c.file));assert.equal(file.length,a.bytes);
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),c.sha256);assert.equal(master.sha256,c.sha256);
 assert.equal(master.width,file.readUInt32BE(16));assert.equal(master.height,file.readUInt32BE(20));
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(c.input_file)).digest('hex'),c.input_sha256);
 assert.equal(w.SPIDEY_PREVIEW_ART[e.id],undefined);assert.equal(w.SpideyReviewArt.poster(e),null);
 assert.equal(w.SPIDEY_PREMIUM_EVENT_ART[e.id].visualApproved,true);
 for(const role of ['thumb','card','weekly','hero','poster']){
  const asset=w.SpideyArt.resolve(e,role);assert.equal(asset.url,master.file);assert.equal(asset.sha256,c.sha256);
  assert.equal(asset.standard,'spidey-premium-v1');assert.match(asset.sourceRole,/^premium_catalog:/);
 }
 assert.equal(context.weeklyArtUrl(e),master.file+'?v='+c.sha256.slice(0,12));
 assert.equal(approval.previous_master_sha256,review.preserved_master_sha256);
 const subsequentApproval=JSON.parse(fs.readFileSync('docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json','utf8'));
 const octoberApproval=JSON.parse(fs.readFileSync('docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.json','utf8'));
 assert.deepEqual(Object.keys(w.SPIDEY_APPROVED_ART_MASTER).sort(),[...Object.keys(approval.preserved_master_entries),e.id,...subsequentApproval.event_ids,...octoberApproval.event_ids,'2026-10-zorua-community-day',...JSON.parse(fs.readFileSync('docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json')).event_ids,...goPassApproval.event_ids,...latiosApproval.event_ids,...scenicSundayApproval.event_ids,...showcaseTuesdayApproval.event_ids,...remainingArtBatch.event_ids,...weeklyArtCompletion.event_ids,...wildAreaArtApproval.event_ids].sort());
 for(const [id,old] of Object.entries(approval.preserved_master_entries)){
  assert.deepEqual(JSON.parse(JSON.stringify(w.SPIDEY_APPROVED_ART_MASTER[id])),old);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('spidey-app/'+old.file)).digest('hex'),old.sha256);
 }
 const proof=fs.readFileSync(a.displayed_proof.file);
 assert.equal(crypto.createHash('sha256').update(proof).digest('hex'),a.displayed_proof.sha256);
});
test('Applin and Space generation refusals grant no asset or inferred approval',()=>{
 const {window:w,context}=setup(),record=JSON.parse(fs.readFileSync('docs/qa/NEXT_ART_REVIEW_20261001.json','utf8'));
 assert.equal(record.blocked.length,2);
 for(const b of record.blocked){
  assert.equal(b.file,null);assert.equal(w.SPIDEY_PREVIEW_ART[b.event_id],undefined);assert.equal(w.SPIDEY_APPROVED_ART_MASTER[b.event_id],undefined);
  assert.equal(w.SpideyReviewArt.poster({id:b.event_id}),null);assert.equal(context.weeklyArtUrl({id:b.event_id}),'');
 }
});
test('Mega Victreebel human approval binds the directly displayed v2 PNG and preserves all earlier masters',()=>{
 const {window:w,context}=setup(),approval=JSON.parse(fs.readFileSync('docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json'));
 const record=JSON.parse(fs.readFileSync(approval.candidate_record));
 const c=record.candidate,e={id:record.event_id},a=approval.artworks[0],master=w.SPIDEY_APPROVED_ART_MASTER[e.id];
 assert.equal(record.status,'PENDING_REVIEW');assert.equal(record.approval,null);
 assert.equal(approval.status,'APPROVED');assert.equal(approval.decision.text,'Sim, aprovo');assert.equal(approval.decision.at,'2026-10-01T22:09:17-03:00');
 assert.deepEqual(approval.event_ids,['2026-09-mega-victreebel-raids']);assert.equal(approval.artworks.length,1);
 assert.equal(a.revision,2);assert.equal(a.candidate_file,c.file);assert.equal(a.source_classification,'community');
 assert.equal(a.displayed_asset.file,c.file);assert.equal(a.displayed_asset.sha256,c.sha256);assert.match(a.displayed_asset.via,/PNG completo exibido diretamente no chat/);
 const file=fs.readFileSync(a.approved_file);assert.deepEqual(file,fs.readFileSync(c.file));assert.equal(file.length,c.bytes);assert.equal(file.length,a.bytes);
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),c.sha256);assert.equal(a.sha256,c.sha256);
 assert.equal(c.width,file.readUInt32BE(16));assert.equal(c.height,file.readUInt32BE(20));
 assert.equal(master.status,'APPROVED');assert.equal(master.display,'full_poster');assert.equal(master.sha256,c.sha256);
 assert.equal(master.width,c.width);assert.equal(master.height,c.height);assert.equal(master.approval_record,'docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json');
 assert.equal('spidey-app/'+master.file,a.approved_file);assert.equal(w.getSpideyApprovedArt(e.id),master.file);
 assert.equal(w.SPIDEY_PREVIEW_ART[e.id],undefined);assert.equal(w.SpideyReviewArt.poster(e),null);assert.equal(w.SPIDEY_PREMIUM_EVENT_ART[e.id].visualApproved,true);
 for(const role of ['thumb','card','weekly','hero','poster']){
  const asset=w.SpideyArt.resolve(e,role);assert.equal(asset.url,master.file);assert.equal(asset.sha256,c.sha256);
  assert.equal(asset.standard,'spidey-premium-v1');assert.match(asset.sourceRole,/^premium_catalog:/);
 }
 assert.equal(context.weeklyArtUrl(e),master.file+'?v='+c.sha256.slice(0,12));
 for(const previous of record.revision_history)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(previous.file)).digest('hex'),previous.sha256);
 for(const input of record.inputs)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(input.file)).digest('hex'),input.sha256);
 assert.equal(approval.previous_master_sha256,record.preserved_master_sha256);
 assert.equal(Object.keys(approval.preserved_master_entries).length,7);
 const octoberApproval=JSON.parse(fs.readFileSync('docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.json'));
 assert.deepEqual(Object.keys(w.SPIDEY_APPROVED_ART_MASTER).sort(),[...Object.keys(approval.preserved_master_entries),e.id,...octoberApproval.event_ids,'2026-10-zorua-community-day',...JSON.parse(fs.readFileSync('docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json')).event_ids,...goPassApproval.event_ids,...latiosApproval.event_ids,...scenicSundayApproval.event_ids,...showcaseTuesdayApproval.event_ids,...remainingArtBatch.event_ids,...weeklyArtCompletion.event_ids,...wildAreaArtApproval.event_ids].sort());
 for(const [id,old] of Object.entries(approval.preserved_master_entries)){
  assert.deepEqual(JSON.parse(JSON.stringify(w.SPIDEY_APPROVED_ART_MASTER[id])),old);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('spidey-app/'+old.file)).digest('hex'),old.sha256);
 }
 for(const id of Object.keys(w.SPIDEY_APPROVED_ART_MASTER))assert.equal(w.SPIDEY_PREVIEW_ART[id],undefined);
 assert.equal(w.SPIDEY_APPROVED_ART_MASTER['2026-10-zorua-community-day'].status,'APPROVED');
});
test('October human approval binds the three exact resent PNGs across roles and preserves earlier masters',()=>{
 const {window:w,context}=setup(),approval=JSON.parse(fs.readFileSync('docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.json'));
 const record=JSON.parse(fs.readFileSync(approval.candidate_record));
 assert.equal(record.status,'PENDING_REVIEW');assert.equal(record.approval,null);assert.equal(record.candidates.length,3);
 assert.equal(approval.status,'APPROVED');assert.equal(approval.decision.text,'Aprovo todas as três');assert.equal(approval.decision.at,'2026-10-02T07:16:30-03:00');
 assert.equal(record.source_classification,'COMMUNITY');
 assert.deepEqual(record.candidates.map(c=>c.event_id).sort(),['2026-10-raids-yveltal','2026-10-07-raid-hour-yveltal','2026-10-mega-blastoise-raids'].sort());
 assert.deepEqual(approval.event_ids,record.candidates.map(c=>c.event_id));assert.equal(approval.artworks.length,3);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(approval.candidate_record)).digest('hex'),approval.candidate_record_sha256);
 const files=new Set();
 for(const c of record.candidates){
  const e={id:c.event_id},p=w.SPIDEY_APPROVED_ART_MASTER[e.id],a=approval.artworks.find(a=>a.event_id===e.id),b=fs.readFileSync(a.approved_file);files.add(a.approved_file);
  assert.equal(c.status,'PENDING_REVIEW');assert.equal(p.status,'APPROVED');assert.equal(p.display,'full_poster');
  assert.equal(w.SPIDEY_PREVIEW_ART[e.id],undefined);assert.equal(w.SpideyReviewArt.poster(e),null);assert.equal(w.SPIDEY_PREMIUM_EVENT_ART[e.id].visualApproved,true);
  assert.deepEqual(b,fs.readFileSync(c.file));assert.equal(b.length,c.bytes);assert.equal(b.length,a.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),c.sha256);
  assert.equal('spidey-app/'+p.file,a.approved_file);assert.equal(a.candidate_file,c.file);assert.equal(a.candidate_revision,c.revision);
  assert.equal(c.width,b.readUInt32BE(16));assert.equal(c.height,b.readUInt32BE(20));assert.equal(p.sha256,c.sha256);assert.equal(a.sha256,c.sha256);
  assert.equal(p.approval_record,'docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.json');assert.equal(a.displayed_asset.file,c.file);assert.equal(a.displayed_asset.sha256,c.sha256);assert.equal(a.source_classification,'community');
  for(const role of ['thumb','card','weekly','hero','poster']){
   const asset=w.SpideyArt.resolve(e,role);assert.equal(asset.url,p.file);assert.equal(asset.sha256,c.sha256);assert.match(asset.sourceRole,/^premium_catalog:/);assert.equal(asset.standard,'spidey-premium-v1');
  }
  assert.equal(context.weeklyArtUrl(e),p.file+'?v='+c.sha256.slice(0,12));
 }
 assert.equal(files.size,3);
 assert.equal(approval.previous_master_sha256,record.preserved_master_sha256);assert.equal(Object.keys(approval.preserved_master_entries).length,8);
 assert.deepEqual(Object.keys(w.SPIDEY_APPROVED_ART_MASTER).sort(),[...Object.keys(approval.preserved_master_entries),...approval.event_ids,'2026-10-zorua-community-day',...JSON.parse(fs.readFileSync('docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json')).event_ids,...goPassApproval.event_ids,...latiosApproval.event_ids,...scenicSundayApproval.event_ids,...showcaseTuesdayApproval.event_ids,...remainingArtBatch.event_ids,...weeklyArtCompletion.event_ids,...wildAreaArtApproval.event_ids].sort());
 for(const [id,old] of Object.entries(approval.preserved_master_entries)){
  assert.deepEqual(JSON.parse(JSON.stringify(w.SPIDEY_APPROVED_ART_MASTER[id])),old);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('spidey-app/'+old.file)).digest('hex'),old.sha256);
 }
 for(const c of record.revision_history)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(c.file)).digest('hex'),c.sha256);
 for(const c of record.inputs)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(c.file)).digest('hex'),c.sha256);
});
test('Thundurus and Elgyem approval binds the displayed revisions while preserving twelve earlier masters',()=>{
 const {window:w,context}=setup(),approval=JSON.parse(fs.readFileSync('docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json'));
 const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const review=JSON.parse(fs.readFileSync(approval.candidate_record));
 assert.equal(approval.status,'APPROVED');assert.equal(approval.decision.text,'Com certeza, eu aprovo as duas novas artes');assert.equal(approval.decision.at,'2026-10-03T07:30:21-03:00');
 assert.equal(review.status,'PENDING_REVIEW');assert.equal(review.approval,null);assert.equal(hash(approval.candidate_record),approval.candidate_record_sha256);
 assert.deepEqual(approval.event_ids,['2026-10-shadow-thundurus','2026-10-08-spotlight-elgyem']);assert.equal(approval.artworks.length,2);
 assert.equal(Object.keys(approval.preserved_master_entries).length,12);
 assert.deepEqual(Object.keys(w.SPIDEY_APPROVED_ART_MASTER).sort(),[...Object.keys(approval.preserved_master_entries),...approval.event_ids,...goPassApproval.event_ids,...latiosApproval.event_ids,...scenicSundayApproval.event_ids,...showcaseTuesdayApproval.event_ids,...remainingArtBatch.event_ids,...weeklyArtCompletion.event_ids,...wildAreaArtApproval.event_ids].sort());
 for(const [id,old] of Object.entries(approval.preserved_master_entries)){assert.deepEqual(JSON.parse(JSON.stringify(w.SPIDEY_APPROVED_ART_MASTER[id])),old);assert.equal(hash('spidey-app/'+old.file),old.sha256);}
 for(const a of approval.artworks){
  const c=review.candidates.find(c=>c.event_id===a.event_id),e={id:a.event_id},master=w.SPIDEY_APPROVED_ART_MASTER[e.id];
  assert.equal(a.candidate_file,c.file);assert.equal(a.candidate_revision,c.revision);assert.equal(a.displayed_asset.file,c.file);assert.equal(a.displayed_asset.sha256,c.sha256);
  assert.equal(a.source_classification,'community');assert.deepEqual(fs.readFileSync(a.approved_file),fs.readFileSync(c.file));assert.equal(hash(a.approved_file),c.sha256);
  assert.equal(master.status,'APPROVED');assert.equal(master.display,'full_poster');assert.equal('spidey-app/'+master.file,a.approved_file);assert.equal(master.sha256,c.sha256);
  assert.equal(master.approval_record,'docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json');assert.equal(w.SPIDEY_PREVIEW_ART[e.id],undefined);assert.equal(w.SpideyReviewArt.poster(e),null);
  for(const role of ['thumb','card','weekly','hero','poster']){const art=w.SpideyArt.resolve(e,role);assert.equal(art.url,master.file);assert.equal(art.standard,'spidey-premium-v1');assert.match(art.sourceRole,/^premium_catalog:/);}
  assert.equal(context.weeklyArtUrl(e),master.file+'?v='+c.sha256.slice(0,12));assert.equal(w.SPIDEY_PREMIUM_EVENT_ART[e.id].visualApproved,true);
 }
 const elgyem=review.candidates.find(c=>c.event_id==='2026-10-08-spotlight-elgyem');
 assert.equal(elgyem.revision,2);assert.notEqual(elgyem.sha256,elgyem.revision_history[0].sha256);assert.equal(hash(elgyem.revision_history[0].file),elgyem.revision_history[0].sha256);
 assert.equal(approval.previous_master_sha256,review.preserved_master_sha256);
});
