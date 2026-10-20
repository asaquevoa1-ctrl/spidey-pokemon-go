// Only ingest a feed whose provider explicitly licensed display/redistribution.
// No scraping, trainer identifiers, private DMs or invented sightings.
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const CONTRACT='spidey-hunter-feed-v1';
const MAX_AGE=7*60_000,MAX_EXPIRY=30*60_000,MAX_REPORT_AGE=30*60_000;
function timestamp(x){
  if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(x))return NaN;
  const t=Date.parse(x);return Number.isFinite(t)?t:NaN;
}
function coords(text){
  const m=/^([+-]?\d+(?:\.\d{1,12})?),\s*([+-]?\d+(?:\.\d{1,12})?)$/.exec(String(text||'').trim());
  if(!m)return null;
  const lat=Number(m[1]),lng=Number(m[2]);
  return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?m[1]+','+m[2]:null;
}
export function normalizeFeed(input,{now=Date.now(),providerName}={}){
  if(typeof providerName!=='string'||!/^[\p{L}\p{N} ._()-]{2,60}$/u.test(providerName))throw Error('invalid_provider_attribution');
  if(!input||input.schema!==CONTRACT||input.source_status!=='connected'||!Array.isArray(input.items)||input.items.length>1000)
    throw Error('invalid_feed_contract');
  const generated=timestamp(input.generated_at);
  if(!Number.isFinite(generated)||generated>now+60_000||now-generated>MAX_AGE)throw Error('feed_is_stale_or_from_future');
  const entries=[],seen=new Set();
  for(const raw of input.items){
    if(!raw||typeof raw!=='object')continue;
    if(typeof raw.pokemon!=='string'||!/^[\p{L}\p{N} .:'’♀♂-]{1,48}$/u.test(raw.pokemon))continue;
    const coordinates=coords(raw.coordinates);
    const report=timestamp(raw.reported_at),expiry=timestamp(raw.expires_at);
    if(!coordinates||!Number.isFinite(report)||!Number.isFinite(expiry))continue;
    if(report>now+60_000||now-report>MAX_REPORT_AGE||expiry<=now||expiry>now+MAX_EXPIRY||expiry<=report)continue;
    const iv_percent=raw.iv_percent===100||raw.iv_percent===0?raw.iv_percent:null;
    const pvp_rank=Number.isInteger(raw.pvp_rank)&&raw.pvp_rank>=1&&raw.pvp_rank<=4096?raw.pvp_rank:null;
    const shiny_eligible=raw.shiny_eligible===true;
    if(iv_percent===null&&pvp_rank===null&&!shiny_eligible)continue;
    const pokemon=raw.pokemon.trim();
    const id=pokemon.toLowerCase()+'|'+coordinates+'|'+String(iv_percent)+'|'+String(pvp_rank);
    if(seen.has(id))continue;seen.add(id);
    entries.push({
      pokemon,iv_percent,
      cp:Number.isInteger(raw.cp)&&raw.cp>=1&&raw.cp<=10000?raw.cp:null,
      level:Number.isInteger(raw.level)&&raw.level>=1&&raw.level<=50?raw.level:null,
      gender:raw.gender==='Macho'||raw.gender==='Fêmea'?raw.gender:null,
      coordinates,reported_at:new Date(report).toISOString(),expires_at:new Date(expiry).toISOString(),
      source:providerName,pvp_rank,shiny_eligible
    });
  }
  entries.sort((a,b)=>a.expires_at.localeCompare(b.expires_at));
  return {schema:CONTRACT,source_status:'connected',generated_at:new Date(generated).toISOString(),items:entries.slice(0,300)};
}
export async function importLicensedFeed({url,token,providerName,licenseApproved,output='spidey-app/data/hunter-feed.json'}={}){
  if(licenseApproved!==true)throw Error('provider_license_not_approved');
  if(!url||typeof url!=='string')throw Error('missing_provider_feed_url');
  const location=new URL(url);
  if(location.protocol!=='https:'||location.username||location.password||(location.port&&location.port!=='443')
     ||location.hostname==='localhost'||location.hostname.endsWith('.local')||location.hostname.endsWith('.internal')
     ||/^(?:\d{1,3}\.){3}\d{1,3}$/.test(location.hostname)||location.hostname.includes(':'))
     throw Error('https_public_provider_only');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12_000);
  let response;
  try{
    response=await fetch(location,{signal:controller.signal,redirect:'error',cache:'no-store',
      headers:{'Accept':'application/json',...(token?{'Authorization':'Bearer '+token}:{})}});
  }finally{clearTimeout(timeout);}
  if(!response.ok)throw Error('provider_http_'+response.status);
  const body=await response.arrayBuffer();
  if(body.byteLength>1024*1024)throw Error('provider_response_too_large');
  const feed=normalizeFeed(JSON.parse(new TextDecoder().decode(body)),{providerName});
  await writeFile(output,JSON.stringify(feed,null,2)+'\n','utf8');
  // Never print provider URL, token, account identifiers or raw records.
  process.stdout.write(JSON.stringify({status:'ingested',items:feed.items.length,generated_at:feed.generated_at})+'\n');
  return feed;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  importLicensedFeed({
    url:process.env.HUNTER_PROVIDER_FEED_URL,
    token:process.env.HUNTER_PROVIDER_BEARER_TOKEN,
    providerName:process.env.HUNTER_PROVIDER_NAME,
    licenseApproved:process.env.HUNTER_FEED_LICENSE_APPROVED==='true'
  }).catch(e=>{console.error('Hunter import blocked:',e.message);process.exitCode=1;});
}