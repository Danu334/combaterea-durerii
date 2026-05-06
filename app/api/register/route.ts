// app/api/register/route.ts
// Step 1: Save person + ticket (pending), create MAIB session, return checkoutUrl
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { MaibCheckoutSdk, MaibCheckoutApiRequest } from 'maib-checkout-sdk'

type TicketType = 'Student' | 'Resident' | 'Nurse'
type HandzoneOption = 'none' | 'botulinum' | 'locoregional' | 'locoregional-periop'

interface CartItem {
  id: string; name: string; type: TicketType; price: string; priceNum: number
}
interface BaseForm {
  email: string; nume: string; prenume: string
  adresa: string; telefon: string; handzone: HandzoneOption
}
interface StudentForm  extends BaseForm { carnetId: string }
interface ResidentForm extends BaseForm { spital: string; specialitate: string }
interface NurseForm    extends BaseForm { spital: string; sectie: string }
type AnyForm = StudentForm | ResidentForm | NurseForm

const HANDZONE_PRICE = 1000
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL! // e.g. https://yoursite.md

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cart, forms }: { cart: CartItem[]; forms: AnyForm[] } = body

    if (!cart?.length || !forms?.length || cart.length !== forms.length) {
      return NextResponse.json({ ok: false, error: 'Date invalide.' }, { status: 400 })
    }

    // ── 1. Insert all persons + tickets into DB (status = pending) ────────────
    const ticketIds: number[] = []
    let grandTotal = 0

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i]
      const f = forms[i] as unknown as Record<string, string>
      const totalPrice = item.priceNum + (f.handzone !== 'none' ? HANDZONE_PRICE : 0)
      grandTotal += totalPrice

      let personId: number

      if (item.type === 'Student') {
        const rows = await sql`
          INSERT INTO students (nume, prenume, email, telefon, adresa, carnet_id)
          VALUES (${f.nume.trim()}, ${f.prenume.trim()}, ${f.email.trim()},
                  ${f.telefon.trim()}, ${f.adresa.trim()}, ${f.carnetId?.trim() ?? ''})
          RETURNING id`
        personId = rows[0].id
        const ticket = await sql`
          INSERT INTO tickets (ticket_type, price_mdl, handzone, status, student_id)
          VALUES (${'Student'}, ${totalPrice}, ${f.handzone}, ${'pending'}, ${personId})
          RETURNING id`
        ticketIds.push(ticket[0].id)

      } else if (item.type === 'Resident') {
        const rows = await sql`
          INSERT INTO residents (nume, prenume, email, telefon, adresa, spital, specialitate)
          VALUES (${f.nume.trim()}, ${f.prenume.trim()}, ${f.email.trim()},
                  ${f.telefon.trim()}, ${f.adresa.trim()},
                  ${f.spital?.trim() ?? ''}, ${f.specialitate?.trim() ?? ''})
          RETURNING id`
        personId = rows[0].id
        const ticket = await sql`
          INSERT INTO tickets (ticket_type, price_mdl, handzone, status, resident_id)
          VALUES (${'Resident'}, ${totalPrice}, ${f.handzone}, ${'pending'}, ${personId})
          RETURNING id`
        ticketIds.push(ticket[0].id)

      } else {
        const rows = await sql`
          INSERT INTO nurses (nume, prenume, email, telefon, adresa, spital, sectie)
          VALUES (${f.nume.trim()}, ${f.prenume.trim()}, ${f.email.trim()},
                  ${f.telefon.trim()}, ${f.adresa.trim()},
                  ${f.spital?.trim() ?? ''}, ${f.sectie?.trim() ?? ''})
          RETURNING id`
        personId = rows[0].id
        const ticket = await sql`
          INSERT INTO tickets (ticket_type, price_mdl, handzone, status, nurse_id)
          VALUES (${'Nurse'}, ${totalPrice}, ${f.handzone}, ${'pending'}, ${personId})
          RETURNING id`
        ticketIds.push(ticket[0].id)
      }
    }

    // ── 2. Create MAIB checkout session ───────────────────────────────────────
    const orderId = ticketIds.join('-')  // e.g. "12-13" for multiple tickets
    const firstForm = forms[0] as unknown as Record<string, string>

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const userAgent = req.headers.get('user-agent') ?? 'Mozilla/5.0'

    const maib = MaibCheckoutApiRequest.create(MaibCheckoutSdk.SANDBOX_BASE_URL)
    const auth = await maib.generateToken(
      process.env.MAIB_CLIENT_ID!,
      process.env.MAIB_CLIENT_SECRET!
    )

    const checkoutData = {
      amount: grandTotal,
      currency: 'MDL',
      orderInfo: {
        id: orderId,
        description: `Bilete International Pain Congress 2026 (${ticketIds.length} bilet${ticketIds.length > 1 ? 'e' : ''})`,
        date: new Date().toISOString(),
        orderAmount: null,
        orderCurrency: null,
        deliveryAmount: null,
        deliveryCurrency: null,
        items: cart.map((item, i) => {
          const f = forms[i] as unknown as Record<string, string>
          const price = item.priceNum + (f.handzone !== 'none' ? HANDZONE_PRICE : 0)
          return {
            externalId: ticketIds[i].toString(),
            title: item.name,
            amount: price,
            currency: 'MDL',
            quantity: 1,
            displayOrder: i + 1,
          }
        }),
      },
      payerInfo: {
        name: `${firstForm.prenume.trim()} ${firstForm.nume.trim()}`,
        email: firstForm.email.trim(),
        phone: firstForm.telefon.trim(),
        ip,
        userAgent,
      },
      language: 'ro',
      callbackUrl: `${BASE_URL}/api/maib-callback`,
      successUrl: `${BASE_URL}/payment/success?tickets=${ticketIds.join(',')}`,
      failUrl:    `${BASE_URL}/payment/fail?tickets=${ticketIds.join(',')}`,
    }

    const session = await maib.checkoutRegister(checkoutData, auth.accessToken)

    // ── 3. Store maib_session_id on all tickets so callback can find them ─────
    await sql`
      UPDATE tickets
      SET maib_session_id = ${session.checkoutId}
      WHERE id = ANY(${ticketIds}::int[])
    `

    return NextResponse.json({ ok: true, checkoutUrl: session.checkoutUrl })

  } catch (err) {
    console.error('/api/register error:', err)
    return NextResponse.json({ ok: false, error: 'Eroare internă. Încearcă din nou.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
}