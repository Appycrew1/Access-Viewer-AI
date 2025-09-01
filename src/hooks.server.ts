
import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '@/lib/server/jwt';

export const handle: Handle = async ({ event, resolve }) => {
  // Read cookies
  const sid = event.cookies.get('sid');
  const oid = event.cookies.get('org');
  event.locals.user = null;
  event.locals.org = null;

  const secret = process.env.APP_SECRET || 'dev-secret';
  if(sid){
    const payload = await verifyJWT(sid, secret).catch(()=>null);
    if(payload && payload.sub){
      event.locals.user = { id: payload.sub, email: payload.email || 'unknown@example.com' };
    }
  }
  if(oid){
    try{
      const seed = JSON.parse(process.env.ORG_SEED || '[]');
      const org = seed.find((o:any)=>o.id===oid);
      if(org) event.locals.org = org;
    }catch{}
  }

  // Protect app routes (everything except /login and /api/public/ and root APIs)
  const unprotected = [
    '/', '/login', '/auth/callback', '/api/env-status', '/api/ping',
    '/api/auth/magic', '/api/auth/devlink', '/api/sample_addresses'
  ];
  if(!event.locals.user && !unprotected.includes(event.url.pathname) && !event.url.pathname.startsWith('/api/public')){
    return new Response(null, { status: 302, headers: { Location: '/login' } });
  }
  return resolve(event);
};
