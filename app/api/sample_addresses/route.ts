import { NextResponse } from 'next/server'
import { SAMPLE } from '@/lib/sample'
export const runtime='nodejs'
export async function GET(){return NextResponse.json({customers:SAMPLE.addresses,depots:SAMPLE.depots})}
