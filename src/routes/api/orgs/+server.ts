
import type { RequestHandler } from '@sveltejs/kit';
export const GET:RequestHandler = async ({ locals }) => {
  const seed = JSON.parse(process.env.ORG_SEED || '[]');
  return new Response(JSON.stringify({ orgs: seed, current: locals.org?.id || null }), { headers:{'content-type':'application/json'} });
};
export const POST:RequestHandler = async ({ request, cookies }) => {
  const b = await request.json().catch(()=>({}));
  const id = b?.id;
  const seed = JSON.parse(process.env.ORG_SEED || '[]');
  const found = seed.find((o:any)=>o.id===id);
  if(!found) return new Response(JSON.stringify({ error:'unknown_org' }), { status:400 });
  cookies.set('org', id, { path:'/', httpOnly:true, sameSite:'lax', secure:true, maxAge:60*60*24*7 });
  return new Response(JSON.stringify({ ok:true }));
};
