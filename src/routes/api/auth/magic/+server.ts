
import type { RequestHandler } from '@sveltejs/kit';
import { signJWT } from '@/lib/server/jwt';

export const POST: RequestHandler = async ({ request, url }) => {
  const body = await request.json().catch(()=>({}));
  const email = body?.email || 'user@example.com';
  const secret = process.env.APP_SECRET || 'dev-secret';
  const token = await signJWT({ sub: email, email }, secret, 3600);
  const callback = new URL('/auth/callback', url);
  callback.searchParams.set('token', token);
  return new Response(JSON.stringify({ dev_link: callback.toString() }), { headers:{'content-type':'application/json'} });
};
