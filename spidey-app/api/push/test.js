import webpush from 'web-push';
import { readSubscription, markTested, storageReady } from './_store.js';
import { env, parseBody, sameOrigin, validSubscription, vapidReady } from './_config.js';
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  if (!storageReady() || !vapidReady()) return response.status(503).json({ error: 'push_not_configured' });
  if (!sameOrigin(request)) return response.status(403).json({ error: 'invalid_origin' });
  const body = parseBody(request);
  if (!validSubscription(body?.subscription)) return response.status(400).json({ error: 'invalid_subscription' });
  try {
    const record = await readSubscription(body.subscription.endpoint);
    if (!record || record.subscription.keys.auth !== body.subscription.keys.auth || record.subscription.keys.p256dh !== body.subscription.keys.p256dh) return response.status(404).json({ error: 'subscription_not_found' });
    if (Date.now() - Date.parse(record.last_test_at || '') < 60000) return response.status(429).json({ error: 'test_too_soon' });
    await markTested(record);
    webpush.setVapidDetails(env('VAPID_SUBJECT'), env('VAPID_PUBLIC_KEY'), env('VAPID_PRIVATE_KEY'));
    await webpush.sendNotification(record.subscription, JSON.stringify({ title: 'Spidey Pokémon GO', body: 'Seu alerta de teste chegou. Você pode receber avisos dos próximos eventos.', url: '/spidey-app/', tag: 'spidey-test' }), { TTL: 300, timeout: 5000 });
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('push test failed', Number(error?.statusCode || 0));
    return response.status(503).json({ error: 'test_delivery_failed' });
  }
}
