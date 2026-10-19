const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const vm=require('node:vm');
const hash=(buf)=>crypto.createHash('sha256').update(buf).digest('hex');

test('five explicitly approved Spidey Premium reference posters are the current event art, without removing originals',()=>{
  const record=JSON.parse(fs.readFileSync('docs/qa/SPIDEY_PREMIUM_REFERENCE_FIVE_ARTS_20261014.json','utf8'));
  const window={};
  vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window});
  const registry=window.SPIDEY_APPROVED_ART_MASTER;
  const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
  const sw=fs.readFileSync('spidey-app/sw.js','utf8');
  const html=fs.readFileSync('spidey-app/index.html','utf8');
  assert.equal(record.assets.length,5);
  assert.equal(record.existing_master_count,65);
  assert.equal(record.new_master_count,66);
  assert.ok(Object.keys(registry).length>=66);
  assert.equal(record.original_versions_preserved,true);
  assert.equal(record.no_other_event_image_overwritten,true);
  assert.equal(record.push_service_modified,false);
  assert.match(html,/premium-approved-master\.js\?v=20261018-sableye-max-monday-art1/);
  assert.match(sw,/const CACHE = 'spidey-app-[0-9]{8}-/); // Cache version advances with unrelated fixes.
  assert.ok(sw.includes('minior-geminids-20261211-16-spidey-reference-approved-v1.webp'), 'Previously approved posters remain cached');
  const expectedIds=[
    '2026-12-minior-geminids',
    '2026-11-minior-leonids',
    '2026-10-minior-orionids',
    '2026-10-super-mega-raid-day',
    '2026-10-raids-dialga'
  ];
  assert.deepEqual(record.assets.map(item=>item.event_id),expectedIds);
  for(const item of record.assets){
    assert.ok(events.some(e=>e.id===item.event_id),'Missing event '+item.event_id);
    const data=fs.readFileSync(item.file);
    assert.equal(data.toString('ascii',0,4),'RIFF');
    assert.equal(data.toString('ascii',8,12),'WEBP');
    assert.equal(hash(data),item.sha256,'Poster integrity '+item.event_id);
    assert.equal(registry[item.event_id].file,item.file.replace(/^spidey-app\//,''));
    assert.equal(registry[item.event_id].sha256,item.sha256);
    assert.equal(registry[item.event_id].status,'APPROVED');
    assert.equal(registry[item.event_id].width,1056);
    assert.equal(registry[item.event_id].height,1320);
    assert.equal(registry[item.event_id].approval_record,'docs/qa/SPIDEY_PREMIUM_REFERENCE_FIVE_ARTS_20261014.json');
    assert.ok(sw.includes('./'+registry[item.event_id].file),'PWA pre-cache '+item.event_id);
    if(item.old_file)assert.ok(fs.existsSync('spidey-app/'+item.old_file),'Original poster removed: '+item.old_file);
  }
});
