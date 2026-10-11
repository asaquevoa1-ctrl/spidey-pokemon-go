import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { Miniflare, Log, LogLevel, convertV4MiniflareOptions } from 'miniflare';

const APP = 'https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/';
const ORIGIN = new URL(APP).origin;
const VERSION = 'spidey-social-v1';
const b64 = value => Buffer.from(value).toString('base64url');
const utf8 = new TextEncoder();
const bundle = build({ entryPoints: ['src/worker.js'], bundle: true, write: false, format: 'esm', platform: 'neutral', target: 'es2022', external: ['node:*'], conditions: ['workerd', 'import'], logLevel: 'silent' });

async function identity() {
  const signing = await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
  const encrypt = await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);
  const signing_key = await crypto.subtle.exportKey('jwk', signing.publicKey);
  const encryption_key = await crypto.subtle.exportKey('jwk', encrypt.publicKey);
  const id = createHash('sha256').update(`${signing_key.x}.${signing_key.y}`).digest('hex');
  return { id, signing_key, encryption_key, signing, encrypt };
}
async function signed(who, action, data = {}) {
  const e = {action, actor: who.id, ts: Date.now(), nonce: b64(crypto.getRandomValues(new Uint8Array(16))), data};
  e.signature = b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},who.signing.privateKey,utf8.encode(JSON.stringify([VERSION,e.action,e.actor,e.ts,e.nonce,e.data]))));
  return e;
}
async function setup(t, enabled = true) {
  const outbound = [], state = { queueFail: false, pushStatus: 201, queue: {schema_version:'spidey-notification-queue-v1',jobs:[]} };
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: (await bundle).outputFiles[0].text,
    compatibilityDate: '2026-10-01', compatibilityFlags: ['nodejs_compat'],
    bindings: { APP_URL: APP, QUEUE_URL: 'https://raw.githubusercontent.com/test/synthetic/queue.json', DISPATCH_ENABLED: String(enabled) },
    durableObjects: { SOCIAL: {className:'SocialHub',useSQLite:true}, PUSH: {className:'PushHub',useSQLite:true} },
    log: new Log(LogLevel.ERROR),
    outboundService: async request => {
      const url = new URL(request.url);
      if (url.hostname === 'raw.githubusercontent.com') return new Response(JSON.stringify(state.queue), {status:state.queueFail?503:200});
      if (url.hostname === 'fcm.googleapis.com') {
        outbound.push({url:request.url, headers:Object.fromEntries(request.headers), body:Buffer.from(await request.arrayBuffer())});
        return new Response(null, {status:state.pushStatus});
      }
      throw Error('Unexpected outbound request: ' + url.hostname);
    },
  }));
  t.after(() => mf.dispose());
  const request = (path, body, origin = ORIGIN) => mf.dispatchFetch('https://backend.test' + path, {
    method: body === undefined ? 'GET' : 'POST', headers: {...(origin ? {Origin:origin} : {}), ...(body === undefined ? {} : {'Content-Type':'application/json'})},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const social = async (who, action, data = {}) => {
    const response = await request('/api/social', await signed(who,action,data));
    const result = await response.json();
    assert.equal(response.status, 200, JSON.stringify(result));
    return result;
  };
  const register = (who,nickname) => social(who,'register',{nickname,country:'BR',interests:['pvp'],discoverable:true,consent:true,signing_key:who.signing_key,encryption_key:who.encryption_key});
  return {mf, request, social, register, outbound, state};
}
async function syntheticSubscription(suffix = 'qa') {
  const key = await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  return {endpoint:'https://fcm.googleapis.com/fcm/send/spidey-synthetic-' + suffix,keys:{p256dh:b64(await crypto.subtle.exportKey('raw',key.publicKey)),auth:b64(crypto.getRandomValues(new Uint8Array(16)))}};
}

test('Worker exposes no personal data, rejects foreign origins and unbounded bodies, and has no public dispatcher', async t => {
  const f = await setup(t, false);
  const health = await (await f.request('/health')).json();
  assert.equal(health.push.available, false);
  for(const key of ['profiles','subscriptions','messages','privateKey']) assert.equal(health[key], undefined);
  assert.equal((await f.request('/api/social', undefined, 'https://evil.example')).status, 403);
  assert.equal((await f.request('/api/social', {}, null)).status, 403);
  assert.equal((await f.request('/api/social', {payload:'x'.repeat(18000)})).status, 413);
  assert.equal((await f.request('/api/push/dispatch', {})).status, 404);
  assert.equal((await f.request('/dispatch', {})).status, 404);
  const preflight = await f.mf.dispatchFetch('https://backend.test/api/social',{method:'OPTIONS',headers:{Origin:ORIGIN,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(preflight.headers.get('cache-control'), 'no-store');
});
test('SQLite profile, request, recipient acceptance, chat authorization, blocking and deletion work through HTTP', async t => {
  const f = await setup(t), a = await identity(), b = await identity(), c = await identity();
  const first = await f.register(a,'QA A'); await f.register(b,'QA B'); await f.register(c,'QA C');
  assert.equal((await f.social(c,'search')).profiles.length, 2);
  await f.social(b,'request',{code:first.profile.code});
  assert.equal((await f.request('/api/social',await signed(b,'messages',{peer:a.id}))).status,403);
  await f.social(a,'accept',{peer:b.id});
  const payload = {peer:a.id,message_id:'a'.repeat(32),iv:b64(crypto.getRandomValues(new Uint8Array(12))),ciphertext:b64(crypto.getRandomValues(new Uint8Array(50)))};
  await f.social(b,'send',payload); await f.social(b,'send',payload);
  assert.equal((await f.social(a,'messages',{peer:b.id})).messages.length,1);
  assert.equal((await f.request('/api/social',await signed(c,'messages',{peer:a.id}))).status,403);
  const replay = await signed(a,'renew'); assert.equal((await f.request('/api/social',replay)).status,200); assert.equal((await f.request('/api/social',replay)).status,409);
  await f.social(a,'block',{peer:b.id}); assert.equal((await f.request('/api/social',await signed(b,'send',payload))).status,403);
  await f.social(a,'remove'); assert.equal((await f.social(b,'state')).connections.length,0);
  assert.equal((await f.request('/api/social',await signed(a,'state'))).status,410);
});
test('two simultaneous senders retain their messages in the Durable Object', async t => {
  const f = await setup(t), a = await identity(), b = await identity();
  await f.register(a,'QA A'); await f.register(b,'QA B'); await f.social(a,'request',{peer:b.id}); await f.social(b,'accept',{peer:a.id});
  const message = (peer,id) => ({peer,message_id:id.repeat(32),iv:b64(crypto.getRandomValues(new Uint8Array(12))),ciphertext:b64(crypto.getRandomValues(new Uint8Array(40)))});
  await Promise.all([f.social(a,'send',message(b.id,'a')),f.social(b,'send',message(a.id,'b'))]);
  assert.equal((await f.social(a,'messages',{peer:b.id})).messages.length,2);
});
test('push stores a minimized synthetic subscription, encrypts a test, enforces cooldown and requires keys to delete', async t => {
  const f = await setup(t), subscription = await syntheticSubscription();
  const key = await (await f.request('/api/push/public-key')).json();
  assert.equal(key.available,true); assert.match(key.publicKey,/^[A-Za-z0-9_-]{87}$/);
  assert.equal((await f.request('/api/push/subscribe',{subscription,device:{locale:'must-not-store'}})).status,201);
  assert.equal((await f.request('/api/push/subscribe',{subscription:{...subscription,endpoint:'http://127.0.0.1/private'}})).status,400);
  const response = await f.request('/api/push/test',{subscription});
  const result = await response.json(); assert.equal(response.status,200,JSON.stringify(result));
  assert.equal(result.accepted_by_push_service,true); assert.equal(result.device_receipt_verified,false);
  assert.equal(f.outbound.length,1); assert.equal(f.outbound[0].headers['content-encoding'],'aes128gcm');
  assert.equal(f.outbound[0].body.length,4096); assert.equal(f.outbound[0].body.includes('Alerta de teste'),false);
  assert.ok(f.outbound[0].headers.authorization.startsWith('vapid '));
  assert.equal((await f.request('/api/push/test',{subscription})).status,429);
  assert.equal((await f.request('/api/push/unsubscribe',{subscription:{...subscription,keys:{...subscription.keys,auth:b64(new Uint8Array(16))}}})).status,403);
  assert.equal((await f.request('/api/push/unsubscribe',{subscription})).status,200);
  assert.equal((await f.request('/api/push/test',{subscription})).status,404);
});
test('scheduled dispatch resumes receipts without duplicates, removes 410 endpoints, and exposes queue failure publicly', async t => {
  const f = await setup(t), subscription = await syntheticSubscription('cron');
  assert.equal((await f.request('/api/push/subscribe',{subscription})).status,201);
  const now = Date.now();
  f.state.queue.jobs = [{id:'qa:start:60',event_id:'qa-event',event_title:'Evento QA',status:'pending',lead_minutes:60,scheduled_for:new Date(now).toISOString(),event_start:new Date(now+3600000).toISOString()}];
  // Synthetic queue/subscriptions only. Access the internal stub instead of real scheduled delivery.
  const ns = await f.mf.getDurableObjectNamespace('PUSH'), stub = ns.get(ns.idFromName('spidey-v1'));
  const worker = await f.mf.getWorker();
  const scheduled = await worker.scheduled({scheduledTime:Date.now(),cron:'*/5 * * * *'});
  assert.equal(scheduled.outcome,'ok');
  assert.equal(f.outbound.length,1);
  assert.equal((await stub.fetch('https://internal/dispatch',{method:'POST'})).status,200);
  assert.equal(f.outbound.length,1);
  f.state.queue.jobs[0].id = 'qa:expired:60'; f.state.pushStatus = 410;
  await stub.fetch('https://internal/dispatch',{method:'POST'});
  assert.equal((await f.request('/api/push/test',{subscription})).status,404);
  f.state.queueFail = true;
  assert.equal((await stub.fetch('https://internal/dispatch',{method:'POST'})).status,503);
  assert.equal((await (await f.request('/health')).json()).push.scheduler.status,'queue_error');
});
test('a native Durable Object alarm continues a larger batch without waiting for another five-minute cron', async t => {
  const f = await setup(t);
  for (let i=0;i<30;i++) {
    const subscription=await syntheticSubscription('batch-'+i);
    assert.equal((await f.request('/api/push/subscribe',{subscription})).status,201);
  }
  const now=Date.now();
  f.state.queue.jobs=[{id:'qa:batch:0',event_id:'qa-event',event_title:'Evento QA',status:'pending',lead_minutes:0,scheduled_for:new Date(now).toISOString(),event_start:new Date(now).toISOString()}];
  await (await f.mf.getWorker()).scheduled({scheduledTime:now,cron:'*/5 * * * *'});
  assert.equal(f.outbound.length,24);
  const deadline=Date.now()+30000;
  while(f.outbound.length<30 && Date.now()<deadline) await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(f.outbound.length,30);
  assert.equal(new Set(f.outbound.map(r=>r.url)).size,30);
});
