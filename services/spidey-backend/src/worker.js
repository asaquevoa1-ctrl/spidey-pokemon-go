import { json, errorResponse, fail } from './store.js';
export { SocialHub } from './social-hub.js';
export { PushHub } from './push-hub.js';

const MAX_BODY = 16384;
const VERSION = 'spidey-backend-v1';
function appOrigin(env) { return new URL(env.APP_URL).origin; }
function cors(response, origin) {
  const headers = new Headers(response.headers);
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  return new Response(response.body, { status: response.status, headers });
}
async function boundedBody(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) fail('json_required', 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) fail('request_too_large', 413);
  const reader = request.body?.getReader();
  if (!reader) fail('invalid_request');
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); fail('request_too_large', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const body = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  try { JSON.parse(body); } catch { fail('invalid_json'); }
  return body;
}
function hub(env, name) { return env[name].get(env[name].idFromName('spidey-v1')); }

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = appOrigin(env);
    const reply = response => cors(response, origin === allowed ? origin : null);
    try {
      if (origin && origin !== allowed) fail('origin_not_allowed', 403);
      const path = new URL(request.url).pathname;
      const social = path === '/api/social';
      const push = /^\/api\/push\/(public-key|subscribe|unsubscribe|test)$/.test(path);
      if (request.method === 'OPTIONS' && (social || push)) return reply(new Response(null, {
        status: 204, headers: { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' },
      }));
      if (path === '/health' && request.method === 'GET') {
        const response = await hub(env, 'PUSH').fetch('https://internal/health');
        return reply(json({ ...(await response.json()), version: VERSION, social: { available: true }, app_url: env.APP_URL }));
      }
      if (!social && !push) fail('not_found', 404);
      const readOnly = social || path.endsWith('/public-key');
      if (request.method !== 'POST' && !(readOnly && request.method === 'GET')) fail('method_not_allowed', 405);
      if (request.method === 'POST' && origin !== allowed) fail('origin_required', 403);
      const body = request.method === 'POST' ? await boundedBody(request) : undefined;
      const response = await hub(env, social ? 'SOCIAL' : 'PUSH').fetch(new Request('https://internal' + path, {
        method: request.method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body,
      }));
      return reply(response);
    } catch (error) { return reply(errorResponse(error)); }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(Promise.all([
      hub(env, 'PUSH').fetch('https://internal/dispatch', { method: 'POST' }).then(r => { if (!r.ok) throw Error('push_schedule_failed'); }),
      // Cleanup once per hour, keeping reads and writes inside the free allocation.
      ...(new Date(_event.scheduledTime).getUTCMinutes() < 5 ? [hub(env, 'SOCIAL').fetch('https://internal/cleanup', { method: 'POST' })] : []),
    ]));
  },
};
