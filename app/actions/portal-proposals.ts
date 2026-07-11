'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types'

/**
 * CLIENT: the one-click yes. Authorization lives inside the bounded
 * SECURITY DEFINER approve_proposal (must be the proposal's client, and the
 * proposal must be pending). Notifies the owner on success.
 */
export async function approveProposalClientAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('proposal_id') as string
  if (!id) return { errors: { _root: 'Missing proposal.' } }

  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.app_metadata?.role as string | undefined) !== 'client') {
    return { errors: { _root: 'Only the client can approve.' } }
  }

  const { error } = await supabase.rpc('approve_proposal', { p_proposal: id })
  if (error) {
    return { errors: { _root: 'Could not approve — the proposal may have changed. Refresh and try again, or reach out.' } }
  }

  revalidatePath('/portal/proposals')

  // Owner notification (soft-fail; the approval is already recorded).
  const { data: p } = await supabase.from('proposals').select('title').eq('id', id).single()
  await sendNotification({
    to: process.env.CONTACT_TO ?? 'hello@ridgelineknows.com',
    subject: `Proposal approved — ${(p?.title ?? id).slice(0, 80)}`,
    html: `<p>The client approved <strong>${(p?.title ?? '').replace(/</g, '&lt;')}</strong>. Next step: Create project from the proposal page.</p>`,
  })

  return { message: 'Approved — thank you. Work gets scheduled from here.' }
}
