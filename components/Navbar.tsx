"use client";
import React from 'react';
import Link from 'next/link';
import Image from "next/image";

const Navbar = ({ cartCount, onCartClick }: { cartCount: number; onCartClick?: () => void }) => {
  const navLinks = [
    { name: 'Acasă',       href: 'https://nopainmoldova.org/' },
    { name: 'Despre noi',  href: 'https://nopainmoldova.org/about-us/' },
    { name: 'Evenimente',  href: 'https://nopainmoldova.org/events/' },
    { name: 'Contact',     href: 'https://nopainmoldova.org/contact/' },
  ];

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '64px', borderBottom: '1px solid #eee',
      background: '#fff', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          border: '1px solid #ddd', overflow: 'hidden', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Image src="/images/logo.jpg" alt="NoPainMoldova" width={34} height={34}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }} priority />
        </div>
        <p style={{ color: '#000', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>NoPainMoldova</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '14px' }}>
        {navLinks.map(link => (
          <Link key={link.name} href={link.href} style={{ color: '#555', textDecoration: 'none', fontWeight: '500' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1a3a6b')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >{link.name}</Link>
        ))}
      </div>

      <button onClick={onCartClick} style={{
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
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#1a3a6b', color: '#fff',
            fontSize: '10px', width: '16px', height: '16px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{cartCount}</span>
        )}
      </button>
    </nav>
  );
};

export default Navbar;