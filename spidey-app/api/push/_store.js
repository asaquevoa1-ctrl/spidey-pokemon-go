import { createHash } from 'node:crypto';
import { get, put, list, del } from '@vercel/blob';
import { env } from './_config.js';

const SUBSCRIPTIONS_SET = 'spidey:push:subscriptions';
const SUBSCRIPTION_PREFIX = 'spidey:push:subscription:';
const SENT_PREFIX = 'spidey:push:sent:';
const BLOB_PREFIX = 'spidey-push/';
function redisReady() { return Boolean(env('UPSTASH_REDIS_REST_URL') && env('UPSTASH_REDIS_REST_TOKEN')); }
export function storageReady() { return redisReady() || Boolean(env('BLOB_READ_WRITE_TOKEN')); }
export function subscriptionId(endpoint) { return createHash('sha256').update(String(endpoint)).digest('hex'); }
const blobOptions = () => ({ access: 'private', token: env('BLOB_READ_WRITE_TOKEN') });
async function redis(command) {
  const response = await fetch(env('UPSTASH_REDIS_REST_URL').replace(/\/$/, ''), {
    method: 'POST', headers: { Authorization: `Bearer ${env('UPSTASH_REDIS_REST_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command), signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error('push_store_unavailable');
  const payload = await response.json();
  if (payload.error) throw new Error('push_store_unavailable');
  return payload.result;
}
async function read(path) {
  const result = await get(`${BLOB_PREFIX}${path}.json`, { ...blobOptions(), useCache: false });
  if (!result) return null;
  return JSON.parse(await new Response(result.stream).text());
}
async function write(path, value) {
  await put(`${BLOB_PREFIX}${path}.json`, JSON.stringify(value), {
    ...blobOptions(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60,
  });
}
export async function readSubscription(endpoint) {
  const id = subscriptionId(endpoint);
  if (redisReady()) {
    const raw = await redis(['GET', `${SUBSCRIPTION_PREFIX}${id}`]);
    return raw ? JSON.parse(raw) : null;
  }
  return read(`subscriptions/${id}`);
}
export async function saveSubscription(record) {
  const id = subscriptionId(record.subscription.endpoint);
  const previous = await readSubscription(record.subscription.endpoint);
  if (previous && JSON.stringify(previous.subscription.keys) === JSON.stringify(record.subscription.keys)
    && Object.keys(previous).every(key => ['subscription', 'id', 'created_at', 'updated_at', 'last_test_at'].includes(key))) return id;
  const saved = minimalSubscriptionRecord({ ...record, id, created_at: previous?.created_at || new Date().toISOString(), updated_at: new Date().toISOString(), last_test_at: previous?.last_test_at });
  if (redisReady()) {
    const key = `${SUBSCRIPTION_PREFIX}${id}`;
    await redis(['SET', key, JSON.stringify(saved)]); await redis(['SADD', SUBSCRIPTIONS_SET, key]);
  } else await write(`subscriptions/${id}`, saved);
  return id;
}
export async function removeSubscription(endpoint) {
  const id = subscriptionId(endpoint);
  if (redisReady()) {
    const key = `${SUBSCRIPTION_PREFIX}${id}`;
    await redis(['DEL', key]); await redis(['SREM', SUBSCRIPTIONS_SET, key]);
  } else await del(`${BLOB_PREFIX}subscriptions/${id}.json`, { token: env('BLOB_READ_WRITE_TOKEN') });
}
export async function listSubscriptions() {
  if (redisReady()) {
    const keys = (await redis(['SMEMBERS', SUBSCRIPTIONS_SET])) || [];
    const records = [];
    for (const key of keys) {
      const raw = await redis(['GET', key]);
      if (raw) records.push(JSON.parse(raw));
    }
    return records;
  }
  const records = [];
  let cursor;
  do {
    const page = await list({ token: env('BLOB_READ_WRITE_TOKEN'), prefix: `${BLOB_PREFIX}subscriptions/`, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const result = await get(blob.url, { ...blobOptions(), useCache: false });
      if (result) records.push(JSON.parse(await new Response(result.stream).text()));
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return records;
}
export async function readReceipt(jobId) {
  if (redisReady()) {
    const raw = await redis(['GET', `${SENT_PREFIX}${jobId}`]);
    if (!raw) return { delivered: {} };
    try { return JSON.parse(raw); } catch { return { complete: true, delivered: {} }; }
  }
  return await read(`receipts/${subscriptionId(jobId)}`) || { delivered: {} };
}
export async function writeReceipt(jobId, receipt) {
  const record = { ...receipt, updated_at: new Date().toISOString() };
  if (redisReady()) await redis(['SET', `${SENT_PREFIX}${jobId}`, JSON.stringify(record), 'EX', '2592000']);
  else await write(`receipts/${subscriptionId(jobId)}`, record);
}
export async function markTested(record) {
  const saved = minimalSubscriptionRecord({ ...record, last_test_at: new Date().toISOString() });
  if (redisReady()) await redis(['SET', `${SUBSCRIPTION_PREFIX}${record.id}`, JSON.stringify(saved)]);
  else await write(`subscriptions/${record.id}`, saved);
}

export function minimalSubscriptionRecord(record) {
  const keys = record.subscription.keys;
  return { subscription: { endpoint: record.subscription.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }, id: record.id,
    created_at: record.created_at, updated_at: record.updated_at, ...(record.last_test_at ? { last_test_at: record.last_test_at } : {}) };
}

// Runs under the existing authenticated dispatch workflow; no data is exported.
export async function minimizeStoredMetadata() {
  const key = 'privacy-minimize-v1';
  if ((await readReceipt(key)).complete) return 0;
  let cleaned = 0;
  for (const record of await listSubscriptions()) {
    if (Object.keys(record).some(key => !['subscription', 'id', 'created_at', 'updated_at', 'last_test_at'].includes(key))) {
      await saveSubscription(record); cleaned++;
    }
  }
  await writeReceipt(key, { complete: true });
  return cleaned;
}
