'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { useCart, CartItem } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

const products: CartItem[] = [
  { id: 1, name: 'Student ticket',  price: '1.500,00 MDL', priceNum: 1500, type: 'Student',  typeColor: '#c9a84c' },
  { id: 2, name: 'Resident ticket', price: '2.000,00 MDL', priceNum: 2000, type: 'Resident', typeColor: '#c9a84c' },
  { id: 3, name: 'Nurse ticket',    price: '1.500,00 MDL', priceNum: 1500, type: 'Nurse',    typeColor: '#c9a84c' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

function CertificatePreview({ type, typeColor, isMobile }: { type: string; typeColor: string; isMobile: boolean }) {
  return (
    <div style={{
      background: '#f5f4ef',
      width: '100%',
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      alignItems: isMobile ? 'center' : 'center',
      padding: isMobile ? '16px' : '24px 32px 20px 24px',
      position: 'relative',
      boxSizing: 'border-box',
      gap: isMobile ? '14px' : '0',
    }}>
      {/* Logo */}
      <div style={{
        borderRadius: '50%', overflow: 'hidden',
        width: isMobile ? '56px' : '80px',
        height: isMobile ? '56px' : '80px',
        flexShrink: 0,
        marginBottom: isMobile ? 0 : '12px',
      }}>
        <Image src="/images/logo.jpg" alt="no pain logo" width={80} height={80} priority
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Text block */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'center' }}>
        <p style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: isMobile ? '11px' : '12px',
          fontWeight: '700', color: '#1a3a6b',
          textAlign: isMobile ? 'left' : 'center',
          margin: '0 0 6px', lineHeight: 1.3,
        }}>
          International Pain Congress 2026
        </p>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="10" height="10" viewBox="0 0 10 10">
              <polygon points="5,0 6.2,3.5 10,3.5 7,5.7 8.1,9.5 5,7.2 1.9,9.5 3,5.7 0,3.5 3.8,3.5" fill={typeColor} />
            </svg>
          ))}
        </div>
        <p style={{ fontSize: '10px', color: typeColor, margin: '0 0 3px', fontFamily: 'Georgia, serif' }}>Moldova</p>
        <div style={{ width: '55%', height: '0.5px', background: typeColor, margin: '0 0 3px' }} />
        <p style={{ fontSize: '9px', color: typeColor, margin: '0 0 3px', fontFamily: 'Georgia, serif' }}>20th Anniversary Edition</p>
        <div style={{ width: '55%', height: '0.5px', background: typeColor, margin: '0 0 10px' }} />
        <p style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#999', margin: 0 }}>
          Participant Name
        </p>
      </div>

      {/* Bottom row — hidden on mobile to keep card compact */}
      {!isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: '12px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '8px', color: '#555', lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>01-03 Octombrie 2026</p>
            <p style={{ margin: 0 }}>Chișinău, Republica Moldova</p>
            <p style={{ margin: 0 }}>Radisson Blu Leogrand</p>
            <p style={{ margin: 0 }}>Strada Mitropolit Varlaam 77</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <svg width="48" height="48" viewBox="0 0 44 44" style={{ background: '#fff', borderRadius: '3px', padding: '2px' }}>
              <rect x="2" y="2" width="16" height="16" fill="none" stroke="#000" strokeWidth="1.5"/>
              <rect x="5" y="5" width="10" height="10" fill="#000"/>
              <rect x="26" y="2" width="16" height="16" fill="none" stroke="#000" strokeWidth="1.5"/>
              <rect x="29" y="5" width="10" height="10" fill="#000"/>
              <rect x="2" y="26" width="16" height="16" fill="none" stroke="#000" strokeWidth="1.5"/>
              <rect x="5" y="29" width="10" height="10" fill="#000"/>
              <rect x="26" y="26" width="7" height="7" fill="#000"/>
              <rect x="35" y="26" width="7" height="7" fill="#000"/>
              <rect x="26" y="35" width="7" height="7" fill="#000"/>
              <rect x="35" y="35" width="7" height="7" fill="#000"/>
            </svg>
            <p style={{ fontSize: '7px', color: '#aaa', margin: 0 }}>QR-code</p>
          </div>
        </div>
      )}

      {/* Type label rotated on desktop, inline badge on mobile */}
      {isMobile ? (
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          fontSize: '9px', fontWeight: '700', color: typeColor,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '4px',
        }}>
          {type}
        </span>
      ) : (
        <span style={{
          position: 'absolute', right: '0px', top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          fontSize: '8px', fontWeight: '700', color: typeColor,
          letterSpacing: '2px', textTransform: 'uppercase',
          whiteSpace: 'nowrap', transformOrigin: 'center', userSelect: 'none',
        }}>
          {type}
        </span>
      )}
    </div>
  )
}

export default function ShopPage() {
  const { cart, addToCart } = useCart()
  const [added, setAdded] = useState<Record<number, boolean>>({})
  const router = useRouter()
  const isMobile = useIsMobile()

  const addToCartHandler = (product: CartItem) => {
    addToCart(product)
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500)
  }

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar cartCount={cart.length} onCartClick={() => router.push('/cart')} />

      <main style={{ flex: 1, padding: isMobile ? '0 1rem 3rem' : '0 2rem 3rem' }}>
        <p style={{ fontSize: '13px', color: '#888', padding: '1rem 0 0', margin: 0 }}>
          <Link href="https://nopainmoldova.org/" style={{ color: '#1a3a6b', textDecoration: 'none' }}>Home</Link>
          {' / '}Biletele
        </p>
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: isMobile ? '20px' : '22px',
          fontWeight: '400', margin: '0.5rem 0 0', color: '#000',
        }}>
          Biletele
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #eee', marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Showing all 3 results</span>
        </div>

        {/* ── MOBILE: vertical list ───────────────────────────────────── */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products.map(product => (
              <div
                key={product.id}
                style={{
                  display: 'flex', flexDirection: 'column',
                  border: '1px solid #e8e8e8', borderRadius: '12px',
                  background: '#fff', overflow: 'hidden',
                }}
              >
                <CertificatePreview type={product.type} typeColor={product.typeColor} isMobile={true} />
                <div style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px', color: '#000' }}>{product.name}</h2>
                    <p style={{ fontSize: '14px', color: '#6854ed', fontWeight: '600', margin: 0 }}>{product.price}</p>
                  </div>
                  <button
                    onClick={() => addToCartHandler(product)}
                    style={{
                      padding: '10px 18px', flexShrink: 0,
                      background: added[product.id] ? '#2a6b3a' : '#1a1a1a',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                      transition: 'background 0.2s', fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {added[product.id] ? '✓ Adăugat' : 'Adaugă în coș'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── DESKTOP: 3-column grid ──────────────────────────────────── */
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '900px', width: '100%' }}>
              {products.map(product => (
                <div
                  key={product.id}
                  style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e8e8e8', borderRadius: '12px', transition: 'box-shadow 0.2s', background: '#fff' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ borderRadius: '11px 11px 0 0', overflow: 'hidden' }}>
                    <CertificatePreview type={product.type} typeColor={product.typeColor} isMobile={false} />
                  </div>
                  <div style={{ padding: '1.1rem 1rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid #f0f0f0' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 6px', lineHeight: 1.4, color: '#000' }}>{product.name}</h2>
                    <p style={{ fontSize: '14px', color: '#6854ed', fontWeight: '600', margin: '0 0 14px' }}>{product.price}</p>
                    <button
                      onClick={() => addToCartHandler(product)}
                      style={{
                        marginTop: 'auto', padding: '11px 0',
                        background: added[product.id] ? '#2a6b3a' : '#1a1a1a',
                        color: '#fff', border: 'none', borderRadius: '8px',
                        fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                        transition: 'background 0.2s', fontFamily: 'inherit', width: '100%',
                      }}
                    >
                      {added[product.id] ? '✓ Adăugat' : 'Adaugă în coș'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}