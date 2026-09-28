import webpush from 'web-push';
import { listSubscriptions, markSent, removeSubscription, storageReady, wasSent } from './_store.js';

const DEFAULT_QUEUE_URL = 'https://raw.githubusercontent.com/asaquevoa1-ctrl/spidey-pokemon-go/main/notifications/queue.json';

function env(name) {
  return String(process.env[name] || '').trim();
}

function authorized(request) {
  const secret = env('CRON_SECRET');
  if (!secret) return false;
  return request.headers.authorization === `Bearer ${secret}`;
}

function pushReady() {
  return Boolean(
    storageReady() &&
    env('VAPID_PUBLIC_KEY') &&
    env('VAPID_PRIVATE_KEY') &&
    env('VAPID_SUBJECT') &&
    env('CRON_SECRET')
  );
}

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) return response.status(405).json({ error: 'method_not_allowed' });
  if (!pushReady()) return response.status(503).json({ error: 'push_not_configured' });
  if (!authorized(request)) return response.status(401).json({ error: 'unauthorized' });

  try {
    webpush.setVapidDetails(env('VAPID_SUBJECT'), env('VAPID_PUBLIC_KEY'), env('VAPID_PRIVATE_KEY'));

    const queueResponse = await fetch(env('SPIDEY_NOTIFICATION_QUEUE_URL') || DEFAULT_QUEUE_URL, { cache: 'no-store' });
    if (!queueResponse.ok) throw new Error(`queue_http_${queueResponse.status}`);
    const queue = await queueResponse.json();

    const now = Date.now();
    const graceMs = 20 * 60 * 1000;
    const due = (queue.jobs || []).filter((job) => {
      if (job.status !== 'pending' || !job.scheduled_for) return false;
      const when = new Date(job.scheduled_for).getTime();
      return Number.isFinite(when) && when <= now && when >= now - graceMs;
    });

    const subscriptions = await listSubscriptions();
    let sentJobs = 0;
    let deliveries = 0;
    let removed = 0;

    for (const job of due) {
      if (await wasSent(job.id)) continue;
      let deliveredForJob = 0;
      const payload = JSON.stringify({
        title: job.title || 'Spidey Pokémon GO',
        body: job.body || `${job.event_title || 'Evento'} está chegando.`,
        url: job.url?.startsWith('/') ? job.url : `/${String(job.url || '').replace(/^\.\//, '')}`,
        tag: job.id,
        event_id: job.event_id,
      });

      for (const record of subscriptions) {
        try {
          await webpush.sendNotification(record.subscription, payload, { TTL: 3600 });
          deliveredForJob += 1;
          deliveries += 1;
        } catch (error) {
          const code = Number(error?.statusCode || 0);
          if (code === 404 || code === 410) {
            await removeSubscription(record.subscription.endpoint);
            removed += 1;
            continue;
          }
          console.error('push delivery failed', job.id, code || error?.message || error);
        }
      }

      if (deliveredForJob > 0) {
        await markSent(job.id);
        sentJobs += 1;
      }
    }

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({
      ok: true,
      due: due.length,
      subscriptions: subscriptions.length,
      sent_jobs: sentJobs,
      deliveries,
      removed_expired: removed,
    });
  } catch (error) {
    console.error('push dispatch', error);
    return response.status(500).json({ error: 'dispatch_failed' });
  }
}
