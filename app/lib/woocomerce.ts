// lib/woocommerce.ts
const BASE = `${process.env.WORDPRESS_URL}/wp-json/wc/v3`
const auth = Buffer.from(
  `${process.env.WC_KEY}:${process.env.WC_SECRET}`
).toString('base64')

const wcFetch = (path: string) =>
  fetch(`${BASE}${path}`, {
    headers: { Authorization: `Basic ${auth}` },
    next: { revalidate: 3600 }
  })

export async function getProducts() {
  const res = await wcFetch('/products')
  return res.json()
}

export async function getProduct(id: number) {
  const res = await wcFetch(`/products/${id}`)
  return res.json()
}

export async function createOrder(data: object) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return res.json()
}