import { createHash, webcrypto } from 'node:crypto';
const { subtle } = webcrypto;
const DAY = 86400000, VERSION = 'spidey-social-v1';
const hexId = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const fail = (code, status = 400) => { throw Object.assign(new Error(code), { status }); };
export const signingPayload = e => JSON.stringify([VERSION,e.action,e.actor,e.ts,e.nonce,e.data]);
export const actorId = key => createHash('sha256').update(`${key.x}.${key.y}`).digest('hex');
export const pairId = (a,b) => createHash('sha256').update([a,b].sort().join(':')).digest('hex');
export function publicKey(key) {
  if (!key || key.kty !== 'EC' || key.crv !== 'P-256' || key.d || ![key.x,key.y].every(x => typeof x === 'string' && /^[A-Za-z0-9_-]{43}$/.test(x))) fail('invalid_key');
  return { kty: 'EC', crv: 'P-256', x: key.x, y: key.y };
}
const codeFor = id => `SPID-${id.slice(0,16).toUpperCase()}`;
const interests = ['pvp','raids','gifts','fly','stamps'];
const countries = ['BR','US','JP','PT','ES','DE','FR','GB','TW','OTHER'];
export function profileFields(data) {
  if (!data || typeof data.nickname !== 'string') fail('invalid_profile');
  const nickname = data.nickname.trim(), region = String(data.region || '').trim(), trainer = String(data.trainer_code || '').replace(/\s/g,'');
  if (nickname.length < 2 || nickname.length > 24 || /[<>\x00-\x1f]/.test(nickname)
    || region.length > 40 || !/^[\p{L}\p{M} .'-]*$/u.test(region) || trainer && !/^\d{12}$/.test(trainer)
    || !countries.includes(data.country) || !Array.isArray(data.interests) || data.interests.length > 5 || data.interests.some(x => !interests.includes(x))) fail('invalid_profile');
  return { nickname, region, country: data.country, trainer_code: trainer, interests: [...new Set(data.interests)], discoverable: data.discoverable === true };
}
function publicProfile(profile, connected = false) {
  return { id: profile.id, code: codeFor(profile.id), nickname: profile.nickname, country: profile.country, region: profile.region,
    interests: profile.interests, expires_at: profile.expires_at, encryption_key: profile.encryption_key,
    ...(connected && profile.trainer_code ? { trainer_code: profile.trainer_code } : {}) };
}
const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const active = (p, now) => p && !p.deleted && !p.disabled && p.expires_at > now;
const recent = (pair, now) => (pair.messages || []).filter(m => m.at > now - 30*DAY).slice(-60);

export function createSocialService(store, clock = () => Date.now()) {
  const readProfile = id => store.read(`profiles/${id}`);
  async function directory(profile) {
    await store.mutate('directory', d => {
      d ||= { profiles: {}, day: '', registrations: 0 };
      for (const [id,p] of Object.entries(d.profiles)) if (p.expires_at <= clock() || p.deleted) delete d.profiles[id];
      if (profile.deleted || profile.disabled) delete d.profiles[profile.id];
      else d.profiles[profile.id] = { ...publicProfile(profile), discoverable: profile.discoverable };
      return d;
    });
  }
  async function authorize(e) {
    const now = clock();
    if (!e || !hexId(e.actor) || !Number.isSafeInteger(e.ts) || Math.abs(now-e.ts) > 5*60000 || !/^[A-Za-z0-9_-]{22}$/.test(e.nonce || '')
      || !/^[A-Za-z0-9_-]{86}$/.test(e.signature || '') || !e.data || typeof e.data !== 'object' || Array.isArray(e.data)) fail('invalid_request');
    const profile = await readProfile(e.actor);
    if (profile?.deleted) fail('profile_deleted',410);
    if (!profile && e.action !== 'register') fail('profile_missing',404);
    const key = publicKey(e.action === 'register' && !profile ? e.data.signing_key : profile?.signing_key);
    if (actorId(key) !== e.actor) fail('unauthorized',401);
    try {
      const imported = await subtle.importKey('jwk',key,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
      if (!await subtle.verify({name:'ECDSA',hash:'SHA-256'},imported,Buffer.from(e.signature,'base64url'),Buffer.from(signingPayload(e)))) fail('unauthorized',401);
    } catch (error) { if (error.status) throw error; fail('unauthorized',401); }
    if (e.action !== 'register' && !profile) fail('profile_missing',404);
    if (profile && !active(profile,now) && !['state','update','renew','remove','deactivate'].includes(e.action)) fail('profile_expired',403);
    return profile;
  }
  async function reserve(e) {
    await store.mutate(`profiles/${e.actor}`, p => {
      if (!p || p.deleted) fail('profile_missing',404);
      p.requests = (p.requests || []).filter(r => r.at > clock()-60000);
      if (p.requests.some(r => r.nonce === e.nonce)) fail('request_already_used',409);
      if (p.requests.length >= 20) fail('slow_down',429);
      p.requests.push({ nonce:e.nonce, at:clock() }); return p;
    });
  }
  async function peer(e) {
    if (!hexId(e.data.peer) || e.data.peer === e.actor) fail('invalid_peer');
    const p = await readProfile(e.data.peer); if (!active(p,clock())) fail('peer_unavailable',404);
    return p;
  }
  async function state(id) {
    const p = await readProfile(id);
    const rows = await Promise.all((p.peers || []).slice(0,50).map(async id => {
      const pair = await store.read(`pairs/${pairId(p.id,id)}`), other = await readProfile(id);
      if (!pair || !other || other.deleted || pair.blocked?.includes(id)) return null;
      return { profile:publicProfile(other,pair.status === 'accepted'), status:pair.status, requested_by:pair.requested_by,
        blocked: pair.blocked?.includes(p.id) || false, available:active(other,clock()) };
    }));
    return { profile:{...publicProfile(p,true),discoverable:p.discoverable,disabled:p.disabled || false,active:active(p,clock())}, connections:rows.filter(Boolean) };
  }
  async function handle(e) {
    let owner = await authorize(e); const now = clock(), data = e.data;
    if (e.action === 'register') {
      if (data.consent !== true) fail('consent_required');
      if (owner) return state(e.actor);
      const fields = profileFields(data), signing_key = publicKey(data.signing_key), encryption_key = publicKey(data.encryption_key);
      await subtle.importKey('jwk',encryption_key,{name:'ECDH',namedCurve:'P-256'},false,[]);
      // Aggregate registration limits; no IP, user-agent, email or GPS records.
      await store.mutate('directory', d => {
        d ||= {profiles:{},day:'',registrations:0}; const day = new Date(now).toISOString().slice(0,10);
        if(d.day !== day) {d.day=day;d.registrations=0;}
        for (const [id,p] of Object.entries(d.profiles)) if (p.expires_at <= now) delete d.profiles[id];
        if (d.registrations >= 1000 || Object.keys(d.profiles).length >= 5000) fail('registration_busy',429);
        d.registrations++; return d;
      });
      owner = await store.mutate(`profiles/${e.actor}`, p => p || {id:e.actor,...fields,signing_key,encryption_key,created_at:now,expires_at:now+30*DAY,peers:[]});
      await directory(owner); return state(e.actor);
    }
    if (e.action === 'state') return state(e.actor);
    if (e.action === 'search') {
      const d = await store.read('directory'), query = normalize(data.query).slice(0,40);
      return { profiles:Object.values(d?.profiles || {}).filter(p => p.id !== e.actor && p.discoverable && p.expires_at > now
        && (!query || normalize(p.nickname).includes(query)) && (!data.country || p.country === data.country)
        && (!data.interest || p.interests.includes(data.interest))).slice(0,30).map(({discoverable,...p})=>p) };
    }
    if (e.action === 'messages') {
      const other = await peer(e), pair = await store.read(`pairs/${pairId(e.actor,other.id)}`);
      if (!pair || pair.status !== 'accepted' || pair.blocked?.length) fail('connection_required',403);
      const messages = recent(pair,now);
      if (messages.length !== (pair.messages || []).length) await store.mutate(`pairs/${pairId(e.actor,other.id)}`,p=>({...p,messages:recent(p,clock())}));
      return {peer:publicProfile(other,true),messages};
    }
    if (!['update','renew','request','accept','reject','send','block','unblock','report','deactivate','remove'].includes(e.action)) fail('unknown_action');
    await reserve(e);
    if (['update','renew','deactivate'].includes(e.action)) {
      owner = await store.mutate(`profiles/${e.actor}`, p => {
        if (e.action === 'update') Object.assign(p,profileFields(data));
        if (e.action === 'deactivate') p.disabled = true;
        else {p.disabled=false;p.expires_at=now+30*DAY;}
        return p;
      }); await directory(owner); return state(e.actor);
    }
    if (e.action === 'remove') {
      for (const id of owner.peers || []) await store.mutate(`pairs/${pairId(e.actor,id)}`, p => p ? {...p,status:'removed',messages:[],blocked:[e.actor]} : undefined);
      const tombstone = await store.mutate(`profiles/${e.actor}`, p => ({id:p.id,signing_key:p.signing_key,deleted:true,expires_at:now}));
      await directory(tombstone); return {removed:true};
    }
    if (e.action === 'request' && !data.peer) {
      const code = String(data.code || '').trim().toUpperCase();
      if (!/^SPID-[A-F0-9]{16}$/.test(code)) fail('invalid_code');
      const d = await store.read('directory'), match = Object.values(d?.profiles || {}).find(p=>p.code===code && p.expires_at>now);
      if (!match) fail('peer_unavailable',404); data.peer = match.id;
    }
    const other = await peer(e), key = `pairs/${pairId(e.actor,other.id)}`;
    if (e.action === 'report') {
      if (!['abuse','spam','unsafe'].includes(data.reason)) fail('invalid_report');
      const pair = await store.read(key); if (!pair) fail('connection_required',403);
      await store.mutate(`reports/${e.actor}`, r => ({reports:[...(r?.reports || []).filter(x=>x.at>now-30*DAY).slice(-19),
        {by:e.actor,target:other.id,reason:data.reason,at:now}]}));
      await store.mutate(key,p=>({...p,blocked:[...new Set([...(p.blocked || []),e.actor])]}));
      return {reported:true,...await state(e.actor)};
    }
    const pair = await store.mutate(key,p => {
      if (e.action === 'request') {
        if (p?.blocked?.length) fail('peer_unavailable',403);
        if (p?.status === 'accepted' || p?.status === 'pending') return p;
        if (p?.updated_at > now-DAY) fail('request_cooldown',429);
        return {members:[e.actor,other.id].sort(),status:'pending',requested_by:e.actor,updated_at:now,messages:[],blocked:[]};
      }
      if (!p) fail('connection_required',403);
      if (e.action === 'block') { p.blocked=[...new Set([...(p.blocked || []),e.actor])]; return p; }
      if (e.action === 'unblock') { p.blocked=(p.blocked || []).filter(id=>id!==e.actor); return p; }
      if (p.blocked?.length) fail('peer_unavailable',403);
      if (['accept','reject'].includes(e.action)) {
        if (p.status !== 'pending' || p.requested_by === e.actor) fail('recipient_only',403);
        p.status=e.action==='accept'?'accepted':'rejected';p.updated_at=now;return p;
      }
      if (e.action === 'send') {
        if (p.status !== 'accepted') fail('connection_required',403);
        if (!/^[a-f0-9]{32}$/.test(data.message_id || '') || !/^[A-Za-z0-9_-]{16}$/.test(data.iv || '')
          || typeof data.ciphertext !== 'string' || !/^[A-Za-z0-9_-]{24,5600}$/.test(data.ciphertext)) fail('invalid_message');
        p.messages=recent(p,now);
        if(p.messages.some(m=>m.id===data.message_id)) return p;
        if(p.messages.filter(m=>m.from===e.actor && m.at>now-60000).length >= 15) fail('slow_down',429);
        p.messages.push({id:data.message_id,from:e.actor,to:other.id,at:now,iv:data.iv,ciphertext:data.ciphertext});
        p.messages=p.messages.slice(-60); return p;
      }
      fail('unknown_action');
    });
    if (e.action === 'request') {
      for (const [id,friend] of [[e.actor,other.id],[other.id,e.actor]]) await store.mutate(`profiles/${id}`,p => {
        if ((p.peers || []).includes(friend)) return p;
        if (p.peers.length >= 50) fail('connection_limit',409);
        p.peers.push(friend);return p;
      });
    }
    return e.action === 'send' ? {messages:recent(pair,now)} : state(e.actor);
  }
  return {handle};
}
