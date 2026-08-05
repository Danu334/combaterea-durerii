// app/api/admin/refund/route.ts
//
// Protected refund endpoint. Refunds an executed maib payment.
//
//   POST /api/admin/refund
//   Header: x-admin-key: <ADMIN_KEY>
//   Body:   { "checkoutId"?: string, "paymentId"?: string, "amount"?: number, "reason"?: string }
//
// Provide either paymentId directly, or checkoutId (the value stored in
// tickets.maib_session_id) — in which case the payment is resolved via
// checkoutDetails. amount defaults to the full executed amount.
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { alertAdmin } from '@/lib/alert'
import { authorized } from '@/lib/admin-auth'
import { maibClient } from '@/lib/maib'

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  let body: { checkoutId?: string; paymentId?: string; amount?: number; reason?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 })
  }

  const { checkoutId, reason } = body
  let { paymentId, amount } = body

  if (!paymentId && !checkoutId) {
    return NextResponse.json({ ok: false, error: 'Provide paymentId or checkoutId.' }, { status: 400 })
  }

  try {
    const { maib, accessToken } = await maibClient()

    // Resolve paymentId / amount from the checkout if needed.
    if (!paymentId || amount == null) {
      if (!checkoutId) {
        return NextResponse.json({ ok: false, error: 'amount required when only paymentId is given.' }, { status: 400 })
      }
      const detail = await maib.checkoutDetails(checkoutId, accessToken)
      const payment = (detail as { payment?: { paymentId?: string; amount?: number; status?: string } }).payment
      if (!payment?.paymentId) {
        return NextResponse.json({ ok: false, error: 'No executed payment found for this checkout.' }, { status: 404 })
      }
      paymentId = paymentId ?? payment.paymentId
      amount = amount ?? payment.amount
    }

    if (amount == null || !Number.isFinite(amount)) {
      return NextResponse.json({ ok: false, error: 'Could not determine refund amount.' }, { status: 400 })
    }

    const result = await maib.paymentRefund(
      paymentId!,
      { amount, reason: reason ?? 'Refund' },
      accessToken
    )

    // Best-effort: mark related tickets as cancelled. (The tickets.status CHECK
    // constraint allows only pending/paid/cancelled — there is no 'refunded'
    // state without a migration, so we use 'cancelled'.)
    if (checkoutId) {
      try {
        await sql`UPDATE tickets SET status = 'cancelled' WHERE maib_session_id = ${checkoutId}`
      } catch (dbErr) {
        await alertAdmin('refund: maib refund succeeded but ticket status update failed', {
          checkoutId, paymentId,
          error: dbErr instanceof Error ? dbErr.message : String(dbErr),
        })
      }
    }

    console.log(JSON.stringify({ level: 'info', event: 'refund-processed', checkoutId, paymentId, amount }))
    return NextResponse.json({ ok: true, paymentId, amount, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refund failed.'
    await alertAdmin('refund: failed', { checkoutId, paymentId, error: message })
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
}
