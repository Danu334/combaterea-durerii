// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { alertAdmin } from '@/lib/alert'
import { z } from 'zod'

// ─── Rate limiting (DB-backed, works across all Vercel instances) ─────────────
const RATE_LIMIT_MAX = 5  // max submissions per IP per 15 minutes

async function checkRateLimit(ip: string): Promise<boolean> {
  // Clean up old records opportunistically
  await sql`DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '15 minutes'`

  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM rate_limits
    WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '15 minutes'`

  if (rows[0].count >= RATE_LIMIT_MAX) return false

  await sql`INSERT INTO rate_limits (ip) VALUES (${ip})`
  return true
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────
const str = (max: number) => z.string().trim().min(1).max(max)
const email = z.string().trim().email().max(254)
const phone = z.string().trim().min(7).max(20)

const CartItemSchema = z.object({
  id:       z.union([z.string(), z.number()]),
  name:     str(200),
  type:     z.enum(['Student', 'Resident', 'Nurse']),
  price:    z.string().max(50),
  priceNum: z.number().int().min(0).max(50000),
})

const BaseFormSchema = z.object({
  email:     email,
  nume:      str(100),
  prenume:   str(100),
  adresa:    str(300),
  telefon:   phone,
  handzone:  z.enum(['none', 'botulinum', 'locoregional', 'locoregional-periop']),
  satellite: z.enum(['none', 'y2y', 'imagistica']),
})

const StudentFormSchema  = BaseFormSchema.extend({ carnetId: str(100) })
const ResidentFormSchema = BaseFormSchema.extend({ spital: str(200), specialitate: str(200) })
const NurseFormSchema    = BaseFormSchema.extend({ spital: str(200), sectie: str(200) })

const BodySchema = z.object({
  cart:  z.array(CartItemSchema).min(1).max(10),
  forms: z.array(z.union([StudentFormSchema, ResidentFormSchema, NurseFormSchema])).min(1).max(10),
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
type HandzoneOption = 'none' | 'botulinum' | 'locoregional' | 'locoregional-periop'
type SatelliteOption = 'none' | 'y2y' | 'imagistica'

const HANDZONE_PRICE    = 1000
const SATELLITE_CAPACITY = 30
const BASE_URL           = 'https://congress.nopainmoldova.org'

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('373')) digits = digits.slice(3)
  if (digits.startsWith('0'))   digits = digits.slice(1)
  digits = digits.slice(-8)
  return `+373${digits}`
}

// ─── POST /api/register ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const allowed = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: 'Prea multe cereri. Încearcă din nou în 15 minute.' },
        { status: 429 }
      )
    }

    // ── Schema validation ──────────────────────────────────────────────────
    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'Cerere invalidă.' }, { status: 400 })
    }

    const parsed = BodySchema.safeParse(rawBody)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { ok: false, error: `Date invalide: ${first.path.join('.')} — ${first.message}` },
        { status: 400 }
      )
    }

    const { cart, forms } = parsed.data

    if (cart.length !== forms.length) {
      return NextResponse.json({ ok: false, error: 'Date invalide.' }, { status: 400 })
    }

    // Validate each form matches its cart item type
    for (let i = 0; i < cart.length; i++) {
      const type = cart[i].type
      const f = forms[i]
      if (type === 'Student'  && !('carnetId'     in f)) return NextResponse.json({ ok: false, error: `Formularul ${i + 1}: câmp carnetId lipsă.` }, { status: 400 })
      if (type === 'Resident' && !('specialitate' in f)) return NextResponse.json({ ok: false, error: `Formularul ${i + 1}: câmp specialitate lipsă.` }, { status: 400 })
      if (type === 'Nurse'    && !('sectie'        in f)) return NextResponse.json({ ok: false, error: `Formularul ${i + 1}: câmp sectie lipsă.` }, { status: 400 })
    }

    // ── Satellite capacity check ───────────────────────────────────────────
    const requestedSatellites = forms
      .map(f => f.satellite)
      .filter((s): s is Exclude<SatelliteOption, 'none'> => s !== 'none')

    if (requestedSatellites.length > 0) {
      const uniqueRequested = [...new Set(requestedSatellites)]
      const capacityRows = await sql`
        SELECT satellite_workshop, COUNT(*)::int AS count
        FROM tickets
        WHERE satellite_workshop = ANY(${uniqueRequested})
          AND status IN ('pending', 'paid')
        GROUP BY satellite_workshop`

      const currentCounts: Record<string, number> = {}
      for (const row of capacityRows) currentCounts[row.satellite_workshop] = row.count

      for (const sw of requestedSatellites) {
        if ((currentCounts[sw] ?? 0) >= SATELLITE_CAPACITY) {
          return NextResponse.json(
            { ok: false, error: `Locurile pentru workshopul satellite "${sw}" sunt epuizate.` },
            { status: 409 }
          )
        }
      }
    }

    // ── Insert persons + tickets (pending) ────────────────────────────────
    const ticketIds: number[] = []
    let grandTotal = 0

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i]
      const f    = forms[i] as Record<string, string>
      const handzone  = (f.handzone  || 'none') as HandzoneOption
      const satellite = (f.satellite || 'none') as SatelliteOption
      const totalPrice = item.priceNum + (handzone !== 'none' ? HANDZONE_PRICE : 0)
      grandTotal += totalPrice

      let personId: number

      if (item.type === 'Student') {
        const rows = await sql`
          INSERT INTO students (nume, prenume, email, telefon, adresa, carnet_id)
          VALUES (${f.nume}, ${f.prenume}, ${f.email}, ${f.telefon}, ${f.adresa}, ${f.carnetId ?? ''})
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
          VALUES (${f.nume}, ${f.prenume}, ${f.email}, ${f.telefon}, ${f.adresa}, ${f.spital ?? ''}, ${f.specialitate ?? ''})
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
          VALUES (${f.nume}, ${f.prenume}, ${f.email}, ${f.telefon}, ${f.adresa}, ${f.spital ?? ''}, ${f.sectie ?? ''})
          RETURNING id`
        personId = rows[0].id
        const ticket = await sql`
          INSERT INTO tickets (ticket_type, price_mdl, handzone, satellite_workshop, status, nurse_id)
          VALUES (${'Nurse'}, ${totalPrice}, ${handzone}, ${satellite}, ${'pending'}, ${personId})
          RETURNING id`
        ticketIds.push(ticket[0].id)
      }
    }

    // ── Build MAIB payload ────────────────────────────────────────────────
    const firstForm = forms[0] as Record<string, string>
    const orderId   = `IPC-${ticketIds.join('-')}-${Date.now()}`
    const userAgent = req.headers.get('user-agent') ?? 'Mozilla/5.0'
    const phone     = normalizePhone(firstForm.telefon)
    const amount    = parseFloat(grandTotal.toFixed(2))

    const checkoutData = {
      amount,
      currency: 'MDL',
      orderInfo: {
        id: orderId,
        description: `Bilete IPC 2026 (${ticketIds.length})`,
        date: new Date().toISOString(),
        items: cart.map((item, i) => {
          const f2 = forms[i] as Record<string, string>
          const hz = (f2.handzone || 'none') as HandzoneOption
          const price = parseFloat((item.priceNum + (hz !== 'none' ? HANDZONE_PRICE : 0)).toFixed(2))
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
        name:      `${firstForm.prenume} ${firstForm.nume}`.substring(0, 100),
        email:     firstForm.email,
        phone,
        ip,
        userAgent: userAgent.substring(0, 256),
      },
      language:    'ro',
      callbackUrl: `${BASE_URL}/api/maib-callback`,
      successUrl:  `${BASE_URL}/payment/success?tickets=${ticketIds.join(',')}`,
      failUrl:     `${BASE_URL}/payment/fail?tickets=${ticketIds.join(',')}`,
    }

    // ── Create MAIB session ───────────────────────────────────────────────
    const { MaibCheckoutSdk, MaibCheckoutApiRequest } = await import('maib-checkout-sdk')
    const maib = MaibCheckoutApiRequest.create(
  process.env.MAIB_ENV === 'production'
    ? MaibCheckoutSdk.DEFAULT_BASE_URL
    : MaibCheckoutSdk.SANDBOX_BASE_URL
)
    const auth = await maib.generateToken(
      process.env.MAIB_CLIENT_ID!,
      process.env.MAIB_CLIENT_SECRET!
    )
    const session = await maib.checkoutRegister(checkoutData, auth.accessToken)

    // ── Store checkoutId on tickets ───────────────────────────────────────
    await sql`
      UPDATE tickets SET maib_session_id = ${session.checkoutId}
      WHERE id = ANY(${ticketIds}::int[])`

    return NextResponse.json({ ok: true, checkoutUrl: session.checkoutUrl })

  } catch (err) {
    await alertAdmin('register: checkout session creation failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ ok: false, error: 'Eroare internă. Încearcă din nou.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
}
