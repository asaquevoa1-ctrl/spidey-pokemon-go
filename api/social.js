import { blobStore, socialReady } from '../spidey-app/api/social/store.js';
import { createSocialService } from '../spidey-app/api/social/service.js';
import { BlobError } from '@vercel/blob';
export default async function handler(request,response) {
  response.setHeader('Cache-Control','no-store, private');
  if (request.method === 'GET') return response.status(200).json({ok:true,available:socialReady(),version:'spidey-social-v1',mode:process.env.VERCEL_ENV === 'preview'?'preview':'production'});
  if (request.method !== 'POST') return response.status(405).json({error:'method_not_allowed'});
  const origin = request.headers?.origin;
  if (!origin || origin !== `https://${request.headers.host}` && origin !== 'https://spidey-pokemon-go.vercel.app') return response.status(403).json({error:'origin_denied'});
  if (!String(request.headers['content-type'] || '').startsWith('application/json')) return response.status(415).json({error:'json_required'});
  if (!socialReady()) return response.status(503).json({error:'social_not_configured'});
  try {
    const raw = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    if (!raw || Buffer.byteLength(raw)>16000) return response.status(413).json({error:'request_too_large'});
    const result = await createSocialService(blobStore()).handle(JSON.parse(raw));
    return response.status(200).json(result);
  } catch(error) {
    // Never log request envelopes, profile fields, keys or conversations.
    const type = error instanceof BlobError ? 'BlobError' : ['TypeError','SyntaxError','OperationError','DataError','Error'].includes(error?.name) ? error.name : 'UnexpectedError';
    const status = /Failed to fetch blob: (\d{3})/.exec(error?.message || '')?.[1];
    const reason = status ? `blob_http_${status}` : /private|public/i.test(error?.message || '') ? 'blob_access' : /token/i.test(error?.message || '') ? 'blob_token' : /ETag|Precondition/i.test(error?.message || '') ? 'blob_conflict' : 'unspecified';
    if (!error.status) console.error('social unavailable',type);
    return response.status(error.status || 503).json({error:error.status?error.message:'social_unavailable',
      ...(!error.status && process.env.VERCEL_ENV === 'preview' ? {diagnostic:`${type}:${reason}`} : {})});
  }
}
