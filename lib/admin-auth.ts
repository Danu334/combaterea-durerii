// lib/admin-auth.ts
//
// Shared `x-admin-key` check for the /api/admin/* routes.
import { NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

export function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_KEY ?? ''
  const provided = req.headers.get('x-admin-key') ?? ''
  if (!expected || !provided) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  // timingSafeEqual throws on length mismatch, so that has to be checked first.
  return a.length === b.length && timingSafeEqual(a, b)
}
