import { saveSubscription, storageReady } from './_store.js';

function validSubscription(subscription) {
  return Boolean(
    subscription &&
    typeof subscription.endpoint === 'string' &&
    subscription.endpoint.startsWith('https://') &&
    subscription.keys &&
    typeof subscription.keys.p256dh === 'string' &&
    typeof subscription.keys.auth === 'string'
  );
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  if (!storageReady()) return response.status(503).json({ error: 'push_storage_not_configured' });

  const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
  if (!validSubscription(body.subscription)) return response.status(400).json({ error: 'invalid_subscription' });

  const record = {
    subscription: body.subscription,
    device: {
      locale: String(body.device?.locale || '').slice(0, 32),
      timezone: String(body.device?.timezone || '').slice(0, 80),
      userAgent: String(body.device?.userAgent || '').slice(0, 500),
    },
    created_at: new Date().toISOString(),
  };

  try {
    const id = await saveSubscription(record);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(201).json({ ok: true, id });
  } catch (error) {
    console.error('push subscribe', error);
    return response.status(500).json({ error: 'subscription_store_failed' });
  }
}
