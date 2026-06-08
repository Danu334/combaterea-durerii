'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { useCart, TicketType } from '@/context/CartContext'

const SATELLITE_CAPACITY = 30
const SATELLITE_WORKSHOPS = [
  {
    id: 'y2y',
    label: 'Young to Young',
    description: 'Y2Y este un program pentru tineri profesioniști, axat pe colaborare, explorarea tehnologiilor și metodologiilor moderne, înțelegerea bazelor cercetării și dezvoltarea abilităților de orientare în spațiul informațional actual.',
    location: 'Digital Park, Technology Hall',
    date: '2 octombrie, 14:00–17:00',
  },
  {
    id: 'imagistica',
    label: 'Bazele Imagisticii pentru Kinetoterapeuți',
    description: 'Workshop dedicat kinetoterapeuților, axat pe înțelegerea și aplicarea bazelor imagisticii medicale pentru o evaluare mai precisă și o planificare eficientă a intervențiilor terapeutice.',
    location: 'TBA',
    date: 'TBA',
  },
]

type HandzoneOption = 'none' | 'botulinum' | 'locoregional' | 'locoregional-periop'
type SatelliteOption = 'none' | 'y2y' | 'imagistica'

interface BaseForm {
  email: string; nume: string; prenume: string
  adresa: string; telefon: string
  handzone: HandzoneOption
  satellite: SatelliteOption
}
interface StudentForm extends BaseForm { carnetId: string }
interface DoctorForm  extends BaseForm { spital: string; specialitate: string }
interface NurseForm   extends BaseForm { spital: string; sectie: string }
type AnyForm = StudentForm | DoctorForm | NurseForm

const HANDZONE_PRICE = 1000

const HANDZONE_OPTIONS: { value: HandzoneOption; label: string; description: string; speaker: string; location: string; date: string }[] = [
  {
    value: 'botulinum',
    label: 'Botulinum Toxin in Pain Management',
    description: 'Workshop practic dedicat utilizării toxinei botulinice în managementul durerii, cu accent pe indicații clinice, tehnici de administrare și abordări moderne intervenționale.',
    speaker: 'Nadyi Segin',
    location: 'Medpark Hospital',
    date: '1 octombrie, 09:00–17:00',
  },
  {
    value: 'locoregional-periop',
    label: 'Locoregional Techniques for Perioperative Pain Management',
    description: 'Workshop practic axat pe tehnici loco-regionale moderne utilizate în managementul durerii perioperatorii, incluzând principii ecoghidate și aplicații clinice actuale.',
    speaker: 'Hande Gurbuz (Turcia)',
    location: 'Medpark Hospital',
    date: '1 octombrie, 09:00–17:00',
  },
  {
    value: 'locoregional',
    label: 'Locoregional Techniques',
    description: 'Sesiune practică dedicată tehnicilor loco-regionale, orientată spre dezvoltarea abilităților practice și familiarizarea cu abordările contemporane în anestezia regională.',
    speaker: 'TBA',
    location: 'Medpark Hospital',
    date: '1 octombrie, 09:00–17:00',
  },
]

function defaultForm(type: TicketType): AnyForm {
  const base: BaseForm = { email: '', nume: '', prenume: '', adresa: '', telefon: '', handzone: 'none', satellite: 'none' }
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

function Radio({ selected }: { selected: boolean }) {
  return (
    <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${selected ? '#1a3a6b' : '#ccc'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s', marginTop: '1px' }}>
      {selected && <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#1a3a6b' }} />}
    </div>
  )
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, border: `2px solid ${checked ? '#1a3a6b' : '#ccc'}`, background: checked ? '#1a3a6b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', marginTop: '1px' }}>
      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  )
}

function TicketForm({ ticketType, ticketName, index, value, onChange, isMobile, satelliteCounts }: {
  ticketType: TicketType; ticketName: string; index: number
  value: AnyForm; onChange: (v: AnyForm) => void; isMobile: boolean
  satelliteCounts: Record<string, number>
}) {
  const set = (field: string, val: string) => onChange({ ...value, [field]: val } as AnyForm)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = value as unknown as Record<string, any>
  const typeLabel: Record<TicketType, string> = { Student: 'Student', Resident: 'Rezident / Doctor', Nurse: 'Asistentă' }
  const twoCol: React.CSSProperties = isMobile
    ? { display: 'grid', gridTemplateColumns: '1fr', gap: 0 }
    : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }

  const isStudent = ticketType === 'Student'

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: isMobile ? '1.1rem' : '2rem', marginBottom: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a3a6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>{index + 1}</div>
        <div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#000' }}>{ticketName}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{typeLabel[ticketType]}</p>
        </div>
      </div>

      {/* Fields */}
      <div style={twoCol}>
        <Field label="Nume" placeholder="ex. Popescu" value={v.nume || ''} onChange={e => set('nume', e.target.value)} required />
        <Field label="Prenume" placeholder="ex. Ion" value={v.prenume || ''} onChange={e => set('prenume', e.target.value)} required />
      </div>
      <Field label="Email" type="email" placeholder="exemplu@email.com" value={v.email || ''} onChange={e => set('email', e.target.value)} required />
      <div style={twoCol}>
        <Field label="Telefon" type="tel" placeholder="+373 6X XXX XXX" value={v.telefon || ''} onChange={e => set('telefon', e.target.value)} required />
        <Field label="Adresă" placeholder="Strada, Nr., Orașul" value={v.adresa || ''} onChange={e => set('adresa', e.target.value)} required />
      </div>

      {ticketType === 'Student' && (
        <Field label="Nr. Carnet de Student" placeholder="ex. S-2024-00123" value={v.carnetId || ''} onChange={e => set('carnetId', e.target.value)} required />
      )}
      {ticketType === 'Resident' && (
        <div style={twoCol}>
          <Field label="Spital / Instituție" placeholder="ex. IMSP SCM Nr. 1" value={v.spital || ''} onChange={e => set('spital', e.target.value)} required />
          <Field label="Specialitate" placeholder="ex. Anestezie și Reanimatologie" value={v.specialitate || ''} onChange={e => set('specialitate', e.target.value)} required />
        </div>
      )}
      {ticketType === 'Nurse' && (
        <div style={twoCol}>
          <Field label="Spital / Instituție" placeholder="ex. IMSP SCM Nr. 1" value={v.spital || ''} onChange={e => set('spital', e.target.value)} required />
          <Field label="Secție" placeholder="ex. Terapie Intensivă" value={v.sectie || ''} onChange={e => set('sectie', e.target.value)} required />
        </div>
      )}

      {/* ── Satellite Workshops (free, max 30 spots, shown before paid) ── */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ ...labelStyle, marginBottom: '10px' }}>
          Workshopuri Satellite
          <span style={{ marginLeft: '8px', background: '#2a6b3a', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', textTransform: 'none', letterSpacing: 0 }}>
            Gratuit
          </span>
        </p>
        <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px', lineHeight: 1.4 }}>
          Selectează un workshop satellite (locuri limitate – max. {SATELLITE_CAPACITY} persoane).
        </p>

        {/* "None" option */}
        <div onClick={() => set('satellite', 'none')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', marginBottom: '8px', borderRadius: '10px', border: `1.5px solid ${v.satellite === 'none' ? '#1a3a6b' : '#e8e8e8'}`, background: v.satellite === 'none' ? '#f0f4ff' : '#f9f9f9', cursor: 'pointer', userSelect: 'none' }}>
          <Radio selected={v.satellite === 'none'} />
          <span style={{ fontSize: '13px', color: '#555' }}>Fără workshop satellite</span>
        </div>

        {SATELLITE_WORKSHOPS.map(sw => {
          const count = satelliteCounts[sw.id] ?? 0
          const spotsLeft = SATELLITE_CAPACITY - count
          const isFull = spotsLeft <= 0
          const isSelected = v.satellite === sw.id

          return (
            <div
              key={sw.id}
              onClick={() => !isFull && set('satellite', sw.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', marginBottom: '8px',
                borderRadius: '10px', border: `1.5px solid ${isSelected ? '#1a3a6b' : isFull ? '#f0e0e0' : '#e8e8e8'}`,
                background: isSelected ? '#f0f4ff' : isFull ? '#fff8f8' : '#f9f9f9',
                cursor: isFull ? 'not-allowed' : 'pointer', userSelect: 'none', transition: 'all 0.15s',
                opacity: isFull ? 0.85 : 1,
              }}
            >
              <Radio selected={isSelected} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: isFull ? '#999' : '#000', lineHeight: 1.4 }}>{sw.label}</p>
                  {isFull ? (
                    <span style={{ fontSize: '11px', background: '#c0392b', color: '#fff', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>Locuri epuizate</span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#2a6b3a', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>{spotsLeft} locuri rămase</span>
                  )}
                </div>
                <p style={{ margin: '4px 0 2px', fontSize: '12px', color: '#777', lineHeight: 1.4 }}>{sw.description}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>📍 {sw.location} &nbsp;·&nbsp; 🗓 {sw.date}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Hands-on Workshops (paid, hidden for students) ── */}
      {!isStudent && (
        <div style={{ marginTop: '8px' }}>
          <p style={{ ...labelStyle, marginBottom: '10px' }}>
            Adaugă un Hands-on Workshop
            <span style={{ marginLeft: '8px', background: '#c9a84c', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', textTransform: 'none', letterSpacing: 0 }}>
              +1.000 MDL / workshop
            </span>
          </p>
          <div onClick={() => set('handzone', 'none')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', marginBottom: '8px', borderRadius: '10px', border: `1.5px solid ${v.handzone === 'none' ? '#1a3a6b' : '#e8e8e8'}`, background: v.handzone === 'none' ? '#f0f4ff' : '#f9f9f9', cursor: 'pointer', userSelect: 'none' }}>
            <Radio selected={v.handzone === 'none'} />
            <span style={{ fontSize: '13px', color: '#555' }}>Fără workshop cu plată</span>
          </div>
          {HANDZONE_OPTIONS.map(opt => (
            <div key={opt.value} onClick={() => set('handzone', opt.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', marginBottom: '8px', borderRadius: '10px', border: `1.5px solid ${v.handzone === opt.value ? '#1a3a6b' : '#e8e8e8'}`, background: v.handzone === opt.value ? '#f0f4ff' : '#f9f9f9', cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s' }}>
              <Radio selected={v.handzone === opt.value} />
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#000', lineHeight: 1.4 }}>{opt.label}</p>
                <p style={{ margin: '3px 0 3px', fontSize: '12px', color: '#777', lineHeight: 1.4 }}>{opt.description}</p>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#999' }}>🎤 {opt.speaker} &nbsp;·&nbsp; 📍 {opt.location} &nbsp;·&nbsp; 🗓 {opt.date}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#c9a84c', fontWeight: '600' }}>+1.000,00 MDL</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isStudent && (
        <div style={{ background: '#f0f4ff', border: '1px solid #d0d8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#555' }}>
          💡 Workshopurile cu plată nu sunt disponibile pentru înregistrarea de tip Student.
        </div>
      )}
    </div>
  )
}

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [forms, setForms] = useState<AnyForm[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [satelliteCounts, setSatelliteCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    setHydrated(true)
    fetch('/api/satellite-capacity')
      .then(r => r.json())
      .then(data => setSatelliteCounts(data))
      .catch(() => {})
  }, [])

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

  function validateForms(): string | null {
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f = forms[i] as any
      const label = `Înregistrare ${i + 1} (${item.name})`
      if (!f.nume?.trim())    return `${label}: completează Numele`
      if (!f.prenume?.trim()) return `${label}: completează Prenumele`
      if (!f.email?.trim() || !f.email.includes('@')) return `${label}: email invalid`
      if (!f.telefon?.trim()) return `${label}: completează Telefonul`
      const phoneDigits = f.telefon.replace(/\D/g, '')
      if (phoneDigits.length < 8 || phoneDigits.length > 12) return `${label}: număr de telefon invalid (ex. 069123456)`
      if (!f.adresa?.trim())  return `${label}: completează Adresa`
      if (item.type === 'Student' && !f.carnetId?.trim()) return `${label}: completează Nr. Carnet de Student`
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const validationError = validateForms()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, forms }),
      })
      const data = await res.json()
      if (data.ok && data.checkoutUrl) {
        clearCart()
        window.location.href = data.checkoutUrl
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
    fontFamily: '"DM Sans", sans-serif', minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column',
  }
  const growMain: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '4rem 2rem',
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
      <main style={{ ...growMain, textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '56px', marginBottom: '1.25rem' }}>🛒</div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: '400', fontSize: isMobile ? '22px' : '28px', marginBottom: '0.75rem', color: '#000' }}>Coșul este gol</h1>
        <p style={{ color: '#888', marginBottom: '2rem', fontSize: '15px' }}>Nu ai adăugat niciun bilet încă.</p>
        <Link href="/registration" style={{ background: '#1a3a6b', color: '#fff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>← Înapoi la înregistrare</Link>
      </main>
      <Footer />
    </div>
  )

  if (submitted) return (
    <div style={pageWrap}>
      <Navbar cartCount={0} onCartClick={() => router.push('/cart')} />
      <main style={{ ...growMain, textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#e8f5e9', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16l7 7 13-13" stroke="#2a6b3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: '400', fontSize: isMobile ? '22px' : '28px', marginBottom: '0.5rem', color: '#000' }}>Înregistrare reușită!</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Vei primi confirmarea pe email în câteva minute.</p>
        <Link href="/registration" style={{ background: '#1a3a6b', color: '#fff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>← Înapoi la înregistrare</Link>
      </main>
      <Footer />
    </div>
  )

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', minHeight: '100vh', background: '#f7f8fa' }}>
      <Navbar cartCount={cart.length} onCartClick={() => router.push('/cart')} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '1.25rem 1rem 5rem' : '2rem 2rem 5rem' }}>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 1.25rem' }}>
          <Link href="/registration" style={{ color: '#1a3a6b', textDecoration: 'none' }}>Înregistrare</Link> {' / '} Coș
        </p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: isMobile ? '22px' : '28px', fontWeight: '400', margin: '0 0 1.5rem', color: '#000' }}>Coșul meu</h1>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#c0392b', flex: 1 }}>{error}</p>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '16px', padding: '2px 6px' }}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isMobile ? (
            <div>
              {cart.map((item, i) => (
                <div key={`${item.id}-${i}`} style={{ position: 'relative' }}>
                  {forms[i] && (
                    <TicketForm
                      ticketType={item.type} ticketName={item.name} index={i}
                      value={forms[i]} onChange={val => updateForm(i, val)}
                      isMobile={true} satelliteCounts={satelliteCounts}
                    />
                  )}
                  <button type="button"
                    onClick={() => { removeFromCart(item.id); setForms(prev => prev.filter((_, idx) => idx !== i)) }}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '18px', lineHeight: 1, padding: '4px' }}
                    title="Șterge">✕</button>
                </div>
              ))}

              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.1rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 1rem', color: '#000' }}>Sumar comandă</h2>
                {cart.map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#555' }}>{item.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.price}</span>
                    </div>
                    {forms[i] && forms[i].handzone !== 'none' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#888', flex: 1, lineHeight: 1.3, paddingRight: '8px' }}>+ {getHandzoneLabel(forms[i].handzone as HandzoneOption)}</span>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#c9a84c', whiteSpace: 'nowrap' }}>+1.000 MDL</span>
                      </div>
                    )}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {forms[i] && (forms[i] as any).satellite && (forms[i] as any).satellite !== 'none' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#2a6b3a', flex: 1, lineHeight: 1.3, paddingRight: '8px' }}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          🌿 {SATELLITE_WORKSHOPS.find(sw => sw.id === (forms[i] as any).satellite)?.label}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#2a6b3a', whiteSpace: 'nowrap' }}>Gratuit</span>
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a3a6b' }}>{formatMDL(total)}</span>
                </div>
              </div>

              <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: '#fff', borderTop: '1px solid #eee', padding: '12px 16px', boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#888' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
                  {loading ? 'Se salvează...' : `Finalizează înregistrarea — ${formatMDL(total)}`}
                </button>
                <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', margin: '6px 0 0' }}>Datele tale sunt salvate securizat.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
              <div>
                {cart.map((item, i) => (
                  <div key={`${item.id}-${i}`} style={{ position: 'relative' }}>
                    {forms[i] && (
                      <TicketForm
                        ticketType={item.type} ticketName={item.name} index={i}
                        value={forms[i]} onChange={val => updateForm(i, val)}
                        isMobile={false} satelliteCounts={satelliteCounts}
                      />
                    )}
                    <button type="button"
                      onClick={() => { removeFromCart(item.id); setForms(prev => prev.filter((_, idx) => idx !== i)) }}
                      style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '18px', lineHeight: 1, padding: '4px' }}
                      title="Șterge">✕</button>
                  </div>
                ))}
              </div>

              {/* Sticky sidebar */}
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {forms[i] && (forms[i] as any).satellite && (forms[i] as any).satellite !== 'none' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '8px' }}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <span style={{ fontSize: '11px', color: '#2a6b3a', maxWidth: '180px', lineHeight: 1.3 }}>🌿 {SATELLITE_WORKSHOPS.find(sw => sw.id === (forms[i] as any).satellite)?.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#2a6b3a', whiteSpace: 'nowrap', marginLeft: '8px' }}>Gratuit</span>
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
          )}
        </form>
      </main>
      <Footer />
    </div>
  )
}