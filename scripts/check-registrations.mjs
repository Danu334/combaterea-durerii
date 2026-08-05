import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'node:fs'

// load DATABASE_URL from .env.local
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m)
const sql = neon(m[1])

const counts = await sql`
  SELECT
    (SELECT COUNT(*)::int FROM students)  AS students,
    (SELECT COUNT(*)::int FROM residents) AS residents,
    (SELECT COUNT(*)::int FROM nurses)    AS nurses,
    (SELECT COUNT(*)::int FROM tickets)   AS tickets`
console.log('TABLE COUNTS:', counts[0])

const byStatus = await sql`SELECT status, COUNT(*)::int AS n FROM tickets GROUP BY status ORDER BY status`
console.log('\nTICKETS BY STATUS:', byStatus)

const handzone = await sql`
  SELECT handzone, status, COUNT(*)::int AS n
  FROM tickets WHERE handzone != 'none'
  GROUP BY handzone, status ORDER BY handzone, status`
console.log('\nHANDS-ON (handzone) BY STATUS:', handzone)

const satellite = await sql`
  SELECT satellite_workshop, status, COUNT(*)::int AS n
  FROM tickets WHERE satellite_workshop != 'none'
  GROUP BY satellite_workshop, status ORDER BY satellite_workshop, status`
console.log('\nSATELLITE BY STATUS:', satellite)

const recent = await sql`
  SELECT id, created_at, ticket_type, price_mdl, handzone, satellite_workshop, status
  FROM tickets ORDER BY created_at DESC LIMIT 15`
console.log('\nMOST RECENT TICKETS:')
for (const r of recent) {
  console.log(`  #${r.id}  ${new Date(r.created_at).toISOString()}  ${r.ticket_type}  ${r.price_mdl} MDL  hz=${r.handzone}  sat=${r.satellite_workshop}  [${r.status}]`)
}
