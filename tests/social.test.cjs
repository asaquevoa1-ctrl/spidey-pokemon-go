const test=require('node:test'),assert=require('node:assert/strict');
const modules=Promise.all([import('../spidey-app/api/social/service.js'),import('../spidey-app/social-crypto.js')]);
async function fixture(){
 const [{createSocialService,pairId},crypto]=await modules;
 const records=new Map(),store={read:async k=>records.has(k)?structuredClone(records.get(k)):null,mutate:async(k,fn)=>{const v=fn(records.has(k)?structuredClone(records.get(k)):null);if(v!==undefined)records.set(k,structuredClone(v));return structuredClone(records.get(k));}};
 let now=Date.parse('2026-10-07T12:00:00Z');const service=createSocialService(store,()=>now);
 const identities=await Promise.all([crypto.createIdentity(),crypto.createIdentity(),crypto.createIdentity()]);
 const call=async(who,action,data={})=>service.handle(await crypto.envelope(identities[who],action,data,now));
 const fields=(name,extra={})=>({nickname:name,country:'BR',region:'São Paulo',trainer_code:'123456789012',interests:['pvp','gifts'],discoverable:true,consent:true,...extra});
 const register=async(i,extra={})=>call(i,'register',{...fields(['Aranha','Parceiro','Terceiro'][i],extra),signing_key:identities[i].signing_key,encryption_key:identities[i].encryption_key});
 const connect=async()=>{await register(0);await register(1);await call(0,'request',{peer:identities[1].id});await call(1,'accept',{peer:identities[0].id});};
 return {crypto,records,store,service,identities,call,register,connect,pairId,advance:ms=>{now+=ms;},now:()=>now};
}
test('optional pseudonymous profiles store only allowed fields; directory hides trainer codes and opt-out profiles',async()=>{
 const f=await fixture();await f.register(0,{email:'never-store@example.org',gps:{lat:1,lng:2},device:{timezone:'x'}});await f.register(1,{discoverable:false});await f.register(2);
 const result=await f.call(2,'search');assert.equal(result.profiles.length,1);assert.equal(result.profiles[0].nickname,'Aranha');assert.equal(result.profiles[0].trainer_code,undefined);
 const owner=await f.call(0,'state');assert.equal(owner.profile.trainer_code,'123456789012');
 const stored=f.records.get(`profiles/${f.identities[0].id}`);for(const k of ['email','gps','device','signPrivate','encryptPrivate'])assert.equal(stored[k],undefined);
 assert.equal(f.identities[0].signPrivate.extractable,false);assert.equal(f.identities[0].encryptPrivate.extractable,false);
});
test('creating a profile requires consent and a valid public encryption key',async()=>{
 const f=await fixture();await assert.rejects(f.register(0,{consent:false}),/consent_required/);assert.equal(f.records.size,0);
 await assert.rejects(f.call(0,'register',{nickname:'Hi',country:'BR',interests:[],consent:true,signing_key:f.identities[0].signing_key,encryption_key:{...f.identities[0].encryption_key,d:'private'}}),/invalid_key/);
});
test('signed requests reject impersonation, changed payloads and stale timestamps',async()=>{
 const f=await fixture();await f.register(0);
 const e=await f.crypto.envelope(f.identities[1],'state',{},f.now());e.actor=f.identities[0].id;
 await assert.rejects(f.service.handle(e),/unauthorized/);
 const changed=await f.crypto.envelope(f.identities[0],'update',{nickname:'Aranha',country:'BR',interests:[]},f.now());changed.data.nickname='Intruso';
 await assert.rejects(f.service.handle(changed),/unauthorized/);
 await assert.rejects(f.service.handle(await f.crypto.envelope(f.identities[0],'state',{},f.now()-6*60000)),/invalid_request/);
});
test('friend requests require recipient acceptance; neither pending connections nor strangers can read chat',async()=>{
 const f=await fixture();await f.register(0);const second=await f.register(1);await f.register(2);
 await f.call(0,'request',{code:second.profile.code});
 await assert.rejects(f.call(0,'accept',{peer:f.identities[1].id}),/recipient_only/);
 await assert.rejects(f.call(0,'messages',{peer:f.identities[1].id}),/connection_required/);
 const state=await f.call(1,'accept',{peer:f.identities[0].id});assert.equal(state.connections[0].status,'accepted');assert.equal(state.connections[0].profile.trainer_code,'123456789012');
 await assert.rejects(f.call(2,'messages',{peer:f.identities[0].id}),/connection_required/);
});
test('two profiles decrypt each other while the server and a third profile receive no plaintext',async()=>{
 const f=await fixture();await f.connect();await f.register(2);
 const peer={id:f.identities[1].id,encryption_key:f.identities[1].encryption_key},payload=await f.crypto.encryptMessage(f.identities[0],peer,'Vamos treinar amanhã?');
 await f.call(0,'send',payload);const result=await f.call(1,'messages',{peer:f.identities[0].id});
 assert.equal(await f.crypto.decryptMessage(f.identities[1],{id:f.identities[0].id,encryption_key:f.identities[0].encryption_key},result.messages[0]),'Vamos treinar amanhã?');
 assert.equal(JSON.stringify([...f.records.values()]).includes('Vamos treinar amanhã?'),false);
 await assert.rejects(f.crypto.decryptMessage(f.identities[2],{id:f.identities[0].id,encryption_key:f.identities[0].encryption_key},result.messages[0]));
 const changed={...result.messages[0],id:f.crypto.randomHex()};await assert.rejects(f.crypto.decryptMessage(f.identities[1],{id:f.identities[0].id,encryption_key:f.identities[0].encryption_key},changed));
});
test('message retries do not duplicate delivery and simultaneous senders retain both messages',async()=>{
 const f=await fixture();await f.connect();
 const payloads=await Promise.all([f.crypto.encryptMessage(f.identities[0],{id:f.identities[1].id,encryption_key:f.identities[1].encryption_key},'Oi!'),f.crypto.encryptMessage(f.identities[1],{id:f.identities[0].id,encryption_key:f.identities[0].encryption_key},'Olá!')]);
 await Promise.all([f.call(0,'send',payloads[0]),f.call(1,'send',payloads[1])]);await f.call(0,'send',payloads[0]);
 assert.equal((await f.call(0,'messages',{peer:f.identities[1].id})).messages.length,2);
});
test('blocked connections cannot send or read; only the blocker can undo its own block',async()=>{
 const f=await fixture();await f.connect();await f.call(0,'block',{peer:f.identities[1].id});
 await f.call(1,'unblock',{peer:f.identities[0].id});
 await assert.rejects(f.call(1,'messages',{peer:f.identities[0].id}),/connection_required/);
 const payload=await f.crypto.encryptMessage(f.identities[1],{id:f.identities[0].id,encryption_key:f.identities[0].encryption_key},'Hello');
 await assert.rejects(f.call(1,'send',payload),/peer_unavailable/);
 await f.call(0,'unblock',{peer:f.identities[1].id});assert.equal((await f.call(1,'messages',{peer:f.identities[0].id})).messages.length,0);
});
test('reports block immediately and record only identifiers, reason and time',async()=>{
 const f=await fixture();await f.connect();await f.call(1,'report',{peer:f.identities[0].id,reason:'spam',text:'must not store'});
 const report=f.records.get(`reports/${f.identities[1].id}`).reports[0];assert.deepEqual(Object.keys(report).sort(),['at','by','reason','target']);
 await assert.rejects(f.call(0,'messages',{peer:f.identities[1].id}),/connection_required/);
});
test('profile expiry removes discovery and access; renewing restores the same identity',async()=>{
 const f=await fixture();await f.connect();f.advance(31*86400000);
 assert.equal((await f.call(0,'state')).profile.active,false);await assert.rejects(f.call(0,'search'),/profile_expired/);
 const renewed=await f.call(0,'renew');assert.equal(renewed.profile.id,f.identities[0].id);assert.equal(renewed.profile.active,true);
});
test('old encrypted messages are physically removed on access; profile removal erases conversations',async()=>{
 const f=await fixture();await f.connect();const key=`pairs/${f.pairId(f.identities[0].id,f.identities[1].id)}`,pair=f.records.get(key);
 pair.messages.push({id:'old',at:f.now()-31*86400000,ciphertext:'old ciphertext'});
 assert.equal((await f.call(0,'messages',{peer:f.identities[1].id})).messages.length,0);assert.equal(f.records.get(key).messages.length,0);
 await f.call(0,'remove');assert.equal(f.records.get(key).status,'removed');assert.deepEqual(Object.keys(f.records.get(`profiles/${f.identities[0].id}`)).sort(),['deleted','expires_at','id','signing_key']);
 await assert.rejects(f.call(0,'state'),/profile_deleted/);assert.equal((await f.call(1,'state')).connections.length,0);
});
test('mutation replay and burst limits are enforced per profile without IP or device tracking',async()=>{
 const f=await fixture();await f.register(0);const e=await f.crypto.envelope(f.identities[0],'renew',{},f.now());await f.service.handle(e);
 await assert.rejects(f.service.handle(e),/request_already_used/);
 for(let i=0;i<19;i++)await f.call(0,'renew');await assert.rejects(f.call(0,'renew'),/slow_down/);
 f.advance(61000);assert.equal((await f.call(0,'renew')).profile.active,true);
});
test('initial text chat accepts plain text only and enforces length; user text cannot create DOM controls',async()=>{
 const [,c]=await modules;assert.equal(c.validMessage('Olá, vamos jogar?'),true);assert.equal(c.validMessage('https://example.com'),false);assert.equal(c.validMessage('discord.gg/invite'),false);assert.equal(c.validMessage('x'.repeat(1001)),false);assert.equal(c.validMessage('  '),false);
 const source=require('node:fs').readFileSync('spidey-app/social.js','utf8');assert.match(source,/esc\(m\.text\)/);assert.doesNotMatch(source,/console\.(log|error)\(/);
});
