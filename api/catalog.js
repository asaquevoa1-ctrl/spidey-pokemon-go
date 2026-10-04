const FILES = { events: 'events', stamps: 'rallies', weekly: 'days', 'local-events': 'events' };
export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' });
  const file = request.query?.file;
  if (typeof file !== 'string' || !Object.hasOwn(FILES, file)) return response.status(400).json({ error: 'invalid_catalog' });
  try {
    const previewSha = process.env.VERCEL_GIT_COMMIT_SHA || '';
    const ref = process.env.VERCEL_ENV === 'preview' && /^[a-f0-9]{40}$/.test(previewSha) ? previewSha : 'main';
    const source = await fetch(`https://raw.githubusercontent.com/asaquevoa1-ctrl/spidey-pokemon-go/${ref}/spidey-app/data/${file}.json`, { cache: 'no-store', signal: AbortSignal.timeout(6000) });
    if (!source.ok) throw new Error('catalog_unavailable');
    const data = await source.json();
    if (!Array.isArray(data[FILES[file]])) throw new Error('invalid_catalog');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
    return response.status(200).json(data);
  } catch {
    response.setHeader('Cache-Control', 'no-store');
    return response.status(503).json({ error: 'catalog_unavailable' });
  }
}
