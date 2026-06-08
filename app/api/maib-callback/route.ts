// app/api/maib-callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Callback endpoint is alive.' })
}

export async function POST(req: NextRequest) {
  console.log('=== MAIB CALLBACK HIT ===')

  try {
    const rawBody = await req.text()

    // Log all headers to see exactly what MAIB sends
    const headers: Record<string, string> = {}
    req.headers.forEach((val, key) => { headers[key] = val })
    console.log('All headers:', JSON.stringify(headers))
    console.log('Raw body:', rawBody)

    if (!rawBody) {
      return NextResponse.json({ ok: false, error: 'Empty body' }, { status: 400 })
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(rawBody)
    } catch {
      console.error('Failed to parse JSON body')
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('paymentStatus:', data.paymentStatus)
    console.log('checkoutId:', data.checkoutId)

    // ── Signature validation ───────────────────────────────────────────────
    const signatureHeader    = req.headers.get('x-signature') ?? ''
    const signatureTimestamp = req.headers.get('x-signature-timestamp') ?? ''
    const signatureKey       = process.env.MAIB_SIGNATURE_KEY ?? ''

    console.log('x-signature:', signatureHeader || 'MISSING')
    console.log('x-timestamp:', signatureTimestamp || 'MISSING')
    console.log('MAIB_SIGNATURE_KEY set:', !!signatureKey)

    // Only validate if ALL three parts are present and non-empty
    if (signatureHeader && signatureTimestamp && signatureKey) {
      try {
        const { MaibCheckoutSdk } = await import('maib-checkout-sdk')
        const isValid = MaibCheckoutSdk.validateCallbackSignature(
          rawBody,
          signatureHeader,
          signatureTimestamp,
          signatureKey
        )
        console.log('Signature valid:', isValid)
        if (!isValid) {
          console.error('Signature mismatch — rejecting')
          return NextResponse.json({ ok: false }, { status: 400 })
        }
      } catch (sigErr) {
        // Log the error but don't block — MAIB docs say to return 200
        console.error('Signature validation threw:', sigErr)
      }
    } else {
      console.warn('Skipping signature — missing:', {
        signatureHeader: !!signatureHeader,
        signatureTimestamp: !!signatureTimestamp,
        signatureKey: !!signatureKey,
      })
    }

    // ── Find tickets by checkoutId ─────────────────────────────────────────
    const checkoutId = data.checkoutId as string
    if (!checkoutId) {
      console.error('No checkoutId in payload')
      return NextResponse.json({ ok: true }) // return 200 to stop MAIB retrying
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

    console.log('Tickets found:', tickets.length, 'for checkoutId:', checkoutId)

    if (tickets.length === 0) {
      // Also try searching by partial match in case of formatting difference
      const allPending = await sql`
        SELECT id, maib_session_id FROM tickets WHERE status = 'pending' LIMIT 10
      `
      console.log('Pending tickets in DB:', JSON.stringify(allPending))
      return NextResponse.json({ ok: true })
    }

    // ── Update status ──────────────────────────────────────────────────────
    const paymentStatus = data.paymentStatus as string
    const newStatus = paymentStatus === 'Executed' ? 'paid' : 'cancelled'

    await sql`
      UPDATE tickets SET status = ${newStatus}
      WHERE maib_session_id = ${checkoutId}
    `
    console.log(`Updated ${tickets.length} ticket(s) to "${newStatus}"`)

    // ── Send emails ────────────────────────────────────────────────────────
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
            console.error(`⚠️ PDF generation failed for ticket #${ticket.id} (sending without attachment):`, pdfErr)
            mailOptions = await buildTicketEmail(ticketData, true)
          }
          await transporter.sendMail(mailOptions)
          console.log(`✅ Email sent → ticket #${ticket.id} → ${ticket.email}`)
        } catch (emailErr) {
          console.error(`❌ Email failed for ticket #${ticket.id}:`, emailErr)
        }
      }
    }

    console.log('=== MAIB CALLBACK COMPLETE ===')
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('/api/maib-callback error:', err)
    // Always return 200 to MAIB so it doesn't keep retrying
    return NextResponse.json({ ok: true })
  }
}