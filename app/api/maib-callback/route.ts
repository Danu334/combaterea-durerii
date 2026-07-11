// app/api/maib-callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { alertAdmin } from '@/lib/alert'

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

    // ── Update status ──────────────────────────────────────────────────────
    const paymentStatus = data.paymentStatus as string
    const newStatus = paymentStatus === 'Executed' ? 'paid' : 'cancelled'

    await sql`
      UPDATE tickets SET status = ${newStatus}
      WHERE maib_session_id = ${checkoutId}
    `

    // ── Send confirmation emails ───────────────────────────────────────────
    if (newStatus === 'paid') {
      const { transporter, buildTicketEmail } = await import('@/lib/mailer')
      for (const ticket of tickets) {
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
