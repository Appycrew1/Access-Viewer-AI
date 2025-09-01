import { NextResponse } from 'next/server'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
export const dynamic='force-dynamic'
export async function POST(req:Request){
  const payload = await req.json().catch(()=>({}))
  const context = payload?.context || {}
  const mock = {
  "crew_size": 3,
  "vehicle": "Luton van with tail-lift",
  "equipment": [
    "dollies",
    "blankets",
    "straps",
    "ramps"
  ],
  "shift_notes": [
    "Start 08:00",
    "Book lift at destination",
    "Parking waiver for 09:00\u201311:00"
  ]
}
  if(!OPENAI_API_KEY) return NextResponse.json({ source:'mock', ...mock })
  const sys = `You are an expert operations assistant for a London moving company. Return STRICT JSON for the crew task.`
  const user = JSON.stringify(context)
  try{
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${OPENAI_API_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({
        model: OPENAI_MODEL, temperature:0.2,
        response_format:{type:'json_object'},
        messages:[
          { role:'system', content: sys },
          { role:'user', content: user }
        ]
      })
    })
    const j = await r.json()
    const content = j.choices?.[0]?.message?.content
    try{ return NextResponse.json(JSON.parse(content)) }catch{ return NextResponse.json({ source:'mock_fallback', ...mock }) }
  }catch(e){
    return NextResponse.json({ source:'mock_error', ...mock })
  }
}
