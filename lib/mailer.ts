// lib/mailer.ts
import nodemailer from 'nodemailer'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

const HANDZONE_LABELS: Record<string, string> = {
  botulinum:             'Workshop - Botulinum Toxin in Pain Management',
  locoregional:          'Workshop - Locoregional Techniques',
  'locoregional-periop': 'Workshop - Locoregional Techniques for Perioperative Pain Management',
}

const SATELLITE_LABELS: Record<string, string> = {
  y2y:        'Young to Young',
  imagistica: 'Bazele Imagisticii pentru Kinetoterapeuti',
}

// ─── Colours ──────────────────────────────────────────────────────────────────
const NAVY  = rgb(0.102, 0.227, 0.420)   // #1a3a6b
const GOLD  = rgb(0.788, 0.659, 0.298)   // #c9a84c
const CREAM = rgb(0.961, 0.949, 0.922)   // #f5f2eb
const WHITE = rgb(1, 1, 1)
const GREY  = rgb(0.333, 0.333, 0.333)
const LIGHT = rgb(0.600, 0.600, 0.600)
const GREEN = rgb(0.165, 0.420, 0.231)   // #2a6b3a (satellite green)

// ─── Font cache (fetched once per cold start, reused across warm invocations) ─
let fontCache: { regular: Uint8Array; bold: Uint8Array; italic: Uint8Array } | null = null

async function getFonts() {
  if (fontCache) return fontCache

  const [regular, bold, italic] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Regular.ttf').then(r => r.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Bold.ttf').then(r => r.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Italic.ttf').then(r => r.arrayBuffer()),
  ])

  fontCache = {
    regular: new Uint8Array(regular),
    bold:    new Uint8Array(bold),
    italic:  new Uint8Array(italic),
  }
  return fontCache
}

// ─── Generate PDF buffer ──────────────────────────────────────────────────────
export async function buildTicketPdf(ticket: {
  id: number
  prenume: string
  nume: string
  email: string
  ticket_type: string
  price_mdl: number
  handzone: string
  satellite_workshop?: string
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  // A5 landscape-ish card: 500 × 320 pt
  const W = 500, H = 320
  const page = pdfDoc.addPage([W, H])

  // ── Embed Unicode-capable fonts (supports ș, ț, ă, î, â) ──────────────────
  const fonts = await getFonts()
  const fontRegular = await pdfDoc.embedFont(fonts.regular, { subset: true })
  const fontBold    = await pdfDoc.embedFont(fonts.bold,    { subset: true })
  const fontItalic  = await pdfDoc.embedFont(fonts.italic,  { subset: true })
  const fontHelv    = fontRegular
  const fontHelvB   = fontBold

  // ── Background ──────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM })

  // ── Navy header band (top) ───────────────────────────────────────────────────
  const HEADER_H = 90
  page.drawRectangle({ x: 0, y: H - HEADER_H, width: W, height: HEADER_H, color: NAVY })

  // Ticket type label (gold, small caps, top-left of header)
  const typeLabels: Record<string, string> = {
    Student: 'STUDENT', Resident: 'REZIDENT / DOCTOR', Nurse: 'ASISTENTA MEDICALA',
  }
  page.drawText(typeLabels[ticket.ticket_type] ?? ticket.ticket_type.toUpperCase(), {
    x: 28, y: H - 22, font: fontHelvB, size: 8, color: GOLD,
  })

  // Congress title (white, centred)
  const title = 'International Pain Congress 2026'
  const titleW = fontBold.widthOfTextAtSize(title, 16)
  page.drawText(title, {
    x: (W - titleW) / 2, y: H - 46, font: fontBold, size: 16, color: WHITE,
  })

  // Edition subtitle (gold italic, centred)
  const edition = '20th Anniversary Edition'
  const editionW = fontItalic.widthOfTextAtSize(edition, 11)
  page.drawText(edition, {
    x: (W - editionW) / 2, y: H - 64, font: fontItalic, size: 11, color: GOLD,
  })

  // Stars (gold, centred)
  const stars = '* * * * *'
  const starsW = fontBold.widthOfTextAtSize(stars, 12)
  page.drawText(stars, {
    x: (W - starsW) / 2, y: H - 82, font: fontBold, size: 12, color: GOLD,
  })

  // ── Gold divider ─────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 28, y: H - 100 }, end: { x: W - 28, y: H - 100 }, thickness: 0.8, color: GOLD })

  // ── Participant label ─────────────────────────────────────────────────────────
  const pLabel = 'PARTICIPANT'
  const pLabelW = fontHelv.widthOfTextAtSize(pLabel, 8)
  page.drawText(pLabel, {
    x: (W - pLabelW) / 2, y: H - 116, font: fontHelv, size: 8, color: LIGHT,
  })

  // ── Participant name (large, navy, centred) ──────────────────────────────────
  const fullName = `${ticket.prenume} ${ticket.nume}`
  const nameSize = fullName.length > 24 ? 18 : 22
  const nameW = fontBold.widthOfTextAtSize(fullName, nameSize)
  page.drawText(fullName, {
    x: (W - nameW) / 2, y: H - 140, font: fontBold, size: nameSize, color: NAVY,
  })

  // ── Dashed divider ────────────────────────────────────────────────────────────
  const dashY = H - 158
  for (let x = 28; x < W - 28; x += 8) {
    page.drawLine({ start: { x, y: dashY }, end: { x: x + 4, y: dashY }, thickness: 0.8, color: GOLD, opacity: 0.5 })
  }

  // ── Left column: venue info ───────────────────────────────────────────────────
  const LEFT = 28
  let ly = H - 176
  const lineGap = 15

  const venueLines = [
    '01-03 Octombrie 2026',
    'Chisinau, Republica Moldova',
    'Digital Park, Strada Mihai Viteazul 15',
  ]
  for (const line of venueLines) {
    page.drawText(line, { x: LEFT, y: ly, font: fontRegular, size: 10, color: GREY })
    ly -= lineGap
  }

  // Hands-On badge
  if (ticket.handzone !== 'none') {
    const label = HANDZONE_LABELS[ticket.handzone] ?? ticket.handzone
    page.drawRectangle({ x: LEFT, y: ly - 14, width: 200, height: 16, color: NAVY })
    page.drawText('+ Hands-On Workshop', { x: LEFT + 6, y: ly - 11, font: fontHelvB, size: 8, color: GOLD })
    ly -= 20
    const shortLabel = label.length > 48 ? label.substring(0, 45) + '...' : label
    page.drawText(shortLabel, { x: LEFT, y: ly - 2, font: fontItalic, size: 8, color: LIGHT })
    ly -= 14
  }

  // Satellite workshop badge
  if (ticket.satellite_workshop && ticket.satellite_workshop !== 'none') {
    const satLabel = SATELLITE_LABELS[ticket.satellite_workshop] ?? ticket.satellite_workshop
    page.drawRectangle({ x: LEFT, y: ly - 14, width: 200, height: 16, color: GREEN })
    page.drawText('Satellite Workshop', { x: LEFT + 6, y: ly - 11, font: fontHelvB, size: 8, color: WHITE })
    ly -= 20
    const shortSatLabel = satLabel.length > 48 ? satLabel.substring(0, 45) + '...' : satLabel
    page.drawText(shortSatLabel, { x: LEFT, y: ly - 2, font: fontItalic, size: 8, color: LIGHT })
    ly -= 14
  }

  // ── Right column: price + ticket ID ──────────────────────────────────────────
  const RIGHT_X = W - 28
  const totalLabel = 'TOTAL'
  const totalLabelW = fontHelv.widthOfTextAtSize(totalLabel, 8)
  page.drawText(totalLabel, { x: RIGHT_X - totalLabelW, y: H - 176, font: fontHelv, size: 8, color: LIGHT })

  const priceStr = `${ticket.price_mdl.toLocaleString('ro-MD')} MDL`
  const priceW = fontBold.widthOfTextAtSize(priceStr, 16)
  page.drawText(priceStr, { x: RIGHT_X - priceW, y: H - 194, font: fontBold, size: 16, color: NAVY })

  const ticketId = `#${String(ticket.id).padStart(6, '0')}`
  const idW = fontHelv.widthOfTextAtSize(ticketId, 8)
  page.drawText(ticketId, { x: RIGHT_X - idW, y: H - 208, font: fontHelv, size: 8, color: LIGHT })

  // ── Navy footer band ──────────────────────────────────────────────────────────
  const FOOTER_H = 26
  page.drawRectangle({ x: 0, y: 0, width: W, height: FOOTER_H, color: NAVY })

  const footerText = 'nopainmoldova.org  |  mssmp.md@gmail.com  |  01-03 Octombrie 2026'
  const footerW = fontHelv.widthOfTextAtSize(footerText, 8)
  page.drawText(footerText, {
    x: (W - footerW) / 2, y: 9, font: fontHelv, size: 8, color: GOLD,
  })

  // ── Thin gold border around entire card ──────────────────────────────────────
  page.drawRectangle({ x: 1, y: 1, width: W - 2, height: H - 2, borderColor: GOLD, borderWidth: 1.2, color: rgb(0, 0, 0), opacity: 0 })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

// ─── Build the full email (professional message + PDF attachment) ──────────────
export async function buildTicketEmail(ticket: {
  id: number
  prenume: string
  nume: string
  email: string
  ticket_type: string
  price_mdl: number
  handzone: string
  satellite_workshop?: string
}) {
  const typeLabel: Record<string, string> = {
    Student: 'Student', Resident: 'Rezident / Doctor', Nurse: 'Asistenta Medicala',
  }
  const ticketId = String(ticket.id).padStart(6, '0')
  const handzoneLabel = ticket.handzone !== 'none'
    ? (HANDZONE_LABELS[ticket.handzone] ?? ticket.handzone)
    : null
  const satelliteLabel = ticket.satellite_workshop && ticket.satellite_workshop !== 'none'
    ? (SATELLITE_LABELS[ticket.satellite_workshop] ?? ticket.satellite_workshop)
    : null

  const pdfBuffer = await buildTicketPdf(ticket)

  const html = `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0ece2;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece2;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

  <!-- Header -->
  <tr>
    <td style="background:#1a3a6b;padding:32px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;font-family:Arial,sans-serif;">
        Confirmare Inregistrare
      </p>
      <h1 style="margin:0;font-size:22px;color:#ffffff;font-family:Georgia,serif;font-weight:700;">
        International Pain Congress 2026
      </h1>
      <p style="margin:8px 0 0;font-size:13px;color:#c9a84c;font-style:italic;font-family:Georgia,serif;">
        20th Anniversary Edition &middot; Moldova
      </p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px;">
      <p style="margin:0 0 16px;font-size:15px;color:#333;line-height:1.7;">
        Stimate/Stimata <strong style="color:#1a3a6b;">${ticket.prenume} ${ticket.nume}</strong>,
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.8;">
        Iti multumim pentru inregistrarea la <strong>International Pain Congress 2026</strong>.
        Suntem incantati sa te avem alaturi de noi la cea de-a <strong>20-a editie aniversara</strong> a congresului,
        un eveniment dedicat excelentei si progresului in managementul durerii.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.8;">
        Biletul tau oficial este atasat acestui email in format PDF. Te rugam sa il pastrezi
        si sa il prezinti la intrarea in eveniment.
      </p>

      <!-- Details box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2eb;border-radius:8px;border-left:4px solid #c9a84c;margin-bottom:24px;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;font-family:Arial,sans-serif;">Detalii bilet</p>
          <table width="100%" cellpadding="4" cellspacing="0" style="font-size:13px;color:#333;">
            <tr>
              <td style="color:#888;width:140px;font-family:Arial,sans-serif;">Participant:</td>
              <td style="font-weight:700;color:#1a3a6b;font-family:Arial,sans-serif;">${ticket.prenume} ${ticket.nume}</td>
            </tr>
            <tr>
              <td style="color:#888;font-family:Arial,sans-serif;">Tip bilet:</td>
              <td style="font-family:Arial,sans-serif;">${typeLabel[ticket.ticket_type] ?? ticket.ticket_type}</td>
            </tr>
            ${handzoneLabel ? `
            <tr>
              <td style="color:#888;font-family:Arial,sans-serif;">Hands-On Workshop:</td>
              <td style="font-family:Arial,sans-serif;color:#c9a84c;font-weight:600;">${handzoneLabel}</td>
            </tr>` : ''}
            ${satelliteLabel ? `
            <tr>
              <td style="color:#888;font-family:Arial,sans-serif;">Satellite Workshop:</td>
              <td style="font-family:Arial,sans-serif;color:#2a6b3a;font-weight:600;">&#127807; ${satelliteLabel}</td>
            </tr>` : ''}
            <tr>
              <td style="color:#888;font-family:Arial,sans-serif;">Total platit:</td>
              <td style="font-weight:700;font-family:Arial,sans-serif;">${ticket.price_mdl.toLocaleString('ro-MD')} MDL</td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- Event info -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;margin-bottom:28px;">
        <tr><td style="padding:18px 24px;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;font-family:Arial,sans-serif;">Informatii eveniment</p>
          <p style="margin:0 0 5px;font-size:13px;color:#555;font-family:Arial,sans-serif;">&#128197; <strong>01&ndash;03 Octombrie 2026</strong></p>
          <p style="margin:0 0 5px;font-size:13px;color:#555;font-family:Arial,sans-serif;">&#127968; <strong>Digital Park</strong></p>
          <p style="margin:0;font-size:13px;color:#555;font-family:Arial,sans-serif;">&#128205; Strada Mihai Viteazul 15, Chisinau, Republica Moldova</p>
        </td></tr>
      </table>

      <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.8;">
        Pentru orice intrebari sau informatii suplimentare, nu ezita sa ne contactezi la
        <a href="mailto:mssmp.md@gmail.com" style="color:#1a3a6b;font-weight:600;">mssmp.md@gmail.com</a>.
      </p>
      <p style="margin:0;font-size:14px;color:#555;line-height:1.8;">
        Asteptam cu nerabdare sa te intalnim in octombrie!
      </p>
    </td>
  </tr>

  <!-- Signature -->
  <tr>
    <td style="padding:0 40px 32px;">
      <p style="margin:0;font-size:14px;color:#333;font-family:Georgia,serif;">Cu stima,</p>
      <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#1a3a6b;font-family:Georgia,serif;">
        Comitetul Organizatoric
      </p>
      <p style="margin:2px 0 0;font-size:12px;color:#888;font-family:Arial,sans-serif;">
        International Pain Congress 2026 &middot; nopainmoldova.org
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#1a3a6b;padding:16px 40px;text-align:center;">
      <p style="margin:0;font-size:10px;color:#c9a84c;letter-spacing:1px;font-family:Arial,sans-serif;">
        nopainmoldova.org &nbsp;&middot;&nbsp; mssmp.md@gmail.com &nbsp;&middot;&nbsp; Chisinau, Republica Moldova
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>
`

  return {
    from: `"International Pain Congress 2026" <${process.env.GMAIL_USER}>`,
    to: ticket.email,
    subject: `Biletul tau - International Pain Congress 2026 (#${ticketId})`,
    html,
    attachments: [
      {
        filename: `bilet-ipc2026-${ticketId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  }
}