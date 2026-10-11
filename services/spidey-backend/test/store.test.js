import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { DocumentStore } from '../src/store.js';
import { createSocialService, pairId } from '../src/social.js';

function sqlite(t) {
  const database = new DatabaseSync(':memory:'); t.after(() => database.close());
  const ctx = {storage:{sql:{exec:(sql,...params)=>{
    const statement = database.prepare(sql);
    const rows = statement.columns().length ? statement.all(...params) : (statement.run(...params),[]);
    return {toArray:()=>rows};
  }},transactionSync:callback=>{
    database.exec('BEGIN');
    try { const result = callback(); database.exec('COMMIT'); return result; }
    catch(error) { database.exec('ROLLBACK'); throw error; }
  }}};
  return new DocumentStore(ctx);
}
async function identity() {
  const signing = await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
  const signing_key = await crypto.subtle.exportKey('jwk',signing.publicKey);
  const id = createHash('sha256').update(`${signing_key.x}.${signing_key.y}`).digest('hex');
  return {id,signing_key,signing};
}
async function request(who,action,data,ts) {
  const e = {actor:who.id,action,data,ts,nonce:Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64url')};
  e.signature = Buffer.from(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},who.signing.privateKey,new TextEncoder().encode(JSON.stringify(['spidey-social-v1',e.action,e.actor,e.ts,e.nonce,e.data])))).toString('base64url');
  return e;
}
function profile(who,now,peers=[]) { return {id:who.id,nickname:'QA',country:'BR',region:'',interests:[],trainer_code:'',signing_key:who.signing_key,encryption_key:who.signing_key,expires_at:now+86400000,peers}; }

test('a failed connection limit leaves no partial friendship, nonce reservation or change to the other profile', async t => {
  const store = sqlite(t), a = await identity(), b = await identity(), now = Date.now();
  store.write(`profiles/${a.id}`,profile(a,now));
  store.write(`profiles/${b.id}`,profile(b,now,Array.from({length:50},(_,i)=>String(i).padStart(64,'0'))));
  const action = await request(a,'request',{peer:b.id},now);
  await assert.rejects(store.transaction(view=>createSocialService(view,()=>now).handle(action)),/connection_limit/);
  assert.equal(store.read(`pairs/${pairId(a.id,b.id)}`),undefined);
  assert.deepEqual(store.read(`profiles/${a.id}`).peers,[]);
  assert.equal(store.read(`profiles/${a.id}`).requests,undefined);
  assert.equal(store.read(`profiles/${b.id}`).peers.length,50);
});
test('replaying a valid mutation after one minute still fails for the full signed request lifetime', async t => {
  const store = sqlite(t), a = await identity(); let now = Date.now();
  store.write(`profiles/${a.id}`,profile(a,now));
  const action = await request(a,'renew',{},now);
  const run = e => store.transaction(view=>createSocialService(view,()=>now).handle(e));
  await run(action); now+=61000;
  await assert.rejects(run(action),/request_already_used/);
  assert.equal((await run(await request(a,'renew',{},now))).profile.active,true);
});
