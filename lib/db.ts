import { neon } from '@neondatabase/serverless'
export const sql = neon(process.env.DATABASE_URL!)

export async function setupDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id         SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      nume       TEXT NOT NULL,
      prenume    TEXT NOT NULL,
      email      TEXT NOT NULL,
      telefon    TEXT NOT NULL,
      adresa     TEXT NOT NULL,
      carnet_id  TEXT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS residents (
      id           SERIAL PRIMARY KEY,
      created_at   TIMESTAMP DEFAULT NOW(),
      nume         TEXT NOT NULL,
      prenume      TEXT NOT NULL,
      email        TEXT NOT NULL,
      telefon      TEXT NOT NULL,
      adresa       TEXT NOT NULL,
      spital       TEXT NOT NULL,
      specialitate TEXT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS nurses (
      id         SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      nume       TEXT NOT NULL,
      prenume    TEXT NOT NULL,
      email      TEXT NOT NULL,
      telefon    TEXT NOT NULL,
      adresa     TEXT NOT NULL,
      spital     TEXT NOT NULL,
      sectie     TEXT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS tickets (
      id                  SERIAL PRIMARY KEY,
      created_at          TIMESTAMP DEFAULT NOW(),
      ticket_type         TEXT NOT NULL CHECK (ticket_type IN ('Student', 'Resident', 'Nurse')),
      price_mdl           INTEGER NOT NULL,
      handzone            TEXT NOT NULL DEFAULT 'none',
      satellite_workshop  TEXT NOT NULL DEFAULT 'none',
      image_url           TEXT,
      status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
      maib_session_id     TEXT,
      student_id          INTEGER REFERENCES students(id)  ON DELETE SET NULL,
      resident_id         INTEGER REFERENCES residents(id) ON DELETE SET NULL,
      nurse_id            INTEGER REFERENCES nurses(id)    ON DELETE SET NULL,
      CONSTRAINT one_person_only CHECK (
        (student_id  IS NOT NULL)::int +
        (resident_id IS NOT NULL)::int +
        (nurse_id    IS NOT NULL)::int = 1
      )
    )
  `
  // Safe migrations for existing tables
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS image_url TEXT`
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS satellite_workshop TEXT NOT NULL DEFAULT 'none'`
}