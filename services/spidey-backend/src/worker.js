import { json, errorResponse, fail } from './store.js';
export { PushHub } from './push-hub.js';

const MAX_BODY = 16384;
const VERSION = 'spidey-push-only-v1';
function originAllowed(env) { return new URL(env.APP_URL).origin; }
function cors(response, origin) {
  const headers = new Headers(response.headers);
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  return new Response(response.body, {status: response.status, headers});
}
async function boundedBody(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) fail('json_required', 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) fail('request_too_large', 413);
  const reader = request.body?.getReader();
  if (!reader) fail('invalid_request');
  const chunks = []; let count = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    count += value.byteLength;
    if (count > MAX_BODY) { await reader.cancel(); fail('request_too_large', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(count);
  let offset = 0;
  for (const c of chunks) { bytes.set(c, offset); offset += c.length; }
  const text = new TextDecoder('utf-8', {fatal:true}).decode(bytes);
  try { JSON.parse(text); } catch { fail('invalid_json'); }
  return text;
}
function hub(env) { return env.PUSH.get(env.PUSH.idFromName('spidey-push-v1')); }

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = originAllowed(env);
    const reply = response => cors(response, origin === allowed ? origin : null);
    try {
      if (origin && origin !== allowed) fail('origin_not_allowed', 403);
      const path = new URL(request.url).pathname;
      const push = /^\/api\/push\/(public-key|subscribe|unsubscribe|test)$/.test(path);
      if (request.method === 'OPTIONS' && push) return reply(new Response(null, {status:204, headers:{
        'Access-Control-Allow-Methods':'GET, POST, OPTIONS', 'Access-Control-Allow-Headers':'Content-Type',
        'Access-Control-Max-Age':'600'
      }}));
      if (path === '/health' && request.method === 'GET') {
        const response = await hub(env).fetch('https://internal/health');
        return reply(json({...(await response.json()), version:VERSION, app_url:env.APP_URL}));
      }
      if (!push) fail('not_found',404);
      if (request.method !== 'POST' && !(path.endsWith('/public-key') && request.method === 'GET')) fail('method_not_allowed',405);
      if (request.method === 'POST' && origin !== allowed) fail('origin_required',403);
      const body = request.method === 'POST' ? await boundedBody(request) : undefined;
      const response = await hub(env).fetch(new Request('https://internal'+path, {
        method:request.method,headers:body?{'Content-Type':'application/json'}:undefined,body
      }));
      return reply(response);
    } catch(err) { return reply(errorResponse(err)); }
  },
  async scheduled(event,env,ctx) {
    ctx.waitUntil(hub(env).fetch('https://internal/dispatch',{method:'POST'})
      .then(r=>{if(!r.ok) throw Error('push_schedule_failed');}));
  }
};