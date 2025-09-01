import {NextResponse} from 'next/server'
export const dynamic='force-dynamic'
const meta={cust_1:{floors:3,lift:false,door_width_cm:85,stair_width_cm:90,rear_access:false},cust_2:{floors:4,lift:false,door_width_cm:80,stair_width_cm:85,rear_access:false},cust_3:{floors:50,lift:true,door_width_cm:90,stair_width_cm:110,rear_access:true}};
export async function GET(req){const id=new URL(req.url).searchParams.get('address_id')||''; return NextResponse.json(meta[id]??{floors:null,lift:null,door_width_cm:null,stair_width_cm:null,rear_access:null}) }
