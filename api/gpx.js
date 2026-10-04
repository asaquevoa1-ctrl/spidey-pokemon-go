import { readFileSync } from 'node:fs';
import { rallyGpx } from '../lib/rally-gpx.js';

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  const catalog = JSON.parse(readFileSync(new URL('../spidey-app/data/stamps.json', import.meta.url), 'utf8'));
  const result = rallyGpx(catalog, request.query?.rally);
  if (result.status !== 200) return response.status(result.status).json({ error: result.error });
  response.setHeader('Content-Type', 'application/gpx+xml;charset=utf-8');
  response.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  return response.status(200).send(request.method === 'HEAD' ? '' : result.content);
}
