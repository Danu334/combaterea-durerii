// lib/alert.ts
//
// Central place for reporting things that need a human's attention:
// payment/refund failures, signature rejections, lost confirmation emails.
// Logs structured JSON (visible in Vercel logs) and emails ADMIN_ALERT_EMAIL —
// best-effort, never throws.
//
// These two channels are the whole monitoring story now that Sentry is gone, so
// the email matters: a payment problem nobody reads about is a payment problem
// nobody fixes.

export async function alertAdmin(event: string, details: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ level: 'alert', event, ...details, ts: new Date().toISOString() }))

  const to = process.env.ADMIN_ALERT_EMAIL
  if (!to) return

  try {
    const { transporter } = await import('./mailer')
    await transporter.sendMail({
      from: `"IPC 2026 Monitoring" <${process.env.GMAIL_USER}>`,
      to,
      subject: `[IPC2026 ALERT] ${event}`,
      text: JSON.stringify(details, null, 2),
    })
  } catch (err) {
    console.error('alertAdmin: failed to send alert email:', err)
  }
}
