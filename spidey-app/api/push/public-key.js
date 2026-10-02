import { storageReady } from './_store.js';

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' });
  const publicKey = String(process.env.VAPID_PUBLIC_KEY || '').trim();
  if (!publicKey || !storageReady() || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT || !process.env.CRON_SECRET) {
    return response.status(503).json({ error: 'push_not_configured' });
  }
  return response.status(200).json({ publicKey });
}
