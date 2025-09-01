import { NextResponse } from 'next/server'
export const dynamic='force-dynamic'
const hazards:Record<string,any> = {
  cust_1:{ width_restriction:'2.0m (mock)', low_bridge:null, one_way:true, steep_gradient:false, crime_risk:'Medium' },
  cust_2:{ width_restriction:null, low_bridge:null, one_way:false, steep_gradient:false, crime_risk:'Low' },
  cust_3:{ width_restriction:'2.4m (estate gate) (mock)', low_bridge:null, one_way:true, steep_gradient:false, crime_risk:'Low' }
}
export async function GET(req:Request){
  const id = new URL(req.url).searchParams.get('address_id') || ''
  return NextResponse.json(hazards[id] ?? { width_restriction:null, low_bridge:null, one_way:null, steep_gradient:null, crime_risk:null })
}
