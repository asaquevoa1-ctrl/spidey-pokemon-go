import { createHash } from 'node:crypto';

const SUBSCRIPTIONS_SET = 'spidey:push:subscriptions';
const SUBSCRIPTION_PREFIX = 'spidey:push:subscription:';
const SENT_PREFIX = 'spidey:push:sent:';

function env(name) {
  return String(process.env[name] || '').trim();
}

export function storageReady() {
  return Boolean(env('UPSTASH_REDIS_REST_URL') && env('UPSTASH_REDIS_REST_TOKEN'));
}

export async function redis(command) {
  const url = env('UPSTASH_REDIS_REST_URL').replace(/\/$/, '');
  const token = env('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) throw new Error('push_storage_not_configured');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`redis_http_${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(`redis_${payload.error}`);
  return payload.result;
}

export function subscriptionId(endpoint) {
  return createHash('sha256').update(String(endpoint)).digest('hex');
}

export async function saveSubscription(record) {
  const id = subscriptionId(record.subscription.endpoint);
  const key = `${SUBSCRIPTION_PREFIX}${id}`;
  await redis(['SET', key, JSON.stringify({ ...record, id, updated_at: new Date().toISOString() })]);
  await redis(['SADD', SUBSCRIPTIONS_SET, key]);
  return id;
}

export async function removeSubscription(endpoint) {
  const id = subscriptionId(endpoint);
  const key = `${SUBSCRIPTION_PREFIX}${id}`;
  await redis(['DEL', key]);
  await redis(['SREM', SUBSCRIPTIONS_SET, key]);
}

export async function listSubscriptions() {
  const keys = (await redis(['SMEMBERS', SUBSCRIPTIONS_SET])) || [];
  const records = [];
  for (const key of keys) {
    const raw = await redis(['GET', key]);
    if (!raw) {
      await redis(['SREM', SUBSCRIPTIONS_SET, key]);
      continue;
    }
    try { records.push(JSON.parse(raw)); } catch (_) { /* registro inválido: ignora */ }
  }
  return records;
}

export async function wasSent(jobId) {
  return Boolean(await redis(['GET', `${SENT_PREFIX}${jobId}`]));
}

export async function markSent(jobId) {
  await redis(['SET', `${SENT_PREFIX}${jobId}`, new Date().toISOString(), 'EX', '2592000']);
}
