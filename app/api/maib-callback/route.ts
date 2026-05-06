// app/api/maib-callback/route.ts
// Step 2: MAIB posts here after payment → update ticket status → send email
import { NextRequest, NextResponse } from 'next/server'
import { MaibCheckoutSdk } from 'maib-checkout-sdk'
import { sql } from '@/lib/db'
import { transporter, buildTicketEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signatureHeader  = req.headers.get('x-signature') ?? ''
    const signatureTimestamp = req.headers.get('x-timestamp') ?? ''

    // ── 1. Validate MAIB signature ────────────────────────────────────────────
    const isValid = MaibCheckoutSdk.validateCallbackSignature(
      rawBody,
      signatureHeader,
      signatureTimestamp,
      process.env.MAIB_SIGNATURE_KEY!
    )

    if (!isValid) {
      console.error('MAIB callback: invalid signature')
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const data = JSON.parse(rawBody)
    console.log('MAIB callback received:', data.paymentStatus, data.checkoutId)

    // ── 2. Find tickets by maib_session_id ────────────────────────────────────
    const tickets = await sql`
      SELECT
        t.id, t.ticket_type, t.price_mdl, t.handzone, t.status,
        COALESCE(s.nume, r.nume, n.nume)          AS nume,
        COALESCE(s.prenume, r.prenume, n.prenume) AS prenume,
        COALESCE(s.email, r.email, n.email)       AS email
      FROM tickets t
      LEFT JOIN students  s ON t.student_id  = s.id
      LEFT JOIN residents r ON t.resident_id = r.id
      LEFT JOIN nurses    n ON t.nurse_id    = n.id
      WHERE t.maib_session_id = ${data.checkoutId}
    `

    if (tickets.length === 0) {
      console.warn('MAIB callback: no tickets found for checkoutId', data.checkoutId)
      return NextResponse.json({ ok: false }, { status: 404 })
    }

    // ── 3. Map MAIB status → our status ───────────────────────────────────────
    // paymentStatus: "Executed" = paid, "Reversed" = refunded, "Declined" = failed
    const newStatus =
      data.paymentStatus === 'Executed'  ? 'paid'      :
      data.paymentStatus === 'Reversed'  ? 'cancelled' : 'cancelled'

    await sql`
      UPDATE tickets
      SET status = ${newStatus}
      WHERE maib_session_id = ${data.checkoutId}
    `

    // ── 4. Send confirmation emails only on successful payment ────────────────
    if (newStatus === 'paid') {
      for (const ticket of tickets) {
        try {
          await transporter.sendMail(await buildTicketEmail({
            id:          ticket.id,
            prenume:     ticket.prenume,
            nume:        ticket.nume,
            email:       ticket.email,
            ticket_type: ticket.ticket_type,
            price_mdl:   ticket.price_mdl,
            handzone:    ticket.handzone,
          }))
          console.log(`Email sent for ticket #${ticket.id} to ${ticket.email}`)
        } catch (emailErr) {
          // Don't fail the whole callback if one email fails
          console.error(`Email failed for ticket #${ticket.id}:`, emailErr)
        }
      }
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('/api/maib-callback error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}