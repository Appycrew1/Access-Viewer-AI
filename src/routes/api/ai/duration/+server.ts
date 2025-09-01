
import type { RequestHandler } from '@sveltejs/kit';
export const POST:RequestHandler = async ({ request }) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if(!OPENAI_API_KEY) return new Response(JSON.stringify({ error:'missing_openai_key' }), { status:400 });
  const payload = await request.json().catch(()=>({}));
  const user = JSON.stringify(payload?.context||{});
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${OPENAI_API_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ model:OPENAI_MODEL, temperature:0.2, response_format:{type:'json_object'}, messages:[{role:'system',content:`You are an expert ops assistant for a moving company. Return STRICT JSON for duration: estimated_minutes, confidence_pct, breakdown.`},{role:'user',content:user}] })
  });
  const j = await r.json();
  const content = j.choices?.[0]?.message?.content;
  try{ return new Response(content, { headers:{'content-type':'application/json'} }) }catch{ return new Response(JSON.stringify({ error:'openai_bad_json', raw:j }), { status:502 }) }
};
