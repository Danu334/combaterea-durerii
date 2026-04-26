// lib/wordpress.ts
const WP = process.env.WORDPRESS_URL

export async function getPosts() {
  const res = await fetch(`${WP}/wp-json/wp/v2/posts?_embed&per_page=20`, {
    next: { revalidate: 3600 }
  })
  return res.json()
}

export async function getPages() {
  const res = await fetch(`${WP}/wp-json/wp/v2/pages?_embed`, {
    next: { revalidate: 3600 }
  })
  return res.json()
}