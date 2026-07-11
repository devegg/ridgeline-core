'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { gatherReportData, renderReportHtml } from '@/lib/portal/report'
import type { ActionState } from '@/lib/types'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/**
 * Owner-triggered monthly report send (v1 — cron deferred until a real
 * client exists). Same numbers as the dashboard; sent via Resend REST with
 * the purpose-named sender (reports@) and hello@ as Reply-To, per the
 * house email conventions.
 */
export async function sendMonthlyReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined
  if (!user || role !== 'owner') return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const month = formData.get('month') as string // YYYY-MM
  const to = (formData.get('to') as string)?.trim()
  if (!clientId || !/^\d{4}-\d{2}$/.test(month) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { errors: { _root: 'Month and a valid recipient are required.' } }
  }

  const data = await gatherReportData(supabase, clientId, month)
  if ('error' in data) return { errors: { _root: data.error } }

  const key = process.env.RESEND_API_KEY
  if (!key) return { errors: { _root: 'RESEND_API_KEY is not set — report not sent.' } }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ridgelineknows.com'
  const { subject, html } = renderReportHtml(data, `${site}/portal`)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.REPORT_FROM ?? 'Ridgeline Knows <reports@ridgelineknows.com>',
        to: [to],
        reply_to: 'hello@ridgelineknows.com',
        subject,
        html,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`[report] Resend ${res.status}: ${body.slice(0, 300)}`)
      return { errors: { _root: `Send failed (Resend ${res.status}).` } }
    }
    return { message: `Report for ${data.monthLabel} sent to ${to}.` }
  } catch {
    return { errors: { _root: 'Send timed out — try again.' } }
  } finally {
    clearTimeout(timer)
  }
}
