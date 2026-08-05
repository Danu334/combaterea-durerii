// app/api/admin/expire-pending/route.ts
//
// Releases seats held by abandoned checkouts.
//
//   POST /api/admin/expire-pending
//   Header: x-admin-key: <ADMIN_KEY>
//
// /api/register runs the same cleanup opportunistically, so this exists for the
// quiet stretches — overnight, or after a burst of abandoned carts with no new
// registrations behind them to trigger it. Availability shown to customers is
// already correct without it (lib/capacity.ts ignores expired rows when
// counting); this is what makes the ticket rows themselves reflect reality.
//
// Safe to call repeatedly, and safe to wire to a scheduler.
import { NextRequest, NextResponse } from 'next/server'
import { authorized } from '@/lib/admin-auth'
import { PENDING_TTL_MINUTES, expireStalePendingTickets } from '@/lib/capacity'

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const released = await expireStalePendingTickets()
    console.log(JSON.stringify({ level: 'info', event: 'pending-tickets-expired', released }))
    return NextResponse.json({ ok: true, released, olderThanMinutes: PENDING_TTL_MINUTES })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
}
