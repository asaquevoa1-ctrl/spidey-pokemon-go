import { buildPushPayload } from '@block65/webcrypto-web-push';
import { createHash } from 'node:crypto';
import { SerializedHub, json, errorResponse, fail } from './store.js';

const DAY = 86400000;
const idFor = value => createHash('sha256').update(value).digest('hex');
const b64 = value => Buffer.from(value).toString('base64url');
export function validEndpoint(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash
      && (['fcm.googleapis.com', 'web.push.apple.com', 'updates.push.services.mozilla.com', 'push.services.mozilla.com'].includes(url.hostname)
          || url.hostname.endsWith('.notify.windows.com'));
  } catch { return false; }
}
export function subscriptionFields(s) {
  if (!validEndpoint(s?.endpoint) || !s.keys || !['p256dh', 'auth'].every(k => typeof s.keys[k] === 'string' && /^[A-Za-z0-9_-]+={0,2}$/.test(s.keys[k]))) fail('invalid_subscription');
  const publicKey = Buffer.from(s.keys.p256dh, 'base64url'), auth = Buffer.from(s.keys.auth, 'base64url');
  if (publicKey.length !== 65 || publicKey[0] !== 4 || auth.length !== 16) fail('invalid_subscription');
  return { endpoint: s.endpoint, keys: { p256dh: b64(publicKey), auth: b64(auth) } };
}
export function dueJobs(queue, now = Date.now()) {
  return queue.jobs.filter(job => {
    const when = Date.parse(job.scheduled_for), start = Date.parse(job.event_start);
    return job.status === 'pending' && /^[A-Za-z0-9_.:-]{1,180}$/.test(job.id || '') && typeof job.event_id === 'string'
      && Number.isFinite(when) && when <= now && when >= now - 90 * 60000 && Number.isFinite(start)
      && (job.lead_minutes === 0 ? now < start + 10 * 60000 : now < start);
  });
}
export function notificationPayload(job, appUrl) {
  const start = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(job.event_start));
  const url = new URL(appUrl); url.searchParams.set('event', job.event_id);
  return JSON.stringify({ title: 'Spidey Pokémon GO', body: `${String(job.event_title || 'Evento').slice(0,180)} • ${start} (Brasília).`, url: url.href, tag: job.id, event_id: job.event_id });
}
export class PushHub extends SerializedHub {
  enabled() { return this.env.DISPATCH_ENABLED === 'true'; }
  async keys() {
    let keys = this.store.read('_vapid');
    if (!keys) {
      const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
      const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
      keys = { publicKey: b64(await crypto.subtle.exportKey('raw', pair.publicKey)), privateKey: privateJwk.d, subject: this.env.APP_URL };
      this.store.write('_vapid', keys);
    }
    return keys;
  }
  async fetch(request) {
    return this.serialized(async () => {
      try {
        const path = new URL(request.url).pathname;
        if (path === '/health') return json({ ok: true, push: { available: this.enabled(), scheduler: this.store.read('_scheduler') || { status: 'awaiting_first_run', checked_at: null } } });
        if (path === '/api/push/public-key') return json(this.enabled() ? { available: true, publicKey: (await this.keys()).publicKey } : { available: false, publicKey: null, error: 'push_not_configured' });
        if (path === '/dispatch') return await this.dispatch();
        if (!this.enabled()) fail('push_not_configured', 503);
        this.store.reserveBudget(5000);
        const data = await request.json(), subscription = subscriptionFields(data?.subscription);
        const key = 'subscriptions/' + idFor(subscription.endpoint), saved = this.store.read(key);
        if (path === '/api/push/subscribe') {
          // The existing private auth secret proves ownership when refreshing an endpoint.
          if (saved && !this.matches(saved, subscription)) fail('subscription_mismatch', 403);
          if (!saved && this.store.rows('subscriptions/').length >= 500) fail('subscription_limit', 429);
          // Import the actual curve point before storing it, avoiding unusable subscriptions.
          try { await crypto.subtle.importKey('raw', Buffer.from(subscription.keys.p256dh, 'base64url'), { name: 'ECDH', namedCurve: 'P-256' }, false, []); }
          catch { fail('invalid_subscription'); }
          await this.keys();
          this.store.write(key, { subscription, created_at: saved?.created_at || Date.now(), updated_at: Date.now(), last_test: saved?.last_test || 0 });
          return json({ ok: true }, 201);
        }
        if (!saved) fail('subscription_missing', 404);
        if (!this.matches(saved, subscription)) fail('subscription_mismatch', 403);
        if (path === '/api/push/unsubscribe') { this.store.write(key, undefined); return json({ ok: true }); }
        if (path === '/api/push/test') {
          if (saved.last_test > Date.now() - 60000) fail('slow_down', 429);
          this.store.write(key, { ...saved, last_test: Date.now() });
          const status = await this.send(subscription, JSON.stringify({ title: 'Spidey Pokémon GO', body: 'Alerta de teste. Se você recebeu este aviso, a entrega neste aparelho funcionou.', url: this.env.APP_URL, tag: 'spidey-push-test' }), 300);
          if ([404,410].includes(status)) { this.store.write(key, undefined); fail('subscription_expired', 410); }
          if (status < 200 || status >= 300) fail('push_delivery_failed', 503);
          return json({ ok: true, accepted_by_push_service: true, device_receipt_verified: false });
        }
        fail('not_found', 404);
      } catch (error) { return errorResponse(error); }
    });
  }
  matches(saved, subscription) {
    return saved.subscription.keys.auth === subscription.keys.auth && saved.subscription.keys.p256dh === subscription.keys.p256dh;
  }
  async send(subscription, payload, ttl = 3600) {
    const request = await buildPushPayload({ data: payload, options: { ttl } }, subscription, await this.keys());
    try {
      const response = await fetch(subscription.endpoint, { ...request, redirect: 'manual', signal: AbortSignal.timeout(4000) });
      await response.body?.cancel();
      return response.status;
    } catch { return 0; }
  }
  cleanup(now) {
    this.ctx.storage.transactionSync(() => {
      for (const [key, receipt] of this.store.rows('receipts/')) if (receipt.at < now - 7 * DAY) this.store.write(key, undefined);
      for (const [key, saved] of this.store.rows('subscriptions/')) if (saved.updated_at < now - 90 * DAY) this.store.write(key, undefined);
    });
  }
  async dispatch() {
    const now = Date.now();
    if (!this.enabled()) {
      await this.ctx.storage.deleteAlarm();
      this.store.write('_scheduler', { status: 'disabled', checked_at: new Date(now).toISOString() });
      return json({ ok: true, dispatch_enabled: false });
    }
    this.store.write('_scheduler', { status: 'running', checked_at: new Date(now).toISOString() });
    try {
      const response = await fetch(this.env.QUEUE_URL, { cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(5000) });
      if (!response.ok) fail('queue_unavailable', 503);
      // The queue is public and fixed by the deployment, never a URL supplied by a user.
      const queue = await response.json();
      if (queue.schema_version !== 'spidey-notification-queue-v1' || !Array.isArray(queue.jobs) || queue.jobs.length > 5000) fail('invalid_queue', 503);
      this.cleanup(now);
      const rows = this.store.rows('subscriptions/').map(([key, saved]) => ({ key, ...saved }));
      let failed = false, jobs = 0, needsResume = false;
      const due = dueJobs(queue, now);
      for (const job of due) {
        const receiptKey = 'receipts/' + idFor(job.id);
        let receipt = this.store.read(receiptKey) || { at: now, delivered: {}, attempts: {}, complete: false };
        if (receipt.complete) continue;
        const eligible = rows.filter(row => row.created_at <= Date.parse(job.scheduled_for));
        receipt.attempts ||= {};
        const batch = eligible.filter(row => !receipt.delivered[row.key]).sort((a,b)=>(receipt.attempts[a.key] || 0)-(receipt.attempts[b.key] || 0)).slice(0, 24);
        // 48 push fetches + one queue fetch at most, under the free subrequest limit.
        // Persist a continuation before sending so bounded batches resume even after interruption.
        await this.ctx.storage.setAlarm(Date.now() + 20000);
        for (let offset = 0; offset < batch.length; offset += 6) await Promise.all(batch.slice(offset,offset+6).map(async row => {
          receipt.attempts[row.key] = now;
          const status = await this.send(row.subscription, notificationPayload(job, this.env.APP_URL));
          if (status >= 200 && status < 300) receipt.delivered[row.key] = 'sent';
          else if ([404,410].includes(status)) { receipt.delivered[row.key] = 'expired'; this.store.write(row.key, undefined); }
          else failed = true;
          // Record each acknowledgement so a later invocation resumes after an error.
          this.store.write(receiptKey, receipt);
        }));
        receipt.complete = eligible.every(row => receipt.delivered[row.key]);
        needsResume ||= !receipt.complete;
        this.store.write(receiptKey, receipt);
        if (++jobs >= 2) {
          needsResume ||= due.some(candidate => !this.store.read('receipts/' + idFor(candidate.id))?.complete);
          break;
        }
      }
      if (needsResume) await this.ctx.storage.setAlarm(Date.now() + (failed ? 5 * 60000 : 20000));
      else await this.ctx.storage.deleteAlarm();
      this.store.write('_scheduler', { status: failed ? 'delivery_error' : 'ok', checked_at: new Date(now).toISOString() });
      return json({ ok: !failed }, failed ? 503 : 200);
    } catch (error) {
      await this.ctx.storage.setAlarm(Date.now() + 5 * 60000);
      this.store.write('_scheduler', { status: 'queue_error', checked_at: new Date(now).toISOString() });
      return errorResponse(error);
    }
  }
  async alarm() { await this.serialized(() => this.dispatch()); }
}
