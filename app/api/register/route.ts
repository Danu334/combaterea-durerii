// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

type TicketType = 'Student' | 'Resident' | 'Nurse'
type HandzoneOption = 'none' | 'botulinum' | 'locoregional' | 'locoregional-periop'
type SatelliteOption = 'none' | 'y2y' | 'imagistica'

interface CartItem {
  id: string; name: string; type: TicketType; price: string; priceNum: number
}
interface BaseForm {
  email: string; nume: string; prenume: string
  adresa: string; telefon: string; handzone: HandzoneOption; satellite: SatelliteOption
}
interface StudentForm  extends BaseForm { carnetId: string }
interface ResidentForm extends BaseForm { spital: string; specialitate: string }
interface NurseForm    extends BaseForm { spital: string; sectie: string }
type AnyForm = StudentForm | ResidentForm | NurseForm

const HANDZONE_PRICE = 1000
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('373')) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(-8)
  return `+373${digits}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cart, forms }: { cart: CartItem[]; forms: AnyForm[] } = body

    if (!cart?.length || !forms?.length || cart.length !== forms.length) {
      return NextResponse.json({ ok: false, error: 'Date invalide.' }, { status: 400 })
    }

    // ── 1. Ensure satellite_workshop column exists ─────────────────────────
    await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS satellite_workshop TEXT NOT NULL DEFAULT 'none'`

    // ── 2. Insert persons + tickets (pending) ─────────────────────────────
    const ticketIds: number[] = []
    let grandTotal = 0

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i]
      const f = forms[i] as unknown as Record<string, string>
      const handzone = (f.handzone || 'none') as HandzoneOption
      const satellite = (f.satellite || 'none') as SatelliteOption
      const totalPrice = item.priceNum + (handzone !== 'none' ? HANDZONE_PRICE : 0)
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
          INSERT INTO tickets (ticket_type, price_mdl, handzone, satellite_workshop, status, student_id)
          VALUES (${'Student'}, ${totalPrice}, ${handzone}, ${satellite}, ${'pending'}, ${personId})
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
          INSERT INTO tickets (ticket_type, price_mdl, handzone, satellite_workshop, status, resident_id)
          VALUES (${'Resident'}, ${totalPrice}, ${handzone}, ${satellite}, ${'pending'}, ${personId})
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
          INSERT INTO tickets (ticket_type, price_mdl, handzone, satellite_workshop, status, nurse_id)
          VALUES (${'Nurse'}, ${totalPrice}, ${handzone}, ${satellite}, ${'pending'}, ${personId})
          RETURNING id`
        ticketIds.push(ticket[0].id)
      }
    }

    // ── 3. Build MAIB payload (identical structure to original) ───────────
    const firstForm = forms[0] as unknown as Record<string, string>
    const orderId   = `IPC-${ticketIds.join('-')}-${Date.now()}`
    const ip        = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const userAgent = req.headers.get('user-agent') ?? 'Mozilla/5.0'
    const phone     = normalizePhone(firstForm.telefon.trim())
    const amount    = parseFloat(grandTotal.toFixed(2))

    const checkoutData = {
      amount,
      currency: 'MDL',
      orderInfo: {
        id: orderId,
        description: `Bilete IPC 2026 (${ticketIds.length})`,
        date: new Date().toISOString(),
        orderAmount:      null,
        orderCurrency:    null,
        deliveryAmount:   null,
        deliveryCurrency: null,
        items: cart.map((item, i) => {
          const f = forms[i] as unknown as Record<string, string>
          const handzone = (f.handzone || 'none') as HandzoneOption
          const price = parseFloat((item.priceNum + (handzone !== 'none' ? HANDZONE_PRICE : 0)).toFixed(2))
          return {
            externalId:   ticketIds[i].toString(),
            title:        item.name.substring(0, 100),
            amount:       price,
            currency:     'MDL',
            quantity:     1,
            displayOrder: i + 1,
          }
        }),
      },
      payerInfo: {
        name:      `${firstForm.prenume.trim()} ${firstForm.nume.trim()}`.substring(0, 100),
        email:     firstForm.email.trim(),
        phone,
        ip,
        userAgent: userAgent.substring(0, 256),
      },
      language:    'ro',
      callbackUrl: `${BASE_URL}/api/maib-callback`,
      successUrl:  `${BASE_URL}/payment/success?tickets=${ticketIds.join(',')}`,
      failUrl:     `${BASE_URL}/payment/fail?tickets=${ticketIds.join(',')}`,
    }

    console.log('MAIB payload:', JSON.stringify(checkoutData, null, 2))

    // ── 4. Create MAIB session ─────────────────────────────────────────────
    const { MaibCheckoutSdk, MaibCheckoutApiRequest } = await import('maib-checkout-sdk')
    const maib = MaibCheckoutApiRequest.create(MaibCheckoutSdk.SANDBOX_BASE_URL)
    const auth = await maib.generateToken(
      process.env.MAIB_CLIENT_ID!,
      process.env.MAIB_CLIENT_SECRET!
    )

    const session = await maib.checkoutRegister(checkoutData, auth.accessToken)
    console.log('MAIB session created:', session.checkoutId)

    // ── 5. Store checkoutId on tickets ─────────────────────────────────────
    await sql`
      UPDATE tickets
      SET maib_session_id = ${session.checkoutId}
      WHERE id = ANY(${ticketIds}::int[])`

    return NextResponse.json({ ok: true, checkoutUrl: session.checkoutUrl })

  } catch (err) {
    console.error('/api/register error:', err)
    return NextResponse.json({ ok: false, error: 'Eroare internă. Încearcă din nou.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
}