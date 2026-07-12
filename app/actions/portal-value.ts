'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/types'

/**
 * The client sets the inputs their savings math runs on: the blended hourly
 * rate they assign their staff's time, and the minutes-per-task baseline for
 * each automation. Writes go through the bounded SECURITY DEFINER RPC
 * `set_value_inputs` (client role + own tenant enforced in the database;
 * rate $5–$500, minutes 0.5–480). The 30% haircut still applies on top.
 */
export async function updateValueInputsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'client') {
    return { errors: { _root: 'Only client logins can change these numbers.' } }
  }

  const rateRaw = String(formData.get('rate') ?? '').trim()
  const rate = Number(rateRaw)
  if (!rateRaw || !Number.isFinite(rate) || rate < 5 || rate > 500) {
    return { errors: { _root: 'The hourly rate needs to be between $5 and $500.' } }
  }

  const updates: { id: string; minutes: number }[] = []
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('minutes-')) continue
    const minutes = Number(String(value).trim())
    if (!Number.isFinite(minutes) || minutes < 0.5 || minutes > 480) {
      return { errors: { _root: 'Task times need to be between half a minute and 8 hours (480 minutes).' } }
    }
    updates.push({ id: key.slice('minutes-'.length), minutes })
  }

  const { error: rateErr } = await supabase.rpc('set_value_inputs', { p_rate: rate })
  if (rateErr) {
    console.error('[portal-value] rate update failed:', rateErr.message)
    return { errors: { _root: 'Saving failed — refresh and try again, or send a request and I’ll set it for you.' } }
  }
  for (const u of updates) {
    const { error } = await supabase.rpc('set_value_inputs', { p_automation: u.id, p_minutes: u.minutes })
    if (error) {
      console.error('[portal-value] minutes update failed:', error.message)
      return { errors: { _root: 'Saving stopped partway — refresh to see what took, then try again.' } }
    }
  }

  revalidatePath('/portal')
  return { message: 'Saved. Everything above now runs on your numbers.' }
}
