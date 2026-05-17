import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS satellite_workshop TEXT NOT NULL DEFAULT 'none'`
    return NextResponse.json({ ok: true, message: 'Migration done: satellite_workshop column added' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}