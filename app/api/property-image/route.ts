import { NextResponse } from 'next/server'
import { ADDR_BY_ID } from '@/lib/sample'
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
export const dynamic='force-dynamic'
export async function GET(req:Request){
  const u = new URL(req.url)
  const id = u.searchParams.get('address_id')
  const lat = u.searchParams.get('lat')
  const lng = u.searchParams.get('lng')

  if(id){
    const a = ADDR_BY_ID[id as keyof typeof ADDR_BY_ID]
    if(!a) return NextResponse.json({error:'unknown address'},{status:400})
    if(GOOGLE_API_KEY){
      return NextResponse.json({
        image_url:`https://maps.googleapis.com/maps/api/streetview?size=640x360&location=${a.lat},${a.lng}&key=${GOOGLE_API_KEY}`,
        satellite_url:`https://maps.googleapis.com/maps/api/staticmap?center=${a.lat},${a.lng}&zoom=18&size=320x180&maptype=satellite&key=${GOOGLE_API_KEY}`,
        type_guess:a.type_guess, source:'live_if_available'
      })
    }
    return NextResponse.json({ image_url:a.image_url, satellite_url:a.satellite_url, type_guess:a.type_guess, source:'mock' })
  }

  if(lat && lng){
    if(GOOGLE_API_KEY){
      return NextResponse.json({
        image_url:`https://maps.googleapis.com/maps/api/streetview?size=640x360&location=${lat},${lng}&key=${GOOGLE_API_KEY}`,
        satellite_url:`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=320x180&maptype=satellite&key=${GOOGLE_API_KEY}`,
        type_guess:null, source:'live'
      })
    }
    return NextResponse.json({ image_url:'https://placehold.co/640x360?text=Street+View+Sandbox', satellite_url:'https://placehold.co/320x180?text=Satellite+Sandbox', type_guess:null, source:'sandbox' })
  }

  return NextResponse.json({error:'missing_params'},{status:400})
}
