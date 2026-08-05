import { NextResponse } from 'next/server'
import { getWorkshopSeatCounts } from '@/lib/capacity'

export const revalidate = 0

// Occupied seats per workshop, keyed by workshop id — satellite and hands-on
// alike. Read-only: expired pending rows are excluded from the count here, and
// actually released by the cleanup in lib/capacity.ts.
export async function GET() {
  return NextResponse.json(await getWorkshopSeatCounts())
}
