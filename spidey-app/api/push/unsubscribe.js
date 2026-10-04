import { removeSubscription, storageReady } from './_store.js';
import { parseBody, sameOrigin, validEndpoint } from './_config.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  if (!storageReady()) return response.status(503).json({ error: 'push_storage_not_configured' });

  if (!sameOrigin(request)) return response.status(403).json({ error: 'invalid_origin' });
  const endpoint = parseBody(request)?.endpoint;
  if (!validEndpoint(endpoint)) return response.status(400).json({ error: 'invalid_endpoint' });

  try {
    await removeSubscription(endpoint);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ ok: true });
  } catch {
    console.error('push unsubscribe store unavailable');
    return response.status(500).json({ error: 'subscription_remove_failed' });
  }
}
