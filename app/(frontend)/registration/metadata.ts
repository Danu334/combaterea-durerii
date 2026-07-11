import type { Metadata } from 'next'

const BASE_URL = 'https://congress.nopainmoldova.org'

export const metadata: Metadata = {
  title: 'Înregistrare Bilete',
  description:
    'Cumpără biletul tău la International Pain Congress 2026 — ediția a 20-a aniversară. Locuri disponibile pentru studenți, medici rezidenți și asistenți medicali. Workshops hands-on și satellite incluse.',
  alternates: {
    canonical: `${BASE_URL}/registration`,
  },
  openGraph: {
    url: `${BASE_URL}/registration`,
    title: 'Înregistrare — International Pain Congress 2026',
    description:
      'Asigură-ți locul la IPC 2026 · 01–03 Octombrie · Digital Park, Chișinău. Bilete pentru studenți, rezidenți și asistenți medicali.',
  },
}
