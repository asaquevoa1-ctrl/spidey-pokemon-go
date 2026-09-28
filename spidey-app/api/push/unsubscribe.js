import { removeSubscription, storageReady } from './_store.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  if (!storageReady()) return response.status(503).json({ error: 'push_storage_not_configured' });

  const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
  const endpoint = String(body.endpoint || '');
  if (!endpoint.startsWith('https://')) return response.status(400).json({ error: 'invalid_endpoint' });

  try {
    await removeSubscription(endpoint);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('push unsubscribe', error);
    return response.status(500).json({ error: 'subscription_remove_failed' });
  }
}
