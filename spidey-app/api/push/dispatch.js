import webpush from 'web-push';
import { listSubscriptions, readReceipt, writeReceipt, removeSubscription, storageReady, minimizeStoredMetadata } from './_store.js';
import { authorized } from './_auth.js';
import { env, parseBody, vapidReady, validSubscription } from './_config.js';

const DEFAULT_QUEUE_URL = 'https://raw.githubusercontent.com/asaquevoa1-ctrl/spidey-pokemon-go/main/notifications/queue.json';
export function dueJobs(queue, now = Date.now()) {
  return (queue.jobs || []).filter(job => {
    const when = Date.parse(job.scheduled_for), start = Date.parse(job.event_start);
    return job.status === 'pending' && typeof job.id === 'string' && Number.isFinite(when)
      && when <= now && when >= now - 90 * 60000 && Number.isFinite(start)
      && (job.lead_minutes === 0 ? now < start + 10 * 60000 : now < start);
  });
}
export function notificationPayload(job) {
  const start = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(job.event_start));
  return JSON.stringify({ title: 'Spidey Pokémon GO', body: `${job.event_title || 'Evento'} • ${start} (Brasília).`,
    url: `/spidey-app/?event=${encodeURIComponent(job.event_id)}`, tag: job.id, event_id: job.event_id });
}
export async function deliverJob({ job, records, receipt, send, remove, limit = 24 }) {
  const delivered = { ...(receipt.delivered || {}) };
  const pending = records.filter(record => !delivered[record.id]);
  let deliveries = 0, removed = 0;
  const batch = pending.slice(0, limit);
  for (let i = 0; i < batch.length; i += 6) {
    await Promise.all(batch.slice(i, i + 6).map(async record => {
      if (!validSubscription(record.subscription)) { delivered[record.id] = 'invalid'; return; }
      try {
        await send(record.subscription, notificationPayload(job));
        delivered[record.id] = 'sent'; deliveries++;
      } catch (error) {
        const code = Number(error?.statusCode || 0);
        if (code === 404 || code === 410) {
          await remove(record.subscription.endpoint); delivered[record.id] = 'expired'; removed++;
        } else console.error('push delivery postponed', code);
      }
    }));
  }
  return { receipt: { delivered, complete: records.every(record => Boolean(delivered[record.id])) }, deliveries, removed };
}
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method)) return response.status(405).json({ error: 'method_not_allowed' });
  if (!storageReady() || !vapidReady()) return response.status(503).json({ error: 'push_not_configured' });
  if (!await authorized(request)) return response.status(401).json({ error: 'unauthorized' });
  try {
    const dryRun = parseBody(request)?.dry_run === true;
    const metadataCleaned = dryRun ? 0 : await minimizeStoredMetadata();
    const queueResponse = await fetch(env('SPIDEY_NOTIFICATION_QUEUE_URL') || DEFAULT_QUEUE_URL, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!queueResponse.ok) throw new Error('queue_unavailable');
    const queue = await queueResponse.json();
    if (queue.schema_version !== 'spidey-notification-queue-v1' || !Array.isArray(queue.jobs)) throw new Error('invalid_queue');
    const due = dueJobs(queue);
    if (dryRun || !due.length) return response.status(200).json({ ok: true, dry_run: dryRun, due: due.length, deliveries: 0, storage_configured: true, metadata_cleaned: metadataCleaned });
    const pending = [];
    for (const job of due) {
      const receipt = await readReceipt(job.id);
      if (!receipt.complete) pending.push({ job, receipt });
    }
    if (!pending.length) return response.status(200).json({ ok: true, due: due.length, deliveries: 0 });
    const subscriptions = await listSubscriptions();
    webpush.setVapidDetails(env('VAPID_SUBJECT'), env('VAPID_PUBLIC_KEY'), env('VAPID_PRIVATE_KEY'));
    let deliveries = 0, removed = 0, sentJobs = 0;
    // Bounded work; the next scheduled invocation resumes undelivered recipients.
    for (const item of pending.slice(0, 2)) {
      const result = await deliverJob({ ...item, records: subscriptions, limit: 12,
        send: (subscription, payload) => webpush.sendNotification(subscription, payload, { TTL: 3600, timeout: 4000 }), remove: removeSubscription });
      await writeReceipt(item.job.id, result.receipt);
      deliveries += result.deliveries; removed += result.removed;
      if (result.receipt.complete) sentJobs++;
    }
    return response.status(200).json({ ok: true, due: due.length, subscriptions: subscriptions.length, sent_jobs: sentJobs, deliveries, removed_expired: removed });
  } catch {
    console.error('push dispatch unavailable');
    return response.status(503).json({ error: 'dispatch_failed' });
  }
}
