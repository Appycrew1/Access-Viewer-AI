import { NextResponse } from 'next/server'
import { SAMPLE } from '@/lib/sample'
export const dynamic='force-dynamic'
export async function GET(req:Request){
  const code = new URL(req.url).searchParams.get('area_code') || ''
  const a = SAMPLE.areas.find(x=>x.code===code)
  if(!a) return NextResponse.json({ error:'unknown_area' }, { status:404 })
  const competitor_avg_rate = 88.5
  const current_rate = 95
  const recommended_rate = +(current_rate * (a.demand_index/100)).toFixed(1)
  const change_pct = +(((recommended_rate-current_rate)/current_rate)*100).toFixed(1)
  const rationale = a.demand_index>70 ? 'High demand — modest premium sustainable.' : 'Moderate demand — align closer to competitor rates.'
  return NextResponse.json({ area: a, current_rate, competitor_avg_rate, recommended_rate, change_pct, rationale })
}
