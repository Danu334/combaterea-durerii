import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

const BASE_URL = 'https://congress.nopainmoldova.org'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'International Pain Congress 2026 — Înregistrare',
    template: '%s | International Pain Congress 2026',
  },
  description:
    'Înregistrare oficială la International Pain Congress 2026 — ediția a 20-a aniversară. 01–03 Octombrie 2026, Digital Park, Chișinău, Republica Moldova.',
  keywords: [
    'pain congress 2026',
    'congres durere moldova',
    'nopainmoldova',
    'MSSMP',
    'management durere',
    'congres medical chisinau',
    'international pain congress',
    'pain management chisinau',
    'workshop botulinum toxin',
    'locoregional techniques',
  ],
  authors: [{ name: 'MSSMP — Societatea Medicilor pentru Studiul și Managementul Durerii' }],
  creator: 'MSSMP',
  publisher: 'MSSMP',
  openGraph: {
    type: 'website',
    locale: 'ro_MD',
    alternateLocale: 'en_GB',
    url: BASE_URL,
    siteName: 'International Pain Congress 2026',
    title: 'International Pain Congress 2026 — 20th Anniversary Edition',
    description:
      '01–03 Octombrie 2026 · Digital Park, Chișinău · Ediția a 20-a aniversară. Înregistrează-te acum.',
    images: [
      {
        url: '/images/logo.jpg',
        width: 800,
        height: 800,
        alt: 'International Pain Congress 2026 logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Pain Congress 2026 — 20th Anniversary Edition',
    description:
      '01–03 Octombrie 2026 · Digital Park, Chișinău · Înregistrează-te acum.',
    images: ['/images/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" style={{ height: '100%' }}>
      <body style={{ margin: 0, padding: 0, height: '100%', overflowX: 'hidden' }}>
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
