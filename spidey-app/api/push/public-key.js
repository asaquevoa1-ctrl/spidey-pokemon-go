export default function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' });
  const publicKey = String(process.env.VAPID_PUBLIC_KEY || '').trim();
  if (!publicKey) return response.status(503).json({ error: 'push_not_configured' });
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ publicKey });
}
