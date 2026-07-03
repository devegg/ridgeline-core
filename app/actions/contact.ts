'use server'

/**
 * Contact-form sender — Ridgeline email conventions (mirrors RFQ Hunter's):
 *   • hello@ridgelineknows.com is the human mailbox (delivery target, public address, Reply-To)
 *   • purpose-named senders on the verified domain: this one is contact@ridgelineknows.com
 *   • direct Resend REST call, no SDK; soft-fails with a clear message when unconfigured
 * Env: RESEND_API_KEY (required to send), CONTACT_TO / CONTACT_FROM (optional overrides).
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export type ContactPayload = {
  name: string
  email: string
  company: string
  situation: string
  message: string
  website: string // honeypot
}

export type ContactResult = { ok: boolean; error?: string }

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

export async function sendContactMessage(p: ContactPayload): Promise<ContactResult> {
  // Honeypot: silently "succeed" so bots learn nothing.
  if (p.website && p.website.trim().length > 0) return { ok: true }

  const name = (p.name ?? '').trim()
  const email = (p.email ?? '').trim()
  const company = (p.company ?? '').trim()
  const situation = (p.situation ?? '').trim().slice(0, 80)
  const message = (p.message ?? '').trim()

  if (!name || name.length > 200) return { ok: false, error: 'Please check the form and try again.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Please check the form and try again.' }
  if (message.length < 20 || message.length > 5000) return { ok: false, error: 'Please check the form and try again.' }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('[contact] RESEND_API_KEY not set — message NOT sent')
    return { ok: false, error: 'The form is not connected yet — please email hello@ridgelineknows.com directly.' }
  }

  const to = process.env.CONTACT_TO ?? 'hello@ridgelineknows.com'
  const from = process.env.CONTACT_FROM ?? 'Ridgeline Knows <contact@ridgelineknows.com>'

  const html = [
    `<h2 style="font-family:Georgia,serif;margin:0 0 12px">Website inquiry</h2>`,
    `<p><strong>Name:</strong> ${esc(name)}</p>`,
    `<p><strong>Email:</strong> ${esc(email)}</p>`,
    company ? `<p><strong>Company:</strong> ${esc(company)}</p>` : '',
    `<p><strong>Situation:</strong> ${esc(situation)}</p>`,
    `<p style="white-space:pre-wrap;border-top:1px solid #ddd;padding-top:12px">${esc(message)}</p>`,
  ].join('\n')

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email, // replying to the notification answers the visitor directly
        subject: `Website inquiry — ${name}${company ? ` (${company})` : ''}`,
        html,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`[contact] Resend ${res.status}: ${body.slice(0, 300)}`)
      return { ok: false, error: 'Sending failed — please email hello@ridgelineknows.com directly.' }
    }
    return { ok: true }
  } catch (err) {
    console.error('[contact] send threw:', err)
    return { ok: false, error: 'Sending failed — please email hello@ridgelineknows.com directly.' }
  }
}
