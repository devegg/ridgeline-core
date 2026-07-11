'use server'

import { randomUUID } from 'node:crypto'
import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types'
import type { IntakeAnswers } from '@/lib/portal/intake'

/**
 * Owner: mint (or re-mint) the single-use intake link for an assessment.
 * Re-minting invalidates the old link (new token) and clears a prior
 * submission ONLY if the owner explicitly re-opens (fresh token, answers kept).
 */
export async function generateIntakeLinkAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.app_metadata?.role as string | undefined) !== 'owner') {
    return { errors: { _root: 'Owner only.' } }
  }

  const id = formData.get('assessment_id') as string
  if (!id) return { errors: { _root: 'Missing assessment.' } }

  const token = randomUUID()
  const { error } = await supabase.from('assessments')
    .update({ intake_token: token, intake_submitted_at: null })
    .eq('id', id)
  if (error) {
    queryFailed('assessments', error)
    return { errors: { _root: 'Could not create the link.' } }
  }
  revalidatePath(`/assessments/${id}`)
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ridgelineknows.com'
  return { message: `${site}/intake/${token}` }
}

/**
 * PUBLIC: the intake page's submit. No session required — authorization is
 * the single-use token, enforced inside the bounded SECURITY DEFINER RPC.
 */
export async function submitIntakeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Honeypot: bots fill everything; humans never see this field.
  if ((formData.get('website') as string)?.trim()) return { message: 'Thank you — received.' }

  const token = formData.get('token') as string
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return { errors: { _root: 'This link is not valid.' } }

  const str = (k: string, max = 300) => ((formData.get(k) as string) ?? '').trim().slice(0, max)
  const baselines = []
  for (let i = 0; i < 5; i++) {
    const task = str(`bl_task_${i}`, 200)
    if (!task) continue
    const mins = Number(formData.get(`bl_minutes_${i}`))
    const times = Number(formData.get(`bl_times_${i}`))
    baselines.push({
      task,
      minutes_each: Number.isFinite(mins) && mins > 0 ? Math.min(mins, 600) : null,
      times_per_week: Number.isFinite(times) && times > 0 ? Math.min(times, 500) : null,
      who: str(`bl_who_${i}`, 120),
    })
  }

  const answers: IntakeAnswers = {
    business_name: str('business_name'),
    contact_name: str('contact_name'),
    contact_role: str('contact_role', 120),
    email: str('email', 200),
    phone: str('phone', 40),
    team_size: str('team_size', 40),
    pains: formData.getAll('pains').map(p => String(p).slice(0, 200)).slice(0, 10),
    worst_time_eater: str('worst_time_eater', 2000),
    tools: str('tools', 500),
    baselines,
    anything_else: str('anything_else', 2000),
  }

  if (!answers.business_name || !answers.contact_name) {
    return { errors: { _root: 'Business name and your name are required.' } }
  }

  const supabase = await createSupabase() // anon when logged out — the RPC carries authorization
  const { error } = await supabase.rpc('submit_intake', { p_token: token, p_answers: answers })
  if (error) {
    return { errors: { _root: 'This link has already been used or is no longer valid. Reach out and I will send a fresh one.' } }
  }

  // Best-effort owner notification — never blocks the submission.
  try {
    const key = process.env.RESEND_API_KEY
    if (key) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM ?? 'Ridgeline Knows <contact@ridgelineknows.com>',
          to: [process.env.CONTACT_TO ?? 'hello@ridgelineknows.com'],
          subject: `Intake received — ${answers.business_name}`,
          html: `<p>${answers.contact_name} (${answers.business_name}) completed the written intake. It's on the assessment, ready to read.</p>`,
        }),
      })
    }
  } catch { /* soft-fail */ }

  return { message: 'Received — thank you. I read every answer personally and will follow up shortly.' }
}
