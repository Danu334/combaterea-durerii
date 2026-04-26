'use client'
import React, { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'Student ticket',
    price: '1.500,00 MDL',
    priceNum: 1500,
    type: 'Student',
    typeColor: '#c9a84c',
    description: 'Access to all main congress sessions',
  },
  {
    id: 2,
    name: 'Resident ticket',
    price: '1.200,00 MDL',
    priceNum: 1200,
    type: 'Resident',
    typeColor: '#c9a84c',
    description: 'For medical residents in training',
  },
  {
    id: 3,
    name: 'Nurse ticket',
    price: '1.000,00 MDL',
    priceNum: 1000,
    type: 'Nurse',
    typeColor: '#c9a84c',
    description: 'For nursing professionals',
  },
]

function CertificatePreview({ type, typeColor }: { type: string; typeColor: string }) {
  return (
    <div style={{
      background: '#f5f4ef',
      width: '100%',
      height: '220px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '18px 16px 12px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Stars row */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="10" height="10" viewBox="0 0 10 10">
            <polygon
              points="5,0 6.2,3.5 10,3.5 7,5.7 8.1,9.5 5,7.2 1.9,9.5 3,5.7 0,3.5 3.8,3.5"
              fill="#1a3a6b"
            />
          </svg>
        ))}
      </div>

      {/* Title */}
      <p style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: '11px',
        fontWeight: '600',
        color: '#1a3a6b',
        textAlign: 'center',
        margin: '0 0 2px',
        lineHeight: 1.3,
      }}>
        International Pain Congress 2026
      </p>

      {/* Moldova */}
      <p style={{ fontSize: '9px', color: typeColor, margin: '2px 0 0', fontFamily: 'Georgia, serif' }}>
        Moldova
      </p>

      {/* Gold line */}
      <div style={{ width: '55%', height: '0.5px', background: typeColor, margin: '4px 0 2px' }} />

      {/* Anniversary */}
      <p style={{ fontSize: '8px', color: typeColor, margin: '0', fontFamily: 'Georgia, serif' }}>
        20th Anniversary Edition
      </p>

      {/* Gold line */}
      <div style={{ width: '55%', height: '0.5px', background: typeColor, margin: '4px 0 8px' }} />

      {/* Participant */}
      <p style={{
        fontSize: '7px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: '#999',
        margin: '0 0 10px',
      }}>
        Participant Name
      </p>

      {/* Bottom row: date info + QR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
        marginTop: 'auto',
      }}>
        <div style={{ fontSize: '7.5px', color: '#555', lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>eptember 2026</p>
          <p style={{ margin: 0 }}>epublica Moldova</p>
          <p style={{ margin: 0 }}>Leogrand</p>
          <p style={{ margin: 0 }}>Bvd. Varlaam 77</p>
        </div>

        {/* QR code SVG */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ background: '#fff', borderRadius: '2px', padding: '2px' }}>
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
          <p style={{ fontSize: '6px', color: '#aaa', margin: 0 }}>QR-code</p>
        </div>
      </div>

      {/* Type badge — right side vertical */}
      <span style={{
        position: 'absolute',
        right: '6px',
        top: '50%',
        transform: 'translateY(-50%) rotate(90deg)',
        fontSize: '7px',
        fontWeight: '600',
        color: typeColor,
        letterSpacing: '1px',
        transformOrigin: 'center',
        whiteSpace: 'nowrap',
      }}>
        {type}
      </span>
    </div>
  )
}

export default function ShopPage() {
  const [cart, setCart] = useState<number[]>([])
  const [added, setAdded] = useState<Record<number, boolean>>({})

  const addToCart = (id: number) => {
    setCart(prev => [...prev, id])
    setAdded(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [id]: false })), 1500)
  }

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', minHeight: '100vh', background: '#fff' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '64px',
        borderBottom: '1px solid #eee',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', fontSize: '16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: '1.5px solid #1a3a6b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#1a3a6b" strokeWidth="1.5"/>
              <path d="M20 10 L20 20 L27 25" stroke="#1a3a6b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          NoPainMoldova
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '14px', color: '#555' }}>
          {['Home', 'About us', 'Events', 'Members', 'Join us', 'Materials', 'Links', 'Contact us'].map(l => (
            <a key={l} href="#" style={{ color: '#555', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#111')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Cart icon with count */}
          <button style={{
            width: '34px', height: '34px', borderRadius: '50%',
            border: '1px solid #ddd', background: 'transparent',
            cursor: 'pointer', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cart.length > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#1a3a6b', color: '#fff',
                fontSize: '10px', width: '16px', height: '16px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cart.length}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ padding: '0 2rem 3rem' }}>

        {/* Breadcrumb */}
        <p style={{ fontSize: '13px', color: '#888', padding: '1rem 0 0', margin: 0 }}>
          <a href="#" style={{ color: '#1a3a6b', textDecoration: 'none' }}>Home</a>
          {' / '}Biletele
        </p>

        {/* Page title + meta */}
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: '22px', fontWeight: '400',
          margin: '0.5rem 0 0',
        }}>
          Biletele
        </h1>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 0',
          borderBottom: '1px solid #eee',
          marginBottom: '2rem',
        }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Showing all 3 results</span>
          <select style={{
            fontSize: '13px', border: '1px solid #ddd',
            borderRadius: '6px', padding: '4px 8px',
            background: '#fff', color: '#444',
          }}>
            <option>Default sorting</option>
            <option>Price: low to high</option>
            <option>Price: high to low</option>
          </select>
        </div>

        {/* Product grid — 3 columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          maxWidth: '900px',
        }}>
          {products.map(product => (
            <div key={product.id} style={{
              display: 'flex', flexDirection: 'column',
              border: '1px solid #eee',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <CertificatePreview type={product.type} typeColor={product.typeColor} />

              <div style={{ padding: '1rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 4px', lineHeight: 1.4 }}>
                  {product.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 12px' }}>
                  {product.price}
                </p>
                <button
                  onClick={() => addToCart(product.id)}
                  style={{
                    marginTop: 'auto',
                    padding: '10px 0',
                    background: added[product.id] ? '#2a6b3a' : '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {added[product.id] ? '✓ Added' : 'Add to cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#b8bfd4', padding: '2.5rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr 1fr',
          gap: '2rem',
          alignItems: 'start',
          maxWidth: '1200px',
        }}>
          <div>
            <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>NoPainMoldova</strong>
            <p style={{ fontSize: '12px', color: '#444', margin: 0 }}>Pain is not a fatality. Let's manage it.</p>
          </div>
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ background: '#fff', borderRadius: '4px' }}>
            <rect x="4" y="4" width="18" height="18" fill="none" stroke="#000" strokeWidth="1.5"/>
            <rect x="8" y="8" width="10" height="10" fill="#000"/>
            <rect x="34" y="4" width="18" height="18" fill="none" stroke="#000" strokeWidth="1.5"/>
            <rect x="38" y="8" width="10" height="10" fill="#000"/>
            <rect x="4" y="34" width="18" height="18" fill="none" stroke="#000" strokeWidth="1.5"/>
            <rect x="8" y="38" width="10" height="10" fill="#000"/>
            <rect x="34" y="34" width="8" height="8" fill="#000"/>
            <rect x="44" y="34" width="8" height="8" fill="#000"/>
            <rect x="34" y="44" width="8" height="8" fill="#000"/>
            <rect x="44" y="44" width="8" height="8" fill="#000"/>
          </svg>
          <address style={{ fontSize: '13px', color: '#333', lineHeight: 1.7, fontStyle: 'normal' }}>
            Bulgara 35 str., of. 11,<br />
            Chisinau, MD-2001<br />
            Moldova, Republic of
          </address>
          <div>
            <a href="mailto:mssmp.md@gmail.com" style={{ fontSize: '13px', color: '#222', display: 'block', marginBottom: '6px' }}>
              mssmp.md@gmail.com
            </a>
            {['Facebook', 'Instagram', 'Contact us'].map(l => (
              <a key={l} href="#" style={{ fontSize: '13px', color: '#222', display: 'block', marginBottom: '4px', textDecoration: 'none' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
      <div style={{ background: '#b8bfd4', borderTop: '1px solid rgba(0,0,0,0.1)', padding: '0.75rem 2rem', fontSize: '12px', color: '#555' }}>
        © 2022 All rights reserved
      </div>
    </div>
  )
}
