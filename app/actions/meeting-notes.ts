'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/types'

export async function addMeetingNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'owner') return { errors: { _root: 'Owner only.' } }

  const client_id = String(formData.get('client_id') ?? '')
  const note = String(formData.get('note') ?? '').trim()
  const noted_on = String(formData.get('noted_on') ?? '') || new Date().toISOString().slice(0, 10)
  if (!client_id || !note) return { errors: { _root: 'A note needs words in it.' } }

  const { error } = await supabase.from('meeting_notes').insert({ client_id, note, noted_on })
  if (error) return { errors: { _root: 'Saving failed — refresh and try again.' } }
  revalidatePath(`/clients/${client_id}`)
  return { message: 'Added.' }
}
