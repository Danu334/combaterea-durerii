import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sql } from 'drizzle-orm'
import { check } from 'drizzle-orm/pg-core'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import Admins from './collections/Admins'
import Nurses from './collections/Nurses'
import RateLimits from './collections/RateLimits'
import Residents from './collections/Residents'
import Students from './collections/Students'
import Tickets from './collections/Tickets'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
  },
  collections: [Admins, Students, Residents, Nurses, Tickets, RateLimits],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL,
    },
    push: true,
    // Drizzle's schema push only knows about columns/constraints declared via Payload fields,
    // so it drops constraints it doesn't recognize — including the app's own
    // `one_person_only` CHECK on tickets (exactly one of student_id/resident_id/nurse_id set).
    // Re-add it here so it survives every push.
    afterSchemaInit: [
      ({ schema, extendTable }) => {
        extendTable({
          table: schema.tables.tickets,
          extraConfig: (t) => ({
            onePersonOnly: check(
              'one_person_only',
              sql`(${t.student} IS NOT NULL)::int + (${t.resident} IS NOT NULL)::int + (${t.nurse} IS NOT NULL)::int = 1`,
            ),
          }),
        })
        return schema
      },
    ],
  }),
})
