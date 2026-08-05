// app/api/admin/maib-health/route.ts
//
// Confirms what the *running* deployment resolved for maib — Vercel will not
// show encrypted env values back to you, so this is the only way to check that
// production is really pointed at production before taking live payments.
//
//   GET /api/admin/maib-health
//   Header: x-admin-key: <ADMIN_KEY>
//
// Reports the environment, the base URL, whether the credentials authenticate,
// and which secrets are present. Never returns a secret value.
import { NextRequest, NextResponse } from 'next/server'
import { authorized } from '@/lib/admin-auth'
import { maibClient, resolveMaibEnv } from '@/lib/maib'

/** Last 4 chars only — enough to tell prod keys from sandbox keys at a glance. */
function fingerprint(value: string | undefined): string | null {
  return value ? `…${value.slice(-4)}` : null
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  const report: Record<string, unknown> = {
    clientId: fingerprint(process.env.MAIB_CLIENT_ID),
    clientSecret: fingerprint(process.env.MAIB_CLIENT_SECRET),
    signatureKey: fingerprint(process.env.MAIB_SIGNATURE_KEY),
    rawMaibEnv: process.env.MAIB_ENV ?? null,
  }

  try {
    report.env = resolveMaibEnv()
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), ...report },
      { status: 500 },
    )
  }

  try {
    const { accessToken, baseUrl } = await maibClient()
    return NextResponse.json({
      ok: true,
      ...report,
      baseUrl,
      authenticates: Boolean(accessToken),
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        ...report,
        authenticates: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    )
  }
}

export async function POST() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
}
