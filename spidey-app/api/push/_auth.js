import { createPublicKey, verify, timingSafeEqual } from 'node:crypto';
import { env } from './_config.js';
export const DISPATCH_AUDIENCE = 'https://spidey-pokemon-go.vercel.app/api/push/dispatch';
const REPOSITORY = 'asaquevoa1-ctrl/spidey-pokemon-go';
const REPOSITORY_ID = '1377613549';
const OWNER_ID = '331416810';
const SUBJECTS = new Set([`repo:${REPOSITORY}:ref:refs/heads/main`, `repo:asaquevoa1-ctrl@${OWNER_ID}/spidey-pokemon-go@${REPOSITORY_ID}:ref:refs/heads/main`]);
const WORKFLOW = `${REPOSITORY}/.github/workflows/spidey-push-dispatch.yml@refs/heads/main`;
let cachedKeys;
let keysFetchedAt = 0;
export async function verifyGithubToken(token, { fetchKeys, now = Date.now() } = {}) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || token.length > 16000) return false;
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const seconds = Math.floor(now / 1000);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') return false;
    if (claims.iss !== 'https://token.actions.githubusercontent.com'
      || claims.aud !== DISPATCH_AUDIENCE || claims.repository !== REPOSITORY
      || claims.ref !== 'refs/heads/main' || claims.workflow_ref !== WORKFLOW
      || String(claims.repository_id) !== REPOSITORY_ID || String(claims.repository_owner_id) !== OWNER_ID
      || !SUBJECTS.has(claims.sub)
      || !['schedule', 'workflow_dispatch', 'push'].includes(claims.event_name)
      || !Number.isFinite(claims.exp) || claims.exp <= seconds
      || !Number.isFinite(claims.iat) || claims.iat > seconds + 60
      || (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > seconds + 60))) return false;
    let keys;
    if (fetchKeys) keys = await fetchKeys();
    else {
      if (!cachedKeys || now - keysFetchedAt > 5 * 60 * 1000 || !cachedKeys.some(key => key.kid === header.kid)) {
        const response = await fetch('https://token.actions.githubusercontent.com/.well-known/jwks', { signal: AbortSignal.timeout(5000) });
        if (!response.ok) return false;
        cachedKeys = (await response.json()).keys; keysFetchedAt = now;
      }
      keys = cachedKeys;
    }
    const jwk = keys?.find(key => key.kid === header.kid && key.kty === 'RSA');
    return Boolean(jwk && verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url')));
  } catch { return false; }
}
export async function authorized(request) {
  const token = String(request.headers?.authorization || '').replace(/^Bearer /, '');
  if (!token) return false;
  const secret = env('CRON_SECRET');
  if (secret && Buffer.byteLength(token) === Buffer.byteLength(secret) && timingSafeEqual(Buffer.from(token), Buffer.from(secret))) return true;
  return verifyGithubToken(token);
}
