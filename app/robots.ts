import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/registration'],
        disallow: ['/api/', '/cart', '/payment/'],
      },
    ],
    sitemap: 'https://congress.nopainmoldova.org/sitemap.xml',
  }
}
