'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { name: 'Acasă',      href: 'https://nopainmoldova.org/' },
  { name: 'Despre noi', href: 'https://nopainmoldova.org/about-us/' },
  { name: 'Evenimente', href: 'https://nopainmoldova.org/events/' },
  { name: 'Contact',    href: 'https://nopainmoldova.org/contact/' },
]

const Navbar = ({ cartCount, onCartClick }: { cartCount: number; onCartClick?: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', height: '60px', borderBottom: '1px solid #eee',
        background: '#fff', position: 'sticky', top: 0, zIndex: 200,
      }}>
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            border: '1px solid #ddd', overflow: 'hidden', flexShrink: 0,
          }}>
            <Image src="/images/logo.jpg" alt="NoPainMoldova" width={34} height={34}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }} priority />
          </div>
          <p style={{ color: '#000', margin: 0, fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap' }}>
            NoPainMoldova
          </p>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '14px' }}>
            {navLinks.map(link => (
              <Link key={link.name} href={link.href}
                style={{ color: '#555', textDecoration: 'none', fontWeight: '500' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1a3a6b')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              >{link.name}</Link>
            ))}
          </div>
        )}

        {/* Right side: cart + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Cart button */}
          <button onClick={onCartClick} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            border: '1px solid #ddd', background: 'transparent',
            cursor: 'pointer', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#1a3a6b', color: '#fff',
                fontSize: '10px', width: '16px', height: '16px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid #eee', background: 'transparent',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '5px',
                padding: '6px', flexShrink: 0,
              }}
              aria-label="Meniu"
            >
              {/* Three bars animate to X when open */}
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block', width: '18px', height: '1.5px',
                  background: '#333', borderRadius: '2px',
                  transition: 'all 0.2s',
                  transform: menuOpen
                    ? i === 0 ? 'translateY(6.5px) rotate(45deg)'
                    : i === 2 ? 'translateY(-6.5px) rotate(-45deg)'
                    : 'scaleX(0)'
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed', top: '60px', left: 0, right: 0,
            background: '#fff', borderBottom: '1px solid #eee',
            zIndex: 199, padding: '8px 0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', padding: '13px 1.25rem',
                fontSize: '15px', fontWeight: '500', color: '#222',
                textDecoration: 'none', borderBottom: '1px solid #f5f5f5',
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default Navbar