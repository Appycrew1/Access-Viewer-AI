import { NextResponse } from 'next/server'
import { SAMPLE } from '@/lib/sample'
export const dynamic='force-dynamic'
export async function GET(){ const features=SAMPLE.areas.map(a=>({type:'Feature',properties:{code:a.code,name:a.name,demand_index:a.demand_index},geometry:{type:'Point',coordinates:[a.centroid[1],a.centroid[0]]}})); return NextResponse.json({ type:'FeatureCollection', features }) }
