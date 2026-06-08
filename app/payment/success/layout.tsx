import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plată Reușită',
  description: 'Înregistrarea ta la International Pain Congress 2026 a fost confirmată.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
