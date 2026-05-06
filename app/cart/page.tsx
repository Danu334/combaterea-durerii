'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { useCart, TicketType } from '@/context/CartContext'

type HandzoneOption = 'none' | 'botulinum' | 'locoregional' | 'locoregional-periop'

interface BaseForm {
  email: string; nume: string; prenume: string
  adresa: string; telefon: string; handzone: HandzoneOption
}
interface StudentForm extends BaseForm { carnetId: string }
interface DoctorForm  extends BaseForm { spital: string; specialitate: string }
interface NurseForm   extends BaseForm { spital: string; sectie: string }
type AnyForm = StudentForm | DoctorForm | NurseForm

const HANDZONE_PRICE = 1000

const HANDZONE_OPTIONS: { value: HandzoneOption; label: string }[] = [
  { value: 'botulinum',           label: 'Workshop – Botulinum Toxin in Pain Management' },
  { value: 'locoregional',        label: 'Workshop – Locoregional techniques' },
  { value: 'locoregional-periop', label: 'Workshop – Locoregional techniques for perioperative pain management' },
]

function defaultForm(type: TicketType): AnyForm {
  const base: BaseForm = { email: '', nume: '', prenume: '', adresa: '', telefon: '', handzone: 'none' }
  if (type === 'Student')  return { ...base, carnetId: '' }
  if (type === 'Resident') return { ...base, spital: '', specialitate: '' }
  return { ...base, spital: '', sectie: '' }
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0',
  borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', background: '#fafafa',
}
const labelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: '600', color: '#555', letterSpacing: '0.5px',
  textTransform: 'uppercase', marginBottom: '5px', display: 'block',
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input {...props}
        style={{ ...inputStyle, borderColor: focused ? '#1a3a6b' : '#e0e0e0', background: focused ? '#fff' : '#fafafa' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </div>
  )
}

function TicketForm({ ticketType, ticketName, index, value, onChange }: {
  ticketType: TicketType; ticketName: string; index: number
  value: AnyForm; onChange: (v: AnyForm) => void
}) {
  const set = (field: string, val: string | boolean) => onChange({ ...value, [field]: val } as AnyForm)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = value as unknown as Record<string, any>
  const typeLabel: Record<TicketType, string> = { Student: 'Student', Resident: 'Rezident / Doctor', Nurse: 'Asistentă' }

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a3a6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>{index + 1}</div>
        <div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#000' }}>{ticketName}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{typeLabel[ticketType]}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
        <Field label="Nume" placeholder="ex. Popescu" value={v.nume || ''} onChange={e => set('nume', e.target.value)} required />
        <Field label="Prenume" placeholder="ex. Ion" value={v.prenume || ''} onChange={e => set('prenume', e.target.value)} required />
      </div>
      <Field label="Email" type="email" placeholder="exemplu@email.com" value={v.email || ''} onChange={e => set('email', e.target.value)} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
        <Field label="Telefon" type="tel" placeholder="+373 6X XXX XXX" value={v.telefon || ''} onChange={e => set('telefon', e.target.value)} required />
        <Field label="Adresă" placeholder="Strada, Nr., Orașul" value={v.adresa || ''} onChange={e => set('adresa', e.target.value)} required />
      </div>

      {ticketType === 'Student' && <Field label="Nr. Carnet de Student" placeholder="ex. S-2024-00123" value={v.carnetId || ''} onChange={e => set('carnetId', e.target.value)} required />}
      {ticketType === 'Resident' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <Field label="Spital / Instituție" placeholder="ex. IMSP SCM Nr. 1" value={v.spital || ''} onChange={e => set('spital', e.target.value)} required />
          <Field label="Specialitate" placeholder="ex. Anestezie și Reanimatologie" value={v.specialitate || ''} onChange={e => set('specialitate', e.target.value)} required />
        </div>
      )}
      {ticketType === 'Nurse' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <Field label="Spital / Instituție" placeholder="ex. IMSP SCM Nr. 1" value={v.spital || ''} onChange={e => set('spital', e.target.value)} required />
          <Field label="Secție" placeholder="ex. Terapie Intensivă" value={v.sectie || ''} onChange={e => set('sectie', e.target.value)} required />
        </div>
      )}

      <div style={{ marginTop: '8px' }}>
        <p style={{ ...labelStyle, marginBottom: '10px' }}>
          Adaugă un Handzone Workshop
          <span style={{ marginLeft: '8px', background: '#c9a84c', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', textTransform: 'none', letterSpacing: 0 }}>
            +1.000 MDL / workshop
          </span>
        </p>
        <div onClick={() => set('handzone', 'none')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', marginBottom: '8px', borderRadius: '10px', border: `1.5px solid ${v.handzone === 'none' ? '#1a3a6b' : '#e8e8e8'}`, background: v.handzone === 'none' ? '#f0f4ff' : '#f9f9f9', cursor: 'pointer', userSelect: 'none' }}>
          <Radio selected={v.handzone === 'none'} />
          <span style={{ fontSize: '13px', color: '#555' }}>Fără workshop</span>
        </div>
        {HANDZONE_OPTIONS.map(opt => (
          <div key={opt.value} onClick={() => set('handzone', opt.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', marginBottom: '8px', borderRadius: '10px', border: `1.5px solid ${v.handzone === opt.value ? '#1a3a6b' : '#e8e8e8'}`, background: v.handzone === opt.value ? '#f0f4ff' : '#f9f9f9', cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s' }}>
            <Radio selected={v.handzone === opt.value} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#000', lineHeight: 1.4 }}>{opt.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#c9a84c', fontWeight: '600' }}>+1.000,00 MDL</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${selected ? '#1a3a6b' : '#ccc'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s', marginTop: '1px' }}>
      {selected && <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#1a3a6b' }} />}
    </div>
  )
}

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()
  const router = useRouter()
  const [forms, setForms] = useState<AnyForm[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])
  useEffect(() => {
    if (!hydrated) return
    setForms(prev => cart.map((item, i) => prev[i] ?? defaultForm(item.type)))
  }, [cart, hydrated])

  const updateForm = (i: number, val: AnyForm) =>
    setForms(prev => prev.map((f, idx) => (idx === i ? val : f)))

  const ticketTotal = cart.reduce((sum, item) => sum + item.priceNum, 0)
  const handzoneCount = forms.filter(f => f.handzone !== 'none').length
  const handzoneTotal = handzoneCount * HANDZONE_PRICE
  const total = ticketTotal + handzoneTotal
  const formatMDL = (n: number) => n.toLocaleString('ro-MD', { minimumFractionDigits: 2 }) + ' MDL'

  const getHandzoneLabel = (val: HandzoneOption) => {
    if (val === 'none') return null
    return HANDZONE_OPTIONS.find(o => o.value === val)?.label ?? val
  }

  // ─── Validate all forms before submit ─────────────────────────────────────
  function validateForms(): string | null {
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f = forms[i] as any
      const label = `Bilet ${i + 1} (${item.name})`

      if (!f.nume?.trim())    return `${label}: completează Numele`
      if (!f.prenume?.trim()) return `${label}: completează Prenumele`
      if (!f.email?.trim() || !f.email.includes('@')) return `${label}: email invalid`
      if (!f.telefon?.trim()) return `${label}: completează Telefonul`
      if (!f.adresa?.trim())  return `${label}: completează Adresa`

      if (item.type === 'Student' && !f.carnetId?.trim())
        return `${label}: completează Nr. Carnet de Student`
      if (item.type === 'Resident') {
        if (!f.spital?.trim())       return `${label}: completează Spitalul`
        if (!f.specialitate?.trim()) return `${label}: completează Specialitatea`
      }
      if (item.type === 'Nurse') {
        if (!f.spital?.trim()) return `${label}: completează Spitalul`
        if (!f.sectie?.trim()) return `${label}: completează Secția`
      }
    }
    return null
  }

  // ─── Submit — save to Neon DB ──────────────────────────────────────────────
 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
 
    const validationError = validateForms()
    if (validationError) {
      setError(validationError)
      return
    }
 
    setLoading(true)
 
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, forms }),
      })
 
      const data = await res.json()
      console.log('Register response:', data) // temporary debug
 
      if (data.ok && data.checkoutUrl) {
        clearCart()
        window.location.href = data.checkoutUrl  // ← redirect to MAIB
      } else {
        setError(data.error ?? 'Eroare la înregistrare. Încearcă din nou.')
      }
    } catch {
      setError('Eroare de conexiune. Verifică internetul și încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }
 

  const pageWrap: React.CSSProperties = {
    fontFamily: '"DM Sans", sans-serif',
    minHeight: '100vh', background: '#fff',
    display: 'flex', flexDirection: 'column',
  }
  const growMain: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexDirection: 'column', padding: '4rem 2rem',
  }

  if (!hydrated) return (
    <div style={pageWrap}>
      <Navbar cartCount={0} onCartClick={() => router.push('/cart')} />
      <main style={growMain}><p style={{ color: '#888' }}>Se încarcă...</p></main>
      <Footer />
    </div>
  )

  if (cart.length === 0 && !submitted) return (
    <div style={pageWrap}>
      <Navbar cartCount={0} onCartClick={() => router.push('/cart')} />
      <main style={{ ...growMain, textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '1.25rem' }}>🛒</div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: '400', fontSize: '28px', marginBottom: '0.75rem', color: '#000' }}>Coșul este gol</h1>
        <p style={{ color: '#888', marginBottom: '2rem', fontSize: '15px' }}>Nu ai adăugat niciun bilet încă.</p>
        <Link href="/shop" style={{ background: '#1a3a6b', color: '#fff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>← Înapoi la bilete</Link>
      </main>
      <Footer />
    </div>
  )

  if (submitted) return (
    <div style={pageWrap}>
      <Navbar cartCount={0} onCartClick={() => router.push('/cart')} />
      <main style={{ ...growMain, textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#e8f5e9', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16l7 7 13-13" stroke="#2a6b3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: '400', fontSize: '28px', marginBottom: '0.5rem', color: '#000' }}>Înregistrare reușită!</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Vei primi confirmarea pe email în câteva minute.</p>
        <Link href="/shop" style={{ background: '#1a3a6b', color: '#fff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>← Înapoi la bilete</Link>
      </main>
      <Footer />
    </div>
  )

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', minHeight: '100vh', background: '#f7f8fa' }}>
      <Navbar cartCount={cart.length} onCartClick={() => router.push('/cart')} />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 1.5rem' }}>
          <Link href="/shop" style={{ color: '#1a3a6b', textDecoration: 'none' }}>Biletele</Link> {' / '} Coș
        </p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', fontWeight: '400', margin: '0 0 2rem', color: '#000' }}>Coșul meu</h1>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#c0392b' }}>{error}</p>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '16px', padding: '2px 6px' }}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            <div>
              {cart.map((item, i) => (
                <div key={`${item.id}-${i}`} style={{ position: 'relative' }}>
                  {forms[i] && <TicketForm ticketType={item.type} ticketName={item.name} index={i} value={forms[i]} onChange={val => updateForm(i, val)} />}
                  <button type="button"
                    onClick={() => { removeFromCart(item.id); setForms(prev => prev.filter((_, idx) => idx !== i)) }}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '18px', lineHeight: 1, padding: '4px' }}
                    title="Șterge">✕</button>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', position: 'sticky', top: '80px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1.25rem', color: '#000' }}>Sumar comandă</h2>

              {cart.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#555' }}>{item.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.price}</span>
                  </div>
                  {forms[i] && forms[i].handzone !== 'none' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#888', maxWidth: '180px', lineHeight: 1.3 }}>+ {getHandzoneLabel(forms[i].handzone as HandzoneOption)}</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#c9a84c', whiteSpace: 'nowrap', marginLeft: '8px' }}>+1.000 MDL</span>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a3a6b' }}>{formatMDL(total)}</span>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ marginTop: '1.5rem', width: '100%', padding: '14px', background: loading ? '#888' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
                {loading ? 'Se salvează...' : 'Finalizează înregistrarea →'}
              </button>
              <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', marginTop: '12px' }}>Datele tale sunt salvate securizat.</p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

