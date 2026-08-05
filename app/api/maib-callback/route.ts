// app/api/maib-callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { alertAdmin } from '@/lib/alert'
import { maibClient } from '@/lib/maib'

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Callback endpoint is alive.' })
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    if (!rawBody) {
      return NextResponse.json({ ok: false, error: 'Empty body' }, { status: 400 })
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }

    // ── Signature validation ───────────────────────────────────────────────
    const signatureHeader    = req.headers.get('x-signature') ?? ''
    const signatureTimestamp = req.headers.get('x-signature-timestamp') ?? ''
    const signatureKey       = process.env.MAIB_SIGNATURE_KEY ?? ''

    if (!signatureKey) {
      await alertAdmin('maib-callback: MAIB_SIGNATURE_KEY not set', {})
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    if (!signatureHeader || !signatureTimestamp) {
      console.error('Missing signature headers — rejecting callback')
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    try {
      const { MaibCheckoutSdk } = await import('maib-checkout-sdk')
      const isValid = MaibCheckoutSdk.validateCallbackSignature(
        rawBody,
        signatureHeader,
        signatureTimestamp,
        signatureKey
      )
      if (!isValid) {
        await alertAdmin('maib-callback: signature mismatch — rejected', { checkoutId: data.checkoutId })
        return NextResponse.json({ ok: false }, { status: 400 })
      }
    } catch (sigErr) {
      await alertAdmin('maib-callback: signature validation threw — rejected', {
        error: sigErr instanceof Error ? sigErr.message : String(sigErr),
      })
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // ── Find tickets by checkoutId ─────────────────────────────────────────
    const checkoutId = data.checkoutId as string
    if (!checkoutId) {
      return NextResponse.json({ ok: true })
    }

    const tickets = await sql`
      SELECT
        t.id, t.ticket_type, t.price_mdl, t.handzone, t.satellite_workshop, t.status,
        COALESCE(s.nume, r.nume, n.nume)          AS nume,
        COALESCE(s.prenume, r.prenume, n.prenume) AS prenume,
        COALESCE(s.email, r.email, n.email)       AS email
      FROM tickets t
      LEFT JOIN students  s ON t.student_id  = s.id
      LEFT JOIN residents r ON t.resident_id = r.id
      LEFT JOIN nurses    n ON t.nurse_id    = n.id
      WHERE t.maib_session_id = ${checkoutId}
    `

    if (tickets.length === 0) {
      await alertAdmin('maib-callback: no tickets found for checkoutId', { checkoutId })
      return NextResponse.json({ ok: true })
    }

    // ── Amount sanity check ────────────────────────────────────────────────
    // The signature already proves the bank sent this, so this is not an
    // anti-tamper measure — it catches our own pricing/rounding drift between
    // what we registered and what was actually charged.
    const paidAmount = typeof data.amount === 'number' ? data.amount : Number(data.amount)
    const expectedAmount = tickets.reduce((sum, t) => sum + Number(t.price_mdl), 0)
    if (Number.isFinite(paidAmount) && Math.abs(paidAmount - expectedAmount) > 0.01) {
      await alertAdmin('maib-callback: paid amount differs from ticket total', {
        checkoutId, paidAmount, expectedAmount,
      })
    }

    // ── Update status (idempotent) ─────────────────────────────────────────
    // maib retries callbacks, and a delivered-twice notification must not
    // re-send tickets. Only 'pending' rows transition, so a repeat delivery
    // updates zero rows — and a late failure callback can never flip an
    // already-paid ticket to cancelled.
    const paymentStatus = data.paymentStatus as string
    const isExecuted = paymentStatus === 'Executed'
    const newStatus = isExecuted ? 'paid' : 'cancelled'

    let transitioned = await sql`
      UPDATE tickets SET status = ${newStatus}
      WHERE maib_session_id = ${checkoutId} AND status = 'pending'
      RETURNING id
    `

    // ── Late payment on a released seat ────────────────────────────────────
    // Nothing was pending. Either this is a retry of a callback we already
    // processed, or the checkout sat unpaid past PENDING_TTL_MINUTES, we
    // released its seats, and the customer paid anyway. Releasing a seat is a
    // capacity decision, never a refusal to honour a payment — so when maib
    // says money moved, the ticket is reinstated.
    if (transitioned.length === 0 && isExecuted && !tickets.some(t => t.status === 'paid')) {
      try {
        const { maib, accessToken } = await maibClient()
        const detail = await maib.checkoutDetails(checkoutId, accessToken)
        const payment = (detail as { payment?: { status?: string; refundedAmount?: number } }).payment

        // The bank is the authority on whether this is a live payment. A
        // refunded one must stay cancelled — /api/admin/refund also lands rows
        // in 'cancelled', and this is what tells the two apart.
        const refunded = payment?.status === 'Refunded' || Number(payment?.refundedAmount ?? 0) > 0
        if (payment?.status === 'Executed' && !refunded) {
          transitioned = await sql`
            UPDATE tickets SET status = 'paid'
            WHERE maib_session_id = ${checkoutId} AND status = 'cancelled'
            RETURNING id
          `
          await alertAdmin('maib-callback: paid after seats were released — workshop may be over capacity', {
            checkoutId, reinstated: transitioned.length,
          })
        } else {
          await alertAdmin('maib-callback: no pending tickets and payment is not live — ignored', {
            checkoutId, paymentStatus, maibPaymentStatus: payment?.status ?? null,
          })
        }
      } catch (detailErr) {
        // Could not reach maib to confirm. Never guess in this direction:
        // leave the rows alone and get a human to look.
        await alertAdmin('maib-callback: executed payment with no pending tickets, could not verify with maib', {
          checkoutId,
          error: detailErr instanceof Error ? detailErr.message : String(detailErr),
        })
      }
    }

    if (transitioned.length === 0) {
      console.log(JSON.stringify({
        level: 'info', event: 'maib-callback-duplicate-ignored', checkoutId, paymentStatus,
      }))
      return NextResponse.json({ ok: true })
    }

    // ── Send confirmation emails ───────────────────────────────────────────
    if (newStatus === 'paid') {
      const transitionedIds = new Set(transitioned.map(r => r.id))
      const { transporter, buildTicketEmail } = await import('@/lib/mailer')
      for (const ticket of tickets.filter(t => transitionedIds.has(t.id))) {
        try {
          const ticketData = {
            id: ticket.id, prenume: ticket.prenume, nume: ticket.nume,
            email: ticket.email, ticket_type: ticket.ticket_type,
            price_mdl: ticket.price_mdl, handzone: ticket.handzone,
            satellite_workshop: ticket.satellite_workshop,
          }
          let mailOptions
          try {
            mailOptions = await buildTicketEmail(ticketData)
          } catch (pdfErr) {
            await alertAdmin('maib-callback: PDF generation failed, sending without attachment', {
              ticketId: ticket.id,
              error: pdfErr instanceof Error ? pdfErr.message : String(pdfErr),
            })
            mailOptions = await buildTicketEmail(ticketData, true)
          }
          await transporter.sendMail(mailOptions)
          console.log(JSON.stringify({ level: 'info', event: 'ticket-email-sent', ticketId: ticket.id }))
        } catch (emailErr) {
          await alertAdmin('maib-callback: ticket paid but confirmation email failed to send', {
            ticketId: ticket.id,
            email: ticket.email,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr),
          })
        }
      }
    }

    console.log(JSON.stringify({ level: 'info', event: 'maib-callback-processed', checkoutId, status: newStatus }))
    return NextResponse.json({ ok: true })

  } catch (err) {
    await alertAdmin('maib-callback: unhandled error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ ok: true })
  }
}
