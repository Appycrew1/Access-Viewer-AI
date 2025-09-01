import { NextResponse } from 'next/server'
import { ADDR_BY_ID } from '@/lib/sample'
export const dynamic='force-dynamic'
export async function GET(req:Request){
  const id = new URL(req.url).searchParams.get('address_id') || ''
  const a = (ADDR_BY_ID as any)[id] || { label:'Unknown' }
  const link = `https://council.example/parking-waiver?address=${encodeURIComponent(a.label)}&date=tbd&vehicle=Luton+van`
  const checklist = [
    { item:'Dynamic risk assessment completed', status:'pending' },
    { item:'Parking/waiver checked', status:'pending' },
    { item:'Lift booked (if applicable)', status:'pending' },
    { item:'Customer confirmed access notes', status:'pending' }
  ]
  return NextResponse.json({ waiver_required: id==='cust_1', waiver_link: link, risk_checklist: checklist })
}
