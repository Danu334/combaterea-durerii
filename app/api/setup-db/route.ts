import { setupDatabase } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  if (searchParams.get('key') !== process.env.SETUP_KEY) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    await setupDatabase()
    return Response.json({ ok: true, message: 'Tables created successfully' })
  } catch (err) {
    console.error(err)
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}