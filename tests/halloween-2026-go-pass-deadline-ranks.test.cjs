'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const id='2026-10-halloween-go-pass';
const e=events.find(x=>x.id===id);
test('Halloween GO Pass stays a single official calendar entry distinct from Oct/Nov monthly passes',()=>{
 assert.ok(e);
 assert.equal(events.filter(x=>x.id===id).length,1);
 assert.equal(e.category,'go_pass');
 assert.equal(e.source.confidence,'official');
 assert.equal(e.schedule.start_local,'2026-10-27T10:00:00-03:00');
 assert.equal(e.schedule.end_local,'2026-11-05T20:00:00-03:00');
 assert.equal(e.claim_deadline.end_local,'2026-11-07T20:00:00-03:00');
 assert.equal(e.claim_deadline.kind,'claim_unlocked_rewards');
 assert.ok(events.find(x=>x.id==='2026-10-go-pass'));
 assert.ok(events.find(x=>x.id==='2026-11-go-pass-groudon'));
});
test('Deluxe/free bonuses are verified and rank 49 50 108 assertions remain clearly unconfirmed',()=>{
 assert.ok(e.bonuses.some(x=>x.includes('GRATUITO')));
 assert.ok(e.bonuses.some(x=>x.includes('DELUXE')));
 assert.ok(e.bonuses.some(x=>x.includes('RANQUE 10')));
 assert.ok(e.bonuses.some(x=>x.includes('RANQUE 20')));
 assert.deepEqual(e.reward_rank_claims.map(x=>x.rank),[49,50,108]);
 for(const r of e.reward_rank_claims){
  assert.equal(r.validation,'community_unconfirmed');
  assert.equal(r.track,'unverified');
 }
 assert.ok(e.notes.some(x=>x.includes('INFORMAÇÃO COMUNITÁRIA A CONFERIR')));
 assert.ok(e.news.summary.includes('07/11'));
 assert.ok(e.notes.some(x=>x.includes('BRILHANTE') && x.includes('não garantir')));
});
test('Halloween approved art and other scheduled Pokémon GO events continue untouched',()=>{
 for(const id of ['2026-10-halloween-part-1','2026-11-halloween-part-2','2026-11-go-wild-area-global'])assert.ok(events.find(x=>x.id===id));
 const manifest=fs.readFileSync('spidey-app/premium-approved-master.js','utf8');
 assert.ok(manifest.includes('2026-10-halloween-part-1'));
 assert.ok(manifest.includes('2026-11-halloween-part-2'));
 const sw=fs.readFileSync('spidey-app/sw.js','utf8');
 assert.ok(sw.includes('rocket-lineups'));
 assert.equal(fs.readFileSync('spidey-app/index.html','utf8').includes('hunter-v1.js'),false);
});
