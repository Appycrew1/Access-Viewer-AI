
// Minimal HS256 JWT using Web Crypto
const enc = new TextEncoder();
function b64url(a: ArrayBuffer){ return Buffer.from(a).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
function b64urlStr(s:string){ return b64url(Buffer.from(s)); }

export async function signJWT(payload:any, secret:string, expSeconds=3600){
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now()/1000);
  const body = { ...payload, iat: now, exp: now+expSeconds };
  const unsigned = `${b64urlStr(JSON.stringify(header))}.${b64urlStr(JSON.stringify(body))}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(unsigned));
  return `${unsigned}.${b64url(sig)}`;
}

export async function verifyJWT(token:string, secret:string){
  const [h,p,s] = token.split('.');
  if(!h||!p||!s) return null;
  const unsigned = `${h}.${p}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned));
  const ok = b64url(sig) === s;
  if(!ok) return null;
  const payload = JSON.parse(Buffer.from(p.replace(/-/g,'+').replace(/_/g,'/'),'base64').toString('utf8'));
  if(payload.exp && Math.floor(Date.now()/1000) > payload.exp) return null;
  return payload;
}
