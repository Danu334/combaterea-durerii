import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plată Eșuată',
  description: 'A apărut o problemă la procesarea plății.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
