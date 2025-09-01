import { NextResponse } from 'next/server'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
export const dynamic='force-dynamic'
export async function POST(req:Request){
  const payload = await req.json().catch(()=>({}))
  const context = payload?.context || {}
  const mock = {
    pricing:{ current_rate:95, competitor_avg_rate:88.5, recommended_rate:89.6, change_pct:-5.7, rationale:'High demand and/or lower competition allows a premium; aligned towards competitor average.' },
    competitor_watch:[ { name:'FastMove Ltd', coverage_overlap:'72%', price_index:0.94, trend:'flat' }, { name:'City Movers', coverage_overlap:'41%', price_index:1.02, trend:'down' } ],
    lead_score:{ score:78, drivers:['Within 6km of depot','Stairs visible (longer job)','Weather fair','Parking waiver likely'] },
    marketing:{ channels:['Google Ads LSAs','Meta local radius','Nextdoor neighbourhoods'], copy:'Trusted Battersea movers — fixed pricing, insured crews. Book a free video survey today.' }
  }
  if(!OPENAI_API_KEY){ return NextResponse.json({ source:'mock', ...mock }) }
  const sys = `You are an expert operations analyst for a London moving company. Given context (origin/dest, parking, building, safety, weather), produce concise JSON with keys: pricing, competitor_watch, lead_score, marketing.`
  const user = JSON.stringify(context)
  try{
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${OPENAI_API_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ model:OPENAI_MODEL, temperature:0.2, messages:[ {role:'system', content:sys}, {role:'user', content:user} ], response_format:{type:'json_object'} })
    })
    const j = await r.json(); const content = j.choices?.[0]?.message?.content
    try{ return NextResponse.json(JSON.parse(content)) }catch{ return NextResponse.json({ source:'mock_fallback', ...mock }) }
  }catch{ return NextResponse.json({ source:'mock_error', ...mock }) }
}
