const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sources,validate,loadMaster}=require('../scripts/check_editorial_integrity.cjs');
const canonical=sources();
const copy=()=>JSON.parse(JSON.stringify(canonical));
test('publicação real: nenhum bloqueio editorial de arte datada, hidden ou texto interno',()=>{
  assert.deepEqual(validate(canonical),[]);
});
test('arte de 24/10 atribuída ao evento Londres 10/11 é BLOQUEADA no master',()=>{
  const input=copy();
  input.master['2026-pokemon-night-out-london']={
    ...input.master['2026-pokemon-night-out-la']
  };
  assert.ok(validate(input).some(v=>v.code==='ART_OTHER_EVENT'&&v.id==='2026-pokemon-night-out-london'));
});
test('arte 24/10 incluída no próprio JSON Londres é BLOQUEADA',()=>{
  const input=copy(),e=input.events.find(e=>e.id==='2026-pokemon-night-out-london');
  e.art={url:'assets/events/premium/pokemon-night-out-20261024-approved-v1.png'};
  assert.ok(validate(input).some(v=>v.code==='ART_OTHER_EVENT'&&v.id===e.id));
});
test('bloqueia campanha datada se o ID liberado for reutilizado com nova data',()=>{
  const input=copy();
  input.events.find(e=>e.id==='2026-pokemon-night-out-la').schedule.start_local='2026-11-10T18:00:00+00:00';
  assert.ok(validate(input).some(v=>v.code==='POLICY_DATE_MISMATCH'&&v.id==='2026-pokemon-night-out-la'));
});
test('bloqueia nota técnica de curadoria no card de um evento local',()=>{
  const input=copy();
  input.local.find(e=>e.id==='2026-pokemon-night-out-london').note='A arte Premium existente permanece preservada.';
  assert.ok(validate(input).some(v=>v.code==='INTERNAL_COPY'));
});
test('evento ocultado por correção não pode conter arquivo de pôster exibível',()=>{
  const input=copy(),london=input.events.find(e=>e.id==='2026-pokemon-night-out-london');
  london.art={url:'assets/events/premium/invalid.png'};
  assert.ok(validate(input).some(v=>v.code==='HIDDEN_ART_VISIBLE'&&v.id===london.id));
});
test('preserva as artes originais e a programação histórica válida',()=>{
  const input=copy(),london=input.events.find(e=>e.id==='2026-pokemon-night-out-london');
  assert.equal(london.schedule.start_date,'2026-11-10');
  assert.equal(input.master['2026-pokemon-night-out-london'],undefined);
  assert.ok(input.master['2026-pokemon-night-out-la']);
  assert.ok(input.master['2026-10-pokemon-night-out-twitch']);
  assert.equal(input.policy.scoped_posters[0].allowed_event_ids.length,2);
});
