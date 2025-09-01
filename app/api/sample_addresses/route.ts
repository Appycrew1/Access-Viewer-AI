import {NextResponse} from 'next/server'
import {SAMPLE} from '@/lib/sample'
export const dynamic='force-dynamic'
export async function GET(){return NextResponse.json({customers:SAMPLE.addresses.map(a=>({id:a.id,label:a.label})),depots:SAMPLE.depots.map(d=>({id:d.id,label:d.label}))})}
