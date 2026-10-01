const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
function setup(){
 const window={},document={addEventListener(){},querySelectorAll(){return []}};
 const data=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));
 const context=vm.createContext({window,document,URL,state:{events:data.events||data},eventList:{},renderEvents(){},openEvent(){},MutationObserver:class{observe(){}},setTimeout(){},queueMicrotask(){}});
 for(const file of ['premium-approved-master.js','preview-art.js','art-system.js','premium-event-art.js','weekly.js'])vm.runInContext(fs.readFileSync('spidey-app/'+file,'utf8').replace(/\nloadWeeklyData\(\);\s*$/,''),context);
 return {window,context};
}
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
 for(const id of ['2026-10-01-spotlight-seedot','2026-10-zorua-community-day']){
  assert.equal(w.SPIDEY_APPROVED_ART_MASTER[id],undefined);assert.equal(w.SPIDEY_PREVIEW_ART[id].status,'PENDING_REVIEW');
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
