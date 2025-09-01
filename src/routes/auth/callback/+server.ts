
import type { RequestHandler } from '@sveltejs/kit';
import { verifyJWT } from '@/lib/server/jwt';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const token = url.searchParams.get('token');
  if(!token) return new Response('missing token', { status: 400 });
  const secret = process.env.APP_SECRET || 'dev-secret';
  const payload = await verifyJWT(token, secret).catch(()=>null);
  if(!payload) return new Response('invalid token', { status: 400 });
  cookies.set('sid', token, { path:'/', httpOnly:true, sameSite:'lax', secure: true, maxAge: 60*60 });
  return new Response(null, { status:302, headers:{ Location: '/org' } });
};
