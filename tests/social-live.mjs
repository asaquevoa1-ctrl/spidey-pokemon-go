// Opt-in integration proof. Runs only on an authenticated, isolated preview.
// Generated private keys remain in this process; no real player data is read.
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import assert from 'node:assert/strict';
import { createIdentity, envelope, encryptMessage, decryptMessage } from '../spidey-app/social-crypto.js';
const access = (await readFile(process.argv[2],'utf8')).trim(), origin = new URL(access).origin;
if(!/^https:\/\/spidey-pokemon-[\w-]+-spidey3\.vercel\.app$/.test(origin))throw Error('preview_required');
const cookies = new Map();let url = access;
for(let i=0;i<4;i++){
  const response = await fetch(url,{redirect:'manual',headers:{Cookie:[...cookies.values()].join('; ')},signal:AbortSignal.timeout(20000)});
  for(const value of response.headers.getSetCookie()){const pair=value.split(';')[0];cookies.set(pair.split('=')[0],pair);}
  const location=response.headers.get('location');if(!location)break;
  const next=new URL(location,url);if(next.origin!==origin)throw Error('preview_auth_required');url=next.href;
}
async function request(body){
  const response=await fetch(origin+'/spidey-app/api/social',{method:body?'POST':'GET',headers:{Cookie:[...cookies.values()].join('; '),Origin:origin,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(25000)});
  if(!response.headers.get('content-type')?.includes('application/json'))throw Error('preview_api_not_json');
  const result=await response.json();if(!response.ok)throw Object.assign(Error(result.error || 'api_failed'),{status:response.status,...(result.diagnostic?{diagnostic:result.diagnostic}:{})});return result;
}
const status=await request();assert.equal(status.mode,'preview');assert.equal(status.available,true);
const actors=await Promise.all([createIdentity(),createIdentity(),createIdentity()]);
const call=async(i,action,data={})=>request(await envelope(actors[i],action,data));
const checks=[],prefix='QA '+new Date().toISOString().slice(11,19).replace(/:/g,'');
for(let i=0;i<actors.length;i++)await call(i,'register',{nickname:[prefix+' Aranha',prefix+' Parceiro',prefix+' Terceiro'][i],country:'BR',region:'Teste',trainer_code:'',interests:['pvp','raids'],discoverable:i===1,consent:true,signing_key:actors[i].signing_key,encryption_key:actors[i].encryption_key});
checks.push('private_blob_registration');
await call(0,'request',{peer:actors[1].id});
await assert.rejects(call(0,'messages',{peer:actors[1].id}),/connection_required/);
await assert.rejects(call(0,'accept',{peer:actors[1].id}),/recipient_only/);
await call(1,'accept',{peer:actors[0].id});checks.push('recipient_acceptance');
const peer=i=>({id:actors[i].id,encryption_key:actors[i].encryption_key});
const first=await encryptMessage(actors[0],peer(1),'Vamos treinar PvP?');
await call(0,'send',first);await call(0,'send',first);
const reply=await encryptMessage(actors[1],peer(0),'Vamos! Convite aceito.');await call(1,'send',reply);
let messages=(await call(1,'messages',{peer:actors[0].id})).messages;
assert.equal(messages.length,2);assert.equal(await decryptMessage(actors[1],peer(0),messages[0]),'Vamos treinar PvP?');
assert.equal(await decryptMessage(actors[0],peer(1),messages[1]),'Vamos! Convite aceito.');checks.push('encrypted_round_trip_and_retry');
await assert.rejects(call(2,'messages',{peer:actors[0].id}),/connection_required/);checks.push('third_profile_denied');
const simultaneous=await Promise.all([encryptMessage(actors[0],peer(1),'Primeira mensagem simultânea'),encryptMessage(actors[1],peer(0),'Segunda mensagem simultânea')]);
await Promise.all([call(0,'send',simultaneous[0]),call(1,'send',simultaneous[1])]);
assert.equal((await call(0,'messages',{peer:actors[1].id})).messages.length,4);checks.push('conditional_write_concurrency');
await call(0,'block',{peer:actors[1].id});await assert.rejects(call(1,'messages',{peer:actors[0].id}),/connection_required/);await call(0,'unblock',{peer:actors[1].id});checks.push('block_and_unblock');
const own=await call(1,'state');
console.log(JSON.stringify({ready:true,preview:origin,checks,ui_peer_code:own.profile.code,ui_peer_nickname:own.profile.nickname}));
const cli=createInterface({input:process.stdin,output:process.stdout});
for await(const command of cli){
 try{
  if(command==='accept_ui'){
    const state=await call(1,'state'), incoming=state.connections.find(c=>c.status==='pending'&&c.requested_by!==actors[1].id&&c.profile.nickname==='QA Navegador');
    assert.ok(incoming,'UI test request not received');await call(1,'accept',{peer:incoming.profile.id});
    await call(1,'send',await encryptMessage(actors[1],incoming.profile,'Convite aceito. Podemos treinar PvP!'));
    checks.push('browser_profile_accepted');console.log(JSON.stringify({accepted:true}));
  } else if(command==='read_ui'){
    const state=await call(1,'state'), connection=state.connections.find(c=>c.status==='accepted'&&c.profile.nickname==='QA Navegador');
    assert.ok(connection);const data=await call(1,'messages',{peer:connection.profile.id}),texts=[];
    for(const m of data.messages)texts.push(await decryptMessage(actors[1],connection.profile,m));
    assert.ok(texts.includes('Vamos treinar juntos!'));checks.push('browser_round_trip');console.log(JSON.stringify({browser_round_trip:true,message_count:texts.length}));
  } else if(command==='finish'){
    const report={checked_at:new Date().toISOString(),preview:origin,checks,ok:true,synthetic_profiles_only:true,production_namespace_used:false};
    await writeFile('docs/qa/SOCIAL_PREVIEW_API_20261007.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({saved:true,checks:checks.length}));break;
  }
 }catch(error){console.log(JSON.stringify({error:error.message}));}
}
cli.close();
