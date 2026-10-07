const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(){const window={SPIDEY_APPROVED_ART_MASTER:{},SPIDEY_PREVIEW_ART:{},SpideyFlyCore:{eligible:e=>e.category==='spotlight_hour'}};const context={URL,window,document:{readyState:'loading',addEventListener(){}},spideyCategoryLabel:e=>e.category,formatRange:()=> '28/09, 01:30 → 01/10, 11:30'};vm.createContext(context);vm.runInContext(fs.readFileSync('spidey-app/preview-art.js','utf8'),context);window.SPIDEY_PREVIEW_ART={};vm.runInContext(fs.readFileSync('spidey-app/player-ui.js','utf8'),context);return window}
test('FLY event panel retains distinct bonuses, Pokémon, notes, source and local date',()=>{const w=setup(),e={id:'seedot',title:'Spotlight Hour: Seedot',category:'spotlight_hour',summary:'2× PE por captura.',bonuses:['2× PE por captura.','Mais encontros.'],pokemon:[{name:'Seedot',note:'na natureza'}],notes:['Sem bônus de shiny anunciado.'],source:{name:'Comunidade',url:'https://pokemongohub.net/event'},schedule:{start_local:'2026-10-01T18:00:00-03:00',end_local:'2026-10-01T19:00:00-03:00'}};const html=w.SpideyPlayer.panel(e,{fly:true});for(const value of ['2× PE por captura.','Mais encontros.','Seedot — na natureza','Sem bônus de shiny anunciado.','Informação da comunidade','01/10 · 18:00 → 19:00'])assert.ok(html.includes(value),value);assert.equal(html.split('2× PE por captura.').length,2)});
test('regional multi-day time uses Brazil conversion, never labels original local hours as Brazil',()=>{const w=setup();assert.equal(w.SpideyPlayer.time({category:'regional_event',schedule:{start_local:'2026-09-28T10:00',end_local:'2026-10-01T20:00'}}),'28/09, 01:30 → 01/10, 11:30 (Brasília)')});

test('verified official account posts and datamines have distinct source labels',()=>{
 const w=setup(),label=source=>w.SpideyPlayer.source({source});
 assert.equal(label({url:'https://x.com/PokemonGoApp/status/2107621979507343857',confidence:'official'}),'Anúncio oficial');
 assert.equal(label({url:'https://x.com/someone/status/2107621979507343857',confidence:'official'}),'Informação da comunidade');
 assert.equal(label({url:'https://www.reddit.com/r/TheSilphRoad/',confidence:'datamine'}),'Prévia • ainda não confirmada');
});
test('approved binary outranks a preview illustration; preview never grants approval',()=>{const w=setup();w.SPIDEY_APPROVED_ART_MASTER.x={file:'approved.avif',sha256:'abc'};w.SPIDEY_PREVIEW_ART.x={file:'draft.png',sha256:'def'};assert.equal(w.SpideyPlayer.art({id:'x'}),'approved.avif?v=abc');assert.ok(!w.SpideyPlayer.image({id:'x',title:'Xerneas'}).includes('player-art-window'));assert.equal(Object.keys(w.SPIDEY_APPROVED_ART_MASTER).length,1)});

test('unavailable approved binary does not fall through to a competing preview',()=>{const w=setup();w.SPIDEY_APPROVED_ART_MASTER.x={file:'broken.avif',sha256:'abc'};w.SPIDEY_PREVIEW_ART.x={file:'draft.png',sha256:'def'};w.SPIDEY_UNAVAILABLE_ART={'broken.avif':'TRUNCATED_CONTAINER'};assert.equal(w.SpideyPlayer.art({id:'x'}),null);assert.equal(w.SpideyPlayer.image({id:'x'}),'')});

test('explicit correction draft restores an unavailable asset only in preview without changing master',()=>{const w=setup();const a={file:'broken.avif',sha256:'abc'};w.SPIDEY_APPROVED_ART_MASTER.x=a;w.SPIDEY_UNAVAILABLE_ART={'broken.avif':'TRUNCATED_CONTAINER'};w.SPIDEY_PREVIEW_ART.x={file:'review.png',sha256:'def',status:'PENDING_REVIEW',display:'full_poster',restoresUnavailableArt:'broken.avif'};assert.equal(w.SpideyPlayer.art({id:'x'}),'review.png?v=def');assert.equal(w.SPIDEY_APPROVED_ART_MASTER.x,a);assert.ok(!w.SpideyPlayer.image({id:'x'}).includes('player-art-window'))});

test('human-approved rotation stays bound to exact reviewed bytes and cannot replace Raid Hour',()=>{
 const w=setup(),context=vm.createContext({window:w});
 vm.runInContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),context);
 vm.runInContext(fs.readFileSync('spidey-app/preview-art.js','utf8'),context);
 const record=JSON.parse(fs.readFileSync('docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json','utf8'));
 const crypto=require('node:crypto'),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 assert.equal(record.status,'APPROVED');assert.equal(record.decision.text,'Sim, aprovo');
 assert.equal(hash(record.approved_file),record.sha256);assert.equal(hash(record.candidate_file),record.sha256);
 assert.deepEqual(record.event_ids,['2026-09-raids-xerneas','2026-10-xerneas-raids']);
 for(const id of record.event_ids){
  const entry=w.SPIDEY_APPROVED_ART_MASTER[id];
  assert.equal(entry.status,'APPROVED');assert.equal('spidey-app/'+entry.file,record.approved_file);
  assert.equal(entry.sha256,record.sha256);assert.equal(w.SPIDEY_PREVIEW_ART[id],undefined);
  assert.equal(w.SpideyPlayer.reviewCorrection({id}),false);
  assert.equal(w.SpideyPlayer.art({id}),entry.file+'?v='+record.sha256.slice(0,12));
  assert.ok(w.SpideyPlayer.image({id}).includes('width="1121" height="1403"'));
 }
 const hour=record.raid_hour_asset_unchanged;
 assert.equal('spidey-app/'+w.SPIDEY_APPROVED_ART_MASTER[hour.event_id].file,hour.file);
 assert.equal(hash(hour.file),hour.sha256);assert.notEqual(w.SpideyPlayer.art({id:hour.event_id}),w.SpideyPlayer.art({id:record.event_ids[0]}));
 assert.equal(hash(record.superseded_asset_preserved.file),record.superseded_asset_preserved.sha256);
});
