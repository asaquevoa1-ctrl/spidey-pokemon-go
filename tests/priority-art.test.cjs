const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
function setup(){
 const window={},document={addEventListener(){},querySelectorAll(){return []}};
 const data=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));
 const context=vm.createContext({window,document,URL,state:{events:data.events||data},eventList:{},renderEvents(){},openEvent(){},MutationObserver:class{observe(){}},setTimeout(){},queueMicrotask(){}});
 for(const file of ['premium-approved-master.js','preview-art.js','art-system.js','premium-event-art.js','weekly.js'])vm.runInContext(fs.readFileSync('spidey-app/'+file,'utf8').replace(/\nloadWeeklyData\(\);\s*$/,''),context);
 return {window,context};
}
test('full posters stay identical across roles and Weekly without granting approval',()=>{
 const {window:w,context}=setup();
 const record=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_REVIEW_20261001.json','utf8'));
 for(const candidate of record.candidates){
  const e={id:candidate.event_id},draft=w.SPIDEY_PREVIEW_ART[e.id];
  assert.equal(draft.status,'PENDING_REVIEW');assert.equal(w.SPIDEY_APPROVED_ART_MASTER[e.id],undefined);assert.equal(w.SPIDEY_PREMIUM_EVENT_ART[e.id],undefined);
  const file=fs.readFileSync('spidey-app/'+draft.file);
  assert.equal(crypto.createHash('sha256').update(file).digest('hex'),candidate.sha256);
  assert.equal(draft.sha256,candidate.sha256);assert.equal(draft.width,file.readUInt32BE(16));assert.equal(draft.height,file.readUInt32BE(20));
  for(const role of ['thumb','card','weekly','hero','poster']){
   const a=w.SpideyArt.resolve(e,role);assert.equal(a.url,draft.file);assert.equal(a.status,'PENDING_REVIEW');assert.equal(a.standard,undefined);
  }
  assert.equal(context.weeklyArtUrl(e),draft.file+'?v='+draft.sha256.slice(0,12));
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(candidate.input_file)).digest('hex'),candidate.input_sha256);
 }
 const applin={id:'2026-09-harvest-festival-applin'};
 assert.equal(w.SPIDEY_PREVIEW_ART[applin.id],undefined);assert.equal(w.SpideyReviewArt.poster(applin),null);assert.equal(context.weeklyArtUrl(applin),'');
});
test('approved masters and unavailable originals stay protected from unrelated candidate posters',()=>{
 const {window:w}=setup(),record=w.SPIDEY_PREVIEW_ART['2026-10-harvest-taken-over'];
 w.SPIDEY_PREVIEW_ART={...w.SPIDEY_PREVIEW_ART,'2026-09-raids-xerneas':record,broken:record};
 const x=w.SPIDEY_APPROVED_ART_MASTER['2026-09-raids-xerneas'];
 assert.equal(w.SpideyArt.resolve({id:'2026-09-raids-xerneas'},'hero').url,x.file);
 w.SPIDEY_APPROVED_ART_MASTER={...w.SPIDEY_APPROVED_ART_MASTER,broken:{file:'broken.avif',sha256:'abc'}};
 w.SPIDEY_UNAVAILABLE_ART={...w.SPIDEY_UNAVAILABLE_ART,'broken.avif':'TRUNCATED_CONTAINER'};
 assert.equal(w.SpideyArt.resolve({id:'broken'},'hero'),null);
 assert.equal(w.SpideyReviewArt.poster({id:'broken'}),null);
});
