import { saveSubscription, storageReady } from './_store.js';
import { parseBody, sameOrigin, validSubscription, vapidReady } from './_config.js';
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  if (!storageReady() || !vapidReady()) return response.status(503).json({ error: 'push_not_configured' });
  if (!sameOrigin(request)) return response.status(403).json({ error: 'invalid_origin' });
  const body = parseBody(request);
  if (!validSubscription(body?.subscription)) return response.status(400).json({ error: 'invalid_subscription' });
  try {
    const id = await saveSubscription({
      subscription: { endpoint: body.subscription.endpoint, keys: body.subscription.keys },
      device: { locale: String(body.device?.locale || 'pt-BR').slice(0, 40), timezone: String(body.device?.timezone || 'America/Sao_Paulo').slice(0, 80) },
    });
    return response.status(201).json({ ok: true, id });
  } catch {
    console.error('push subscription store unavailable');
    return response.status(503).json({ error: 'subscription_save_failed' });
  }
}
