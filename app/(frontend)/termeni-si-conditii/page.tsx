'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaymentLogos from '@/components/PaymentLogos'
import { useCart } from '@/context/CartContext'

// Terms & Conditions page — required for maib e-commerce go-live.
// Covers every section maib mandates (general provisions, data protection,
// privacy, order & payment, delivery, returns/refunds, contact + legal details).
// NOTE: this is a working draft — have it reviewed/approved by whoever handles
// the association's legal and refund policy before relying on it.

const COMPANY = {
  legalName: 'Asociația Obștească „Societatea pentru Studiul și Combaterea Durerii din Moldova"',
  idno: '1021620007751',
  iban: 'MD35AG000000022517416798',
  bank: 'BC „MAIB" SA',
  address: 'Str. Bulgara 35, of. 11, Chișinău, MD-2001, Republica Moldova',
  email: 'mssmp.md@gmail.com',
  site: 'https://congress.nopainmoldova.org',
}

const H2: React.CSSProperties = {
  fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '20px',
  color: '#1a3a6b', margin: '2.2rem 0 0.75rem',
}
const P: React.CSSProperties = { fontSize: '15px', color: '#444', lineHeight: 1.75, margin: '0 0 0.9rem' }
const LI: React.CSSProperties = { fontSize: '15px', color: '#444', lineHeight: 1.7, marginBottom: '6px' }

export default function TermsPage() {
  const router = useRouter()
  const { cart } = useCart()

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={cart.length} onCartClick={() => router.push('/cart')} />

      <main style={{ flex: 1, maxWidth: '820px', width: '100%', margin: '0 auto', padding: '2.5rem 1.25rem 4rem', boxSizing: 'border-box' }}>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 1rem' }}>
          <Link href="/registration" style={{ color: '#1a3a6b', textDecoration: 'none' }}>Înregistrare</Link> {' / '} Termeni și Condiții
        </p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '30px', color: '#000', margin: '0 0 0.5rem' }}>
          Termeni și Condiții
        </h1>
        <p style={{ fontSize: '13px', color: '#999', margin: '0 0 1.5rem' }}>
          Ultima actualizare: {new Date().toLocaleDateString('ro-MD', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <h2 style={H2}>1. Dispoziții generale</h2>
        <p style={P}>
          Prezentul document stabilește termenii și condițiile de utilizare a website-ului {COMPANY.site} și de
          achiziționare online a taxelor de participare la congresul medical <strong>International Pain Congress (IPC) 2026</strong>,
          organizat de {COMPANY.legalName} (denumită în continuare „Organizatorul"). Prin plasarea unei comenzi și efectuarea
          plății, Clientul confirmă că a citit, a înțeles și acceptă integral prezentii termeni și condiții.
        </p>

        <h2 style={H2}>2. Serviciile oferite și prețuri</h2>
        <p style={P}>
          Prin intermediul website-ului se comercializează bilete de participare (taxe de înregistrare) la congresul IPC 2026,
          cu tarife diferențiate în funcție de categoria participantului (Student, Rezident/Doctor, Asistentă medicală) și
          workshop-uri opționale contra cost. Toate prețurile sunt afișate în lei moldovenești (<strong>MDL</strong>) și includ
          taxele aplicabile. Prețul final al comenzii este afișat înainte de confirmarea plății.
        </p>

        <h2 style={H2}>3. Plasarea comenzii și modalități de achitare</h2>
        <p style={P}>
          Comanda se plasează completând formularul de înregistrare și bifând acceptarea prezentilor Termeni și Condiții.
          Plata se efectuează online, în mod securizat, prin intermediul platformei de plăți <strong>maib</strong>, cu
          cardurile <strong>Visa</strong> și <strong>Mastercard</strong>. Datele cardului sunt introduse direct pe pagina
          securizată a băncii și nu sunt stocate de către Organizator.
        </p>
        <div style={{ margin: '0 0 0.9rem' }}>
          <PaymentLogos label="Metode de plată acceptate:" />
        </div>
        <p style={P}>
          După confirmarea plății, Clientul primește pe adresa de e-mail furnizată o confirmare a comenzii care conține
          numărul comenzii, denumirea Organizatorului, suma, moneda, data și detaliile biletului.
        </p>

        <h2 style={H2}>4. Livrarea biletelor</h2>
        <p style={P}>
          Serviciile comercializate sunt de natură digitală. Biletul oficial de participare este livrat electronic,
          în format PDF, atașat e-mailului de confirmare transmis imediat după înregistrarea reușită a plății. Nu se
          efectuează livrare fizică. Clientul este rugat să păstreze biletul și să îl prezinte la intrarea în eveniment.
          Dacă e-mailul nu este primit, vă rugăm verificați folderul Spam și contactați Organizatorul.
        </p>

        <h2 style={H2}>5. Politica de retur și rambursare</h2>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.9rem' }}>
          <li style={LI}>Cererile de rambursare se transmit în scris la adresa {COMPANY.email}, cu indicarea numărului comenzii.</li>
          <li style={LI}>Rambursările se efectuează pe același card cu care a fost efectuată plata, în conformitate cu procedurile băncii.</li>
          <li style={LI}>Solicitările de rambursare pot fi acceptate în cazul anulării evenimentului de către Organizator sau al unei erori de plată (dublă debitare).</li>
          <li style={LI}>Pentru anulările din partea participantului, condițiile de rambursare se stabilesc în funcție de data solicitării în raport cu data evenimentului.</li>
        </ul>

        <h2 id="confidentialitate" style={H2}>6. Protecția datelor cu caracter personal și confidențialitate</h2>
        <p style={P}>
          Organizatorul prelucrează datele cu caracter personal furnizate (nume, prenume, e-mail, telefon, adresă și date
          profesionale) exclusiv în scopul procesării înregistrării, emiterii biletului, comunicării legate de eveniment și
          îndeplinirii obligațiilor legale. Datele sunt prelucrate cu respectarea legislației Republicii Moldova privind
          protecția datelor cu caracter personal.
        </p>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.9rem' }}>
          <li style={LI}>Datele cardului bancar sunt procesate exclusiv de către maib și nu sunt stocate de Organizator.</li>
          <li style={LI}>Datele nu sunt vândute sau transmise terților în scopuri de marketing.</li>
          <li style={LI}>Clientul are dreptul de acces, rectificare și ștergere a datelor sale, prin solicitare la {COMPANY.email}.</li>
          <li style={LI}>Website-ul utilizează conexiune securizată HTTPS pentru protejarea informațiilor transmise.</li>
        </ul>

        <h2 style={H2}>7. Date de contact și informații juridice</h2>
        <div style={{ background: '#f7f8fa', border: '1px solid #eee', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
          <p style={{ ...P, margin: '0 0 6px' }}><strong>{COMPANY.legalName}</strong></p>
          <p style={{ ...P, margin: '0 0 4px' }}>IDNO: {COMPANY.idno}</p>
          <p style={{ ...P, margin: '0 0 4px' }}>IBAN: {COMPANY.iban} ({COMPANY.bank})</p>
          <p style={{ ...P, margin: '0 0 4px' }}>Adresă: {COMPANY.address}</p>
          <p style={{ ...P, margin: 0 }}>E-mail: <a href={`mailto:${COMPANY.email}`} style={{ color: '#1a3a6b' }}>{COMPANY.email}</a></p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
