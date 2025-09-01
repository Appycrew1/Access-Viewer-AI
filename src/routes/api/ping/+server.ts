import type { RequestHandler } from '@sveltejs/kit'; export const GET:RequestHandler=async()=>new Response(JSON.stringify({ok:true,ts:Date.now()}),{headers:{'content-type':'application/json'}})
