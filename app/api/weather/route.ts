import { NextResponse } from 'next/server'
export const dynamic='force-dynamic'
export async function GET(req:Request){
  const u = new URL(req.url); const lat = u.searchParams.get('lat'); const lng = u.searchParams.get('lng')
  if(!lat||!lng) return NextResponse.json({error:'missing_params'},{status:400})
  try{
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation,wind_speed_10m&current_weather=true`, { cache:'no-store' })
    const j = await r.json(); const cw = j.current_weather||{}
    const temp = cw.temperature, wind = cw.windspeed
    const cond = ([0,1].includes(cw.weathercode)) ? 'Clear' : 'Cloudy'
    const precip = cond==='Clear' ? 10 : 50
    return NextResponse.json({ date:new Date().toISOString().slice(0,10), condition:cond, temp_c:temp, wind_kmh:wind, precip_chance_pct:precip, impact:[], source:'live' })
  }catch{
    const options=['Clear','Partly Cloudy','Cloudy','Light Rain','Heavy Rain','Windy']
    const cond=options[Math.floor(Math.random()*options.length)]
    const temp=+(8+Math.random()*16).toFixed(1)
    const wind=+(5+Math.random()*23).toFixed(1)
    const precip=cond.includes('Rain')?70:(cond==='Cloudy'?20:5)
    const impact:string[]=[]; if(cond.includes('Rain')) impact.push('Protect fabrics; allow extra loading time.'); if(wind>20) impact.push('High wind: secure items; use extra straps.')
    return NextResponse.json({ date:new Date().toISOString().slice(0,10), condition:cond, temp_c:temp, wind_kmh:wind, precip_chance_pct:precip, impact, source:'sandbox' })
  }
}
