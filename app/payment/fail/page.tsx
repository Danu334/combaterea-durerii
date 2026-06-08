// app/payment/fail/page.tsx
'use client'
import Link from 'next/link'
import { Suspense } from 'react'

function FailContent() {
  const wrap: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f7f8fa',
    fontFamily: '"DM Sans", sans-serif', padding: '2rem',
  }

  return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#fff0f0', margin: '0 auto 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px',
        }}>✕</div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', fontWeight: '400', color: '#000', marginBottom: '0.75rem' }}>
          Plata nu a fost procesată
        </h1>
        <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.7, marginBottom: '2rem' }}>
          Tranzacția a eșuat sau a fost anulată. Datele tale au fost salvate —
          poți încerca din nou sau contacta organizatorii.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/cart" style={{
            background: '#1a3a6b', color: '#fff',
            padding: '12px 28px', borderRadius: '8px',
            textDecoration: 'none', fontWeight: '500', fontSize: '15px',
          }}>
            Încearcă din nou
          </Link>
          <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'mssmp.md@gmail.com'}`} style={{
            background: '#fff', color: '#1a3a6b',
            padding: '12px 28px', borderRadius: '8px',
            textDecoration: 'none', fontWeight: '500', fontSize: '15px',
            border: '1px solid #1a3a6b',
          }}>
            Contactează-ne
          </a>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return <Suspense><FailContent /></Suspense>
}