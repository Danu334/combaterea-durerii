import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const revalidate = 0

export async function GET() {
  const rows = await sql`
    SELECT satellite_workshop, COUNT(*)::int AS count
    FROM tickets
    WHERE satellite_workshop != 'none'
      AND status IN ('pending', 'paid')
    GROUP BY satellite_workshop
  `

  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.satellite_workshop] = row.count
  }

  return NextResponse.json(counts)
}
