/**
 * Minimal Resend REST sender for notification emails (house conventions:
 * purpose-named sender on the verified domain, hello@ as Reply-To).
 * Soft-fail by design: returns false, never throws — a notification must
 * never break the action it decorates.
 */
export async function sendNotification(opts: {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key || !opts.to) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: opts.from ?? 'Ridgeline Knows <notify@ridgelineknows.com>',
        to: [opts.to],
        reply_to: opts.replyTo ?? 'hello@ridgelineknows.com',
        subject: opts.subject,
        html: opts.html,
      }),
    })
    if (!res.ok) console.error(`[notify] Resend ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return res.ok
  } catch (err) {
    console.error('[notify] send threw:', err)
    return false
  }
}
