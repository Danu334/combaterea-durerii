// lib/capacity.ts
//
// Workshop seat accounting, in one place.
//
// A ticket row is created as 'pending' *before* the customer is sent to maib.
// Most abandoned checkouts never produce a callback of any kind — the customer
// simply closes the tab — so without an expiry those rows would hold their seat
// forever. With only HANDZONE_CAPACITY seats on a hands-on workshop, a handful
// of abandoned carts is enough to show "Locuri epuizate" on a workshop that is
// actually empty.
//
// So a pending seat is only held for PENDING_TTL_MINUTES. Two things follow
// from that, and both matter:
//
//   1. Counting ignores pending rows older than the window, so availability is
//      correct even if the cleanup below never runs.
//   2. The cleanup marks those rows 'cancelled' so the admin panel reflects
//      reality. Releasing a seat is *not* the same as refusing the payment:
//      if a late payment for an expired row does arrive, the maib callback
//      revives it (see app/api/maib-callback/route.ts). Money taken always
//      produces a ticket.
import { sql } from '@/lib/db'

/** Max participants per hands-on workshop. Mirrored in app/(frontend)/cart/page.tsx. */
export const HANDZONE_CAPACITY = 10

/** Max participants per satellite workshop. Mirrored in app/(frontend)/cart/page.tsx. */
export const SATELLITE_CAPACITY = 30

/**
 * How long an unpaid checkout holds its seat.
 *
 * Long enough to cover a slow card entry plus 3-D Secure on a bad connection,
 * short enough that abandoned carts free up within the same browsing session.
 * Raising it makes phantom sell-outs last longer; lowering it makes late
 * payments more likely to land on a released seat (still honoured, but the
 * workshop can end up one over capacity).
 */
export const PENDING_TTL_MINUTES = 30

/**
 * Seats currently held per workshop id, keyed by id.
 *
 * Satellite ids (y2y, imagistica) and hands-on ids (botulinum, locoregional, …)
 * never collide, so one flat map covers both. A seat is held when the ticket is
 * paid, or pending and still inside the window.
 */
export async function getWorkshopSeatCounts(): Promise<Record<string, number>> {
  const rows = await sql`
    SELECT id, COUNT(*)::int AS count
    FROM (
      SELECT handzone AS id FROM tickets
      WHERE handzone <> 'none'
        AND (status = 'paid' OR (status = 'pending'
             AND created_at > NOW() - make_interval(mins => ${PENDING_TTL_MINUTES})))
      UNION ALL
      SELECT satellite_workshop AS id FROM tickets
      WHERE satellite_workshop <> 'none'
        AND (status = 'paid' OR (status = 'pending'
             AND created_at > NOW() - make_interval(mins => ${PENDING_TTL_MINUTES})))
    ) held
    GROUP BY id`

  const counts: Record<string, number> = {}
  for (const row of rows) counts[row.id] = row.count
  return counts
}

/**
 * Cancels pending tickets whose checkout window has passed.
 *
 * Housekeeping only — getWorkshopSeatCounts() already ignores these rows, so a
 * failure here never blocks or overbooks a registration. Returns how many rows
 * were released.
 */
export async function expireStalePendingTickets(): Promise<number> {
  const rows = await sql`
    UPDATE tickets
    SET status = 'cancelled'
    WHERE status = 'pending'
      AND created_at <= NOW() - make_interval(mins => ${PENDING_TTL_MINUTES})
    RETURNING id`
  return rows.length
}
