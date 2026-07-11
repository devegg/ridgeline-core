'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types'

/**
 * Portal: a client submits a change request. client_id and created_by are
 * derived server-side from the session — never from the form — and the RLS
 * insert policy enforces the same pairing at the database layer.
 */
export async function createRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  if (!title) return { errors: { title: 'Tell me what you need in a sentence.' } }

  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { errors: { _root: 'Your session expired. Sign in again.' } }

  const role = user.app_metadata?.role as string | undefined
  const clientId = user.app_metadata?.client_id as string | undefined
  if (role !== 'client' || !clientId) {
    return { errors: { _root: 'Requests can only be submitted from a client account.' } }
  }

  const urgency = (formData.get('urgency') as string) || 'normal'
  const { error } = await supabase.from('change_requests').insert({
    client_id: clientId,
    created_by: user.id,
    title,
    detail: (formData.get('detail') as string)?.trim() || null,
    urgency: ['low', 'normal', 'high'].includes(urgency) ? urgency : 'normal',
  })

  if (error) {
    queryFailed('change_requests', error)
    return { errors: { _root: 'Could not save your request. Try again, or email me directly.' } }
  }

  revalidatePath('/portal/requests')
  revalidatePath('/requests')
  return { message: "Got it — I'll reply here within one business day." }
}

/** Dashboard: the owner replies to a request and sets its status. */
export async function respondToRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  if (!id) return { errors: { _root: 'Missing request id.' } }

  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined
  if (!user || role !== 'owner') return { errors: { _root: 'Owner only.' } }

  const status = (formData.get('status') as string) || 'in_progress'
  const response = (formData.get('response') as string)?.trim() || null

  const { error } = await supabase
    .from('change_requests')
    .update({
      status: ['new', 'in_progress', 'done'].includes(status) ? status : 'in_progress',
      response,
      responded_on: response ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq('id', id)

  if (error) {
    queryFailed('change_requests', error)
    return { errors: { _root: 'Could not save. Try again.' } }
  }

  revalidatePath('/requests')
  revalidatePath('/portal/requests')
  return { message: 'Saved.' }
}
