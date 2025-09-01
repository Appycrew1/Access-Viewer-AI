import { NextResponse } from 'next/server'
export const runtime='nodejs'
export async function GET(){return NextResponse.json({openai:!!process.env.OPENAI_API_KEY,google:!!process.env.GOOGLE_API_KEY})}
