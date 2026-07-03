'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types'

export async function createClientAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { errors: { name: 'Required' } }

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name,
      primary_contact: formData.get('primary_contact') || null,
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
      industry: formData.get('industry') || null,
      location: formData.get('location') || null,
      relationship_notes: formData.get('relationship_notes') || null,
      status: formData.get('status') || 'active',
    })
    .select('id')
    .single()

  if (error) {
    queryFailed('clients', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath('/clients')
  redirect(`/clients/${data.id}`)
}

export async function updateClientAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { errors: { name: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('clients')
    .update({
      name,
      primary_contact: formData.get('primary_contact') || null,
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
      industry: formData.get('industry') || null,
      location: formData.get('location') || null,
      relationship_notes: formData.get('relationship_notes') || null,
      status: formData.get('status') || 'active',
    })
    .eq('id', id)

  if (error) {
    queryFailed('clients', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/clients/${id}`)
  revalidatePath('/clients')
  return { message: 'Saved.' }
}

export async function archiveClientAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('clients').update({ status: 'archived' }).eq('id', id)
  queryFailed('clients', error)
  revalidatePath('/clients')
  redirect('/clients')
}
