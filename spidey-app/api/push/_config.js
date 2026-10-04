export function env(name) { return String(process.env[name] || '').trim(); }
export function vapidReady() { return Boolean(env('VAPID_PUBLIC_KEY') && env('VAPID_PRIVATE_KEY') && env('VAPID_SUBJECT')); }
export function parseBody(request) {
  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  } catch { return null; }
}
export function sameOrigin(request) {
  const origin = request.headers?.origin;
  if (!origin) return true;
  return origin === 'https://spidey-pokemon-go.vercel.app' || origin === `https://${request.headers.host}`;
}
export function validEndpoint(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return false;
    return url.hostname === 'fcm.googleapis.com' || url.hostname === 'web.push.apple.com'
      || url.hostname === 'updates.push.services.mozilla.com' || url.hostname === 'push.services.mozilla.com'
      || url.hostname.endsWith('.notify.windows.com');
  } catch { return false; }
}
export function validSubscription(subscription) {
  if (!validEndpoint(subscription?.endpoint)) return false;
  const { p256dh, auth } = subscription.keys || {};
  if (![p256dh, auth].every(key => typeof key === 'string' && /^[A-Za-z0-9_-]+={0,2}$/.test(key))) return false;
  const publicKey = Buffer.from(p256dh, 'base64url');
  return publicKey.length === 65 && publicKey[0] === 4 && Buffer.from(auth, 'base64url').length === 16;
}
