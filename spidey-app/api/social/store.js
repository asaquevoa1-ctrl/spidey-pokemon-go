import { get, put, list, del, head, BlobNotFoundError, BlobPreconditionFailedError } from '@vercel/blob';
import { createHash } from 'node:crypto';

// Reuse the existing private store. Preview identities never enter production.
const env = name => String(process.env[name] || '').trim();
export const socialReady = () => Boolean(env('BLOB_READ_WRITE_TOKEN'));
export function socialPrefix() {
  return env('VERCEL_ENV') === 'preview'
    ? `spidey-social/preview-${createHash('sha256').update(env('VERCEL_GIT_COMMIT_REF') || env('VERCEL_GIT_COMMIT_SHA')).digest('hex').slice(0,16)}/`
    : 'spidey-social/v1/';
}
export function blobStore(sdk = {get,put,list,del,head}) {
  const options = () => ({ access: 'private', token: env('BLOB_READ_WRITE_TOKEN') });
  const path = key => `${socialPrefix()}${key}.json`;
  async function read(key, forWrite = false) {
    let metadata;
    if (forWrite) {
      try { metadata = await sdk.head(path(key), {token:env('BLOB_READ_WRITE_TOKEN'),abortSignal:AbortSignal.timeout(6000)}); }
      catch(error) { if (error instanceof BlobNotFoundError) return null; throw error; }
    }
    const result = await sdk.get(path(key), { ...options(), useCache: false, abortSignal:AbortSignal.timeout(6000) });
    // The metadata API supplies the canonical write ETag. Some HTTP delivery
    // responses use a different representation tag. Read metadata BEFORE data;
    // an intervening write makes the subsequent conditional put fail and retry.
    return result ? { value: JSON.parse(await new Response(result.stream).text()), etag: metadata?.etag || result.blob.etag } : null;
  }
  return {
    async read(key) { return (await read(key))?.value || null; },
    async mutate(key, transform) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const previous = await read(key,true);
        const value = transform(previous ? structuredClone(previous.value) : null);
        if (value === undefined) return previous?.value || null;
        try {
          await sdk.put(path(key), JSON.stringify(value), { ...options(), contentType: 'application/json',abortSignal:AbortSignal.timeout(6000),
            addRandomSuffix: false, allowOverwrite: Boolean(previous), ...(previous ? { ifMatch: previous.etag } : {}), cacheControlMaxAge: 60 });
          return value;
        } catch (error) {
          const conflict = error instanceof BlobPreconditionFailedError || !previous && /already exists/i.test(error?.message || '');
          if (!conflict || attempt === 4) throw error;
        }
      }
    },
    async keys(prefix) {
      const keys = []; let cursor;
      do {
        const page = await sdk.list({ token: env('BLOB_READ_WRITE_TOKEN'), prefix: socialPrefix()+prefix, cursor, limit: 100 });
        keys.push(...page.blobs.map(b => b.pathname.slice(socialPrefix().length).replace(/\.json$/, '')));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor && keys.length < 1000);
      return keys;
    },
    async remove(key) { await sdk.del(path(key), { token: env('BLOB_READ_WRITE_TOKEN') }); },
  };
}

// Bounded cleanup called only by the existing authenticated push scheduler.
// Expired ciphertext is also removed when either participant opens the chat.
export async function pruneSocialData(now = Date.now()) {
  if (!socialReady()) return {processed:0};
  const store = blobStore(), day = new Date(now).toISOString().slice(0,10);
  const marker = await store.read('maintenance');
  if (marker?.day === day && marker.complete) return {processed:0};
  const keys = [...await store.keys('pairs/'),...await store.keys('reports/')].sort();
  const cursor = marker?.day === day ? marker.cursor : '';
  const remaining = keys.filter(key=>key>cursor), batch = remaining.slice(0,12);
  for(let i=0;i<batch.length;i+=4) await Promise.all(batch.slice(i,i+4).map(key=>store.mutate(key,value=>{
    if(!value)return undefined;const field=key.startsWith('pairs/')?'messages':'reports';
    const rows=(value[field] || []).filter(row=>row.at>now-30*86400000);
    return rows.length===(value[field] || []).length?undefined:{...value,[field]:rows};
  })));
  await store.mutate('maintenance',()=>({day,cursor:batch.at(-1) || cursor,complete:remaining.length<=12}));
  return {processed:batch.length};
}
