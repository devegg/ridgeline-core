'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types'

export async function createProposalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  if (!title) return { errors: { title: 'Required' } }

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('proposals')
    .insert({
      title,
      client_id: formData.get('client_id') || null,
      project_id: formData.get('project_id') || null,
      scope: formData.get('scope') || null,
      pricing_notes: formData.get('pricing_notes') || null,
      total_amount: formData.get('total_amount') ? Number(formData.get('total_amount')) : null,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { errors: { _root: error.message } }

  revalidatePath('/proposals')
  redirect(`/proposals/${data.id}`)
}

export async function updateProposalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  const title = (formData.get('title') as string)?.trim()
  if (!title) return { errors: { title: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('proposals')
    .update({
      title,
      client_id: formData.get('client_id') || null,
      project_id: formData.get('project_id') || null,
      scope: formData.get('scope') || null,
      pricing_notes: formData.get('pricing_notes') || null,
      total_amount: formData.get('total_amount') ? Number(formData.get('total_amount')) : null,
    })
    .eq('id', id)

  if (error) return { errors: { _root: error.message } }

  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
  return { message: 'Saved.' }
}

export async function approveProposalAction(id: string) {
  const supabase = await createSupabase()
  await supabase.from('proposals').update({ status: 'approved' }).eq('id', id)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function sendProposalAction(id: string) {
  const supabase = await createSupabase()
  await supabase
    .from('proposals')
    .update({ status: 'pending', sent_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function rejectProposalAction(id: string) {
  const supabase = await createSupabase()
  await supabase.from('proposals').update({ status: 'rejected' }).eq('id', id)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function acceptProposalAction(id: string) {
  const supabase = await createSupabase()
  await supabase
    .from('proposals')
    .update({ status: 'approved', accepted_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function archiveProposalAction(id: string) {
  const supabase = await createSupabase()
  await supabase.from('proposals').update({ status: 'archived' }).eq('id', id)
  revalidatePath('/proposals')
  redirect('/proposals')
}
