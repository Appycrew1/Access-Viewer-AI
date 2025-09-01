import { NextResponse } from 'next/server'
import { ADDR_BY_ID, DEPOT_BY_ID, sandboxGeocode } from '@/lib/sample'
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
export const dynamic='force-dynamic'
export async function POST(req:Request){
  const b = await req.json().catch(()=>({} as any))
  const { customer_address_id, depot_id, customer_address_text, depot_address_text } = b||{}

  if(customer_address_id && depot_id){
    const o = DEPOT_BY_ID[depot_id]; const d = ADDR_BY_ID[customer_address_id]
    if(!o || !d) return NextResponse.json({error:'unknown origin/dest'},{status:400})
    return NextResponse.json({ origin:o, dest:d, mode:'mock_ids' })
  }

  if(customer_address_text && depot_address_text){
    if(GOOGLE_API_KEY){
      try{
        const g = 'https://maps.googleapis.com/maps/api/geocode/json'
        const rs = await fetch(`${g}?address=${encodeURIComponent(depot_address_text)}&key=${GOOGLE_API_KEY}`)
        const rc = await fetch(`${g}?address=${encodeURIComponent(customer_address_text)}&key=${GOOGLE_API_KEY}`)
        const o = await rs.json(), d = await rc.json()
        if(o.status==='OK' && d.status==='OK'){
          const oo=o.results[0], dd=d.results[0]
          return NextResponse.json({ origin:{id:'live_origin',label:oo.formatted_address,lat:oo.geometry.location.lat,lng:oo.geometry.location.lng}, dest:{id:'live_dest',label:dd.formatted_address,lat:dd.geometry.location.lat,lng:dd.geometry.location.lng}, mode:'live_text' })
        }
      }catch{ /* fall back */ }
    }
    return NextResponse.json({ origin:sandboxGeocode(depot_address_text,51.472,-0.142), dest:sandboxGeocode(customer_address_text,51.515,-0.141), mode:'sandbox_text' })
  }

  return NextResponse.json({ error:'invalid_payload', hint:'Use mock IDs or free-text addresses.' }, {status:400})
}
