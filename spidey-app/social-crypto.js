const VERSION = 'spidey-social-v1', utf8 = new TextEncoder();
const subtle = () => globalThis.crypto.subtle;
export const base64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const bytes64 = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export const randomHex = () => Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
export async function createIdentity() {
  const sign = await subtle().generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
  const encrypt = await subtle().generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);
  const signing_key = await subtle().exportKey('jwk',sign.publicKey), encryption_key = await subtle().exportKey('jwk',encrypt.publicKey);
  const hash = await subtle().digest('SHA-256',utf8.encode(`${signing_key.x}.${signing_key.y}`));
  const id = Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  return {id,signing_key,encryption_key,signPrivate:sign.privateKey,encryptPrivate:encrypt.privateKey};
}
export async function envelope(identity,action,data,ts = Date.now()) {
  const e = {action,actor:identity.id,ts,nonce:base64(crypto.getRandomValues(new Uint8Array(16))),data};
  e.signature = base64(await subtle().sign({name:'ECDSA',hash:'SHA-256'},identity.signPrivate,utf8.encode(JSON.stringify([VERSION,e.action,e.actor,e.ts,e.nonce,e.data]))));
  return e;
}
async function conversationKey(identity,peer) {
  const key = await subtle().importKey('jwk',peer.encryption_key,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const bits = await subtle().deriveBits({name:'ECDH',public:key},identity.encryptPrivate,256);
  const material = await subtle().importKey('raw',bits,'HKDF',false,['deriveKey']);
  const pair = [identity.id,peer.id].sort().join(':');
  return subtle().deriveKey({name:'HKDF',hash:'SHA-256',salt:utf8.encode(pair),info:utf8.encode(`${VERSION}:chat`)},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
const aad = (a,b,id) => utf8.encode(`${VERSION}:${[a,b].sort().join(':')}:${id}`);
export function validMessage(text) {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= 1000 && !/(?:https?:\/\/|www\.|\b[\p{L}\d-]+\.(?:com|net|org|io|app|gg|br)\b)/iu.test(text);
}
export async function encryptMessage(identity,peer,text) {
  if (!validMessage(text)) throw Error('message_text_invalid');
  const message_id = randomHex(), iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await subtle().encrypt({name:'AES-GCM',iv,additionalData:aad(identity.id,peer.id,message_id)},await conversationKey(identity,peer),utf8.encode(JSON.stringify({text:text.trim(),id:message_id,from:identity.id,to:peer.id})));
  return {peer:peer.id,message_id,iv:base64(iv),ciphertext:base64(ciphertext)};
}
export async function decryptMessage(identity,peer,message) {
  if (![identity.id,peer.id].includes(message.from) || ![identity.id,peer.id].includes(message.to) || message.from === message.to) throw Error('message_invalid');
  const raw = await subtle().decrypt({name:'AES-GCM',iv:bytes64(message.iv),additionalData:aad(identity.id,peer.id,message.id)},await conversationKey(identity,peer),bytes64(message.ciphertext));
  const data = JSON.parse(new TextDecoder().decode(raw));
  if (data.id !== message.id || data.from !== message.from || data.to !== message.to || typeof data.text !== 'string' || data.text.length > 1000) throw Error('message_invalid');
  return data.text;
}
export async function identityStore(value) {
  const db = await new Promise((resolve,reject) => {
    const req = indexedDB.open('spidey-social-identity',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('identity');
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
  try { return await new Promise((resolve,reject) => {
    const tx = db.transaction('identity',value === undefined?'readonly':'readwrite'), store = tx.objectStore('identity');
    const req = value === undefined ? store.get('current') : value === null ? store.delete('current') : store.put(value,'current');
    req.onsuccess=()=>{ if(value === undefined)resolve(req.result || null); };
    tx.oncomplete=()=>resolve(value); tx.onerror=()=>reject(tx.error); tx.onabort=()=>reject(tx.error);
  }); } finally {db.close();}
}
