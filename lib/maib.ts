// lib/maib.ts
//
// Single source of truth for which maib environment we talk to and how a
// client is built.
//
// Every call site used to inline:
//   process.env.MAIB_ENV === 'production' ? DEFAULT_BASE_URL : SANDBOX_BASE_URL
// which treats *any* unexpected value — unset, misspelt, or clobbered by a
// malformed .env line — as "sandbox". In production that fails in the worst
// possible way: checkouts are created against the sandbox, the customer sees a
// payment form, no real money moves, and the callback still marks the ticket
// paid. So we refuse to guess and throw instead.

export type MaibEnv = 'production' | 'sandbox'

export function resolveMaibEnv(): MaibEnv {
  const raw = (process.env.MAIB_ENV ?? '').trim()
  if (raw === 'production') return 'production'
  if (raw === 'sandbox') return 'sandbox'
  throw new Error(
    `MAIB_ENV must be exactly "production" or "sandbox" (got ${JSON.stringify(raw)}). ` +
      'Refusing to fall back to the sandbox — that would accept checkouts that never take real money.',
  )
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set — maib requests cannot be signed.`)
  return value
}

/**
 * Builds an authenticated maib client for the configured environment.
 * Throws on bad configuration rather than silently degrading.
 */
export async function maibClient() {
  const { MaibCheckoutSdk, MaibCheckoutApiRequest } = await import('maib-checkout-sdk')

  const env = resolveMaibEnv()
  const baseUrl =
    env === 'production' ? MaibCheckoutSdk.DEFAULT_BASE_URL : MaibCheckoutSdk.SANDBOX_BASE_URL

  const maib = MaibCheckoutApiRequest.create(baseUrl)
  const auth = await maib.generateToken(
    requireEnv('MAIB_CLIENT_ID'),
    requireEnv('MAIB_CLIENT_SECRET'),
  )

  return { maib, accessToken: auth.accessToken, env, baseUrl }
}
