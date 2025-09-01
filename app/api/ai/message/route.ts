import { NextResponse } from 'next/server'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
export const dynamic='force-dynamic'
export async function POST(req:Request){
  const payload = await req.json().catch(()=>({}))
  const context = payload?.context || {}
  const mock = {
  "channels": [
    "Email",
    "SMS"
  ],
  "templates": {
    "email_confirm": {
      "subject": "Booking confirmation \u2014 {move_date}",
      "body": "Hi {first_name},\\nYour booking for {move_date} is confirmed. Crew of {crew_size} arriving at {arrival_window}..."
    },
    "sms_eta": "Hi {first_name}, your movers are on the way. ETA {eta}."
  },
  "tone_options": [
    "Professional",
    "Friendly",
    "Concise"
  ]
}
  if(!OPENAI_API_KEY) return NextResponse.json({ source:'mock', ...mock })
  const sys = `You are an expert operations assistant for a London moving company. Return STRICT JSON for the message task.`
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
