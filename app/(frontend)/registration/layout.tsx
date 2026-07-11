export { metadata } from './metadata'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'International Pain Congress 2026 — 20th Anniversary Edition',
  description:
    'Congresul Internațional de Durere, ediția a 20-a aniversară, dedicat excelentei și progresului în managementul durerii.',
  startDate: '2026-10-01',
  endDate: '2026-10-03',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Digital Park',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Strada Mihai Viteazul 15',
      addressLocality: 'Chișinău',
      addressCountry: 'MD',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: 'MSSMP — Societatea Medicilor pentru Studiul și Managementul Durerii',
    url: 'https://nopainmoldova.org',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Înregistrare Student',
      price: '1500',
      priceCurrency: 'MDL',
      availability: 'https://schema.org/InStock',
      url: 'https://congress.nopainmoldova.org/registration',
    },
    {
      '@type': 'Offer',
      name: 'Înregistrare Standard (Rezident / Doctor)',
      price: '2000',
      priceCurrency: 'MDL',
      availability: 'https://schema.org/InStock',
      url: 'https://congress.nopainmoldova.org/registration',
    },
    {
      '@type': 'Offer',
      name: 'Înregistrare Asistentă Medicală',
      price: '1500',
      priceCurrency: 'MDL',
      availability: 'https://schema.org/InStock',
      url: 'https://congress.nopainmoldova.org/registration',
    },
  ],
  image: 'https://congress.nopainmoldova.org/images/logo.jpg',
  url: 'https://congress.nopainmoldova.org/registration',
}

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
