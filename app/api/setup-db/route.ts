export async function GET() {
  return Response.json({ error: 'Endpoint disabled.' }, { status: 410 })
}
