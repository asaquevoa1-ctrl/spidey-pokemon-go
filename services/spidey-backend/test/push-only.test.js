import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare, Log, LogLevel, convertV4MiniflareOptions} from 'miniflare';
const APP='https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/';
const ORIGIN=new URL(APP).origin;
const b64=v=>Buffer.from(v).toString('base64url');
const bundle=build({entryPoints:['src/worker.js'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022',external:['node:*'],conditions:['workerd','import'],logLevel:'silent'});

async function setup(t, enabled=true) {
  const state={queue:{schema_version:'spidey-notification-queue-v1',jobs:[]},statuses:[],dispatchEnabled:enabled};
  const mf=new Miniflare(convertV4MiniflareOptions({
    modules:true,script:(await bundle).outputFiles[0].text,
    compatibilityDate:'2026-10-01',compatibilityFlags:['nodejs_compat'],
    bindings:{APP_URL:APP,QUEUE_URL:'https://raw.githubusercontent.com/testing/queue.json',DISPATCH_ENABLED:String(enabled)},
    durableObjects:{PUSH:{className:'PushHub',useSQLite:true}},
    log:new Log(LogLevel.ERROR),
    outboundService:async request=>{
      if(new URL(request.url).hostname==='raw.githubusercontent.com')return new Response(JSON.stringify(state.queue));
      if(new URL(request.url).hostname==='fcm.googleapis.com'){state.statuses.push(request.url);return new Response(null,{status:201});}
      throw Error('Unexpected outgoing request');
    }
  }));
  t.after(()=>mf.dispose());
  const request=(path,body,origin=ORIGIN)=>mf.dispatchFetch('https://push.test'+path,{
    method:body===undefined?'GET':'POST',
    headers:{...(origin?{Origin:origin}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  return {request,state,mf};
}
async function subscription(){
  const pair=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  return {endpoint:'https://fcm.googleapis.com/fcm/send/spidey-qa',
    keys:{p256dh:b64(await crypto.subtle.exportKey('raw',pair.publicKey)),auth:b64(crypto.getRandomValues(new Uint8Array(16)))}};
}
test('social endpoints do not exist; no secrets or device subscriptions leak from health',async t=>{
  const api=await setup(t,false);
  assert.equal((await api.request('/api/social')).status,404);
  assert.equal((await api.request('/api/push/dispatch',{})).status,404);
  assert.equal((await api.request('/dispatch',{})).status,404);
  const result=await (await api.request('/health')).json();
  assert.equal(result.push.available,false);
  for(const k of ['social','subscriptions','profiles','privateKey'])assert.equal(result[k],undefined);
  assert.equal((await api.request('/api/push/public-key').then(r=>r.json())).publicKey,null);
});
test('push rejects other origins, missing Origin, invalid subscriptions and oversized requests',async t=>{
  const api=await setup(t);
  assert.equal((await api.request('/api/push/subscribe',{},'https://evil.example')).status,403);
  assert.equal((await api.request('/api/push/subscribe',{},null)).status,403);
  assert.equal((await api.request('/api/push/subscribe',{})).status,400);
  assert.equal((await api.request('/api/push/subscribe',{data:'a'.repeat(17000)})).status,413);
  const options=await api.mf.dispatchFetch('https://push.test/api/push/subscribe',{method:'OPTIONS',headers:{Origin:ORIGIN}});
  assert.equal(options.status,204);
  assert.equal(options.headers.get('Access-Control-Allow-Origin'),ORIGIN);
});
test('push registers, delivers a real mock request, rate limits test, and unsubscribes',async t=>{
  const api=await setup(t);
  const s=await subscription();
  const publicKey=await (await api.request('/api/push/public-key')).json();
  assert.ok(publicKey.publicKey);
  assert.equal((await api.request('/api/push/subscribe',{subscription:s})).status,201);
  assert.equal((await api.request('/api/push/test',{subscription:s})).status,200);
  assert.equal(api.state.statuses.length,1);
  assert.equal((await api.request('/api/push/test',{subscription:s})).status,429);
  assert.equal((await api.request('/api/push/unsubscribe',{subscription:s})).status,200);
  assert.equal((await api.request('/api/push/test',{subscription:s})).status,404);
});