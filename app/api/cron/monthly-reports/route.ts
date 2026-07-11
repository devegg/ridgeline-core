import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { gatherReportData, renderReportHtml } from '@/lib/portal/report'

/**
 * Monthly report cron (vercel.json: 1st of the month). DARK BY DESIGN:
 * it only emails clients with report_auto_send = true (default false for
 * everyone), and it 501s until SUPABASE_SECRET_KEY is configured — both
 * flip when the first real care-plan client exists (D13's trigger).
 *
 * Gated by CRON_SECRET (Vercel sends it as the Authorization bearer).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json({ ok: true, sent: 0, note: 'dark — SUPABASE_SECRET_KEY not configured' }, { status: 200 })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })

  // Last full month.
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const month = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`

  const { data: targets, error } = await admin
    .from('clients')
    .select('id, email')
    .eq('report_auto_send', true)
    .not('email', 'is', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ridgelineknows.com'
  let sent = 0
  const skipped: string[] = []

  for (const t of targets ?? []) {
    // Idempotence: one cron send per client per month.
    const { count } = await admin.from('report_sends')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', t.id).eq('month', month).eq('sent_by', 'cron')
    if ((count ?? 0) > 0) { skipped.push(t.id); continue }

    const data = await gatherReportData(admin, t.id, month)
    if ('error' in data) { skipped.push(t.id); continue }

    const { subject, html } = renderReportHtml(data, `${site}/portal`)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.REPORT_FROM ?? 'Ridgeline Knows <reports@ridgelineknows.com>',
        to: [t.email as string],
        reply_to: 'hello@ridgelineknows.com',
        subject,
        html,
      }),
    })
    if (res.ok) {
      sent++
      await admin.from('report_sends').insert({ client_id: t.id, month, sent_to: t.email as string, sent_by: 'cron' })
    } else {
      skipped.push(t.id)
    }
  }

  return NextResponse.json({ ok: true, month, sent, skipped: skipped.length })
}
