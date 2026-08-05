#!/usr/bin/env node
/**
 * maib Checkout sandbox test harness
 * ----------------------------------
 * Satisfies the bank's request: a test transaction followed by a refund.
 *
 * Usage (reads keys from .env.local automatically):
 *
 *   node scripts/maib-test.mjs register [amount]
 *       Creates a sandbox checkout session and prints the checkoutId + URL.
 *       Open the URL in a browser and pay with the test card:
 *         Card 5102180060101124  Exp 06/28  CVV 760  (Test Test)
 *
 *   node scripts/maib-test.mjs details <checkoutId>
 *       Prints the checkout status and, once paid, the payment.paymentId
 *       (needed for the refund) plus amount / refundedAmount.
 *
 *   node scripts/maib-test.mjs refund <paymentId> <amount> [reason]
 *       Refunds the executed payment. amount is in MDL (major units).
 *
 *   node scripts/maib-test.mjs flow [amount]
 *       register -> wait for you to pay -> press Enter -> details -> refund.
 *
 * MAIB_ENV in .env.local selects sandbox vs production — it must be set to one
 * of those two exactly; the script refuses to run otherwise. With
 * MAIB_ENV=production these commands move REAL money.
 */

import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { MaibCheckoutSdk, MaibCheckoutApiRequest } from 'maib-checkout-sdk'

// ── Load .env.local ───────────────────────────────────────────────────────────
try {
  process.loadEnvFile(new URL('../.env.local', import.meta.url))
} catch {
  console.error('Could not read .env.local — run this from the project root.')
  process.exit(1)
}

// Mirrors lib/maib.ts: never guess the environment. Running what you think is
// a sandbox test against production (or vice versa) is worse than not running.
const ENV = (process.env.MAIB_ENV ?? '').trim()
if (ENV !== 'production' && ENV !== 'sandbox') {
  console.error(`MAIB_ENV must be exactly "production" or "sandbox" (got ${JSON.stringify(ENV)}).`)
  process.exit(1)
}
const BASE_URL = ENV === 'production'
  ? MaibCheckoutSdk.DEFAULT_BASE_URL
  : MaibCheckoutSdk.SANDBOX_BASE_URL
const SITE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://congress.nopainmoldova.org'

function client() {
  return MaibCheckoutApiRequest.create(BASE_URL)
}
async function token(maib) {
  const auth = await maib.generateToken(process.env.MAIB_CLIENT_ID, process.env.MAIB_CLIENT_SECRET)
  return auth.accessToken
}

// ── Commands ──────────────────────────────────────────────────────────────────
async function register(amountArg) {
  const amount = Number(amountArg ?? 1)
  const maib = client()
  const tok = await token(maib)
  const orderId = `TEST-${Date.now()}`
  const data = {
    amount,
    currency: 'MDL',
    orderInfo: {
      id: orderId,
      description: 'maib sandbox test transaction',
      date: new Date().toISOString(),
    },
    payerInfo: {
      name: 'Test Test',
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'test@example.com',
      phone: '+37300000000',
    },
    language: 'ro',
    callbackUrl: `${SITE}/api/maib-callback`,
    successUrl: `${SITE}/payment/success`,
    failUrl: `${SITE}/payment/fail`,
  }
  const session = await maib.checkoutRegister(data, tok)
  console.log(`\n[${ENV}] Checkout created.`)
  console.log('  orderId    :', orderId)
  console.log('  amount     :', amount, 'MDL')
  console.log('  checkoutId :', session.checkoutId)
  console.log('  checkoutUrl:', session.checkoutUrl)
  if (ENV === 'production') {
    console.log('\n*** PRODUCTION — this charges a real card for', amount, 'MDL.')
    console.log('    Refund it afterwards with the `refund` command.')
  } else {
    console.log('\nPay with test card 5102180060101124  Exp 06/28  CVV 760')
  }
  return session.checkoutId
}

async function details(checkoutId) {
  const maib = client()
  const tok = await token(maib)
  const res = await maib.checkoutDetails(checkoutId, tok)
  console.log('\nCheckout status:', res.status)
  const p = res.payment
  if (!p) {
    console.log('No payment yet — pay on the checkout URL first.')
    return null
  }
  console.log('  payment.paymentId    :', p.paymentId)
  console.log('  payment.status       :', p.status)
  console.log('  payment.amount       :', p.amount, p.currency)
  console.log('  payment.refundedAmount:', p.refundedAmount)
  console.log('\nFull payment object:\n', JSON.stringify(p, null, 2))
  return p
}

async function refund(paymentId, amountArg, reasonArg) {
  const amount = Number(amountArg)
  if (!paymentId || !Number.isFinite(amount)) {
    console.error('Usage: refund <paymentId> <amount> [reason]')
    process.exit(1)
  }
  const reason = reasonArg ?? 'Sandbox test refund'
  const maib = client()
  const tok = await token(maib)
  const res = await maib.paymentRefund(paymentId, { amount, reason }, tok)
  console.log('\nRefund response:\n', JSON.stringify(res, null, 2))
  return res
}

async function flow(amountArg) {
  const checkoutId = await register(amountArg)
  const rl = createInterface({ input: stdin, output: stdout })
  await rl.question('\nAfter paying on the URL above, press Enter to fetch details… ')
  rl.close()
  const p = await details(checkoutId)
  if (p?.paymentId && p.status === 'Executed') {
    await refund(p.paymentId, p.amount, 'Sandbox test refund')
  } else {
    console.log('\nPayment not Executed yet — re-run `details` then `refund` manually.')
  }
}

// ── Dispatch ────────────────────────────────────────────────────────────────────
const [cmd, ...args] = process.argv.slice(2)
try {
  switch (cmd) {
    case 'register': await register(args[0]); break
    case 'details':  await details(args[0]); break
    case 'refund':   await refund(args[0], args[1], args[2]); break
    case 'flow':     await flow(args[0]); break
    default:
      console.log('Commands: register [amount] | details <checkoutId> | refund <paymentId> <amount> [reason] | flow [amount]')
  }
} catch (err) {
  console.error('\nmaib error:', err?.message ?? err)
  process.exit(1)
}
