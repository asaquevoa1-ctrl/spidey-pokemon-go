const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('GBL 20-27 candidate is exact, official and not approved before delegated QA',()=>{
  const record=JSON.parse(fs.readFileSync('docs/qa/GBL_20_27_ART_CANDIDATE_20261012.json'));
  const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
  const event=events.find(item=>item.id===record.event_id);
  const window={};
  vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  vm.runInNewContext(fs.readFileSync('spidey-app/preview-art.js','utf8'),{window});
  assert.equal(record.status,'PENDING_REVIEW');
  assert.equal(event.source.confidence,'official');
  assert.equal(event.calendar.mode,'start');
  assert.equal(event.schedule.start_brazil,record.schedule.start_brazil);
  assert.equal(event.schedule.end_brazil,record.schedule.end_brazil);
  assert.equal(hash(record.candidate_file),record.sha256);
  assert.equal(fs.statSync(record.candidate_file).size,record.bytes);
  const png=fs.readFileSync(record.candidate_file);
  assert.equal(png.readUInt32BE(16),record.width);
  assert.equal(png.readUInt32BE(20),record.height);
  assert.equal(window.SPIDEY_APPROVED_ART_MASTER[record.event_id],undefined);
  assert.equal(window.SPIDEY_PREVIEW_ART[record.event_id].sha256,record.sha256);
  for(const id of record.blocked_generations_preserved)assert.equal(window.SPIDEY_APPROVED_ART_MASTER[id],undefined);
});
