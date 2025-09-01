import { NextResponse } from 'next/server'
import { SAMPLE } from '@/lib/sample'
export const dynamic='force-dynamic'
export async function GET(){ return NextResponse.json({ areas: SAMPLE.areas }) }
