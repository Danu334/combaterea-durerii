// app/payment/success/page.tsx
'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const tickets = params.get('tickets') ?? ''

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
          background: '#e8f5e9', margin: '0 auto 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7 13-13" stroke="#2a6b3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', fontWeight: '400', color: '#000', marginBottom: '0.75rem' }}>
          Plată reușită!
        </h1>
        <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.7, marginBottom: '0.5rem' }}>
          Înregistrarea ta a fost confirmată.
        </p>
        <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.7, marginBottom: '2rem' }}>
          Vei primi biletul tău pe email în câteva minute.
          {tickets && (
            <><br/><span style={{ fontSize: '12px', color: '#bbb' }}>Bilet(e): #{tickets.split(',').join(', #')}</span></>
          )}
        </p>
        <Link href="/shop" style={{
          background: '#1a3a6b', color: '#fff',
          padding: '12px 32px', borderRadius: '8px',
          textDecoration: 'none', fontWeight: '500', fontSize: '15px',
        }}>
          ← Înapoi la bilete
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}