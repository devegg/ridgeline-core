'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { provisionPortalLogin } from '@/app/actions/portal-users'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types'

/** When the portal-access box is checked and the contact has an email,
    create the client's login right here (one per client; plain-language
    outcome appended to the save message). */
async function maybeProvision(clientId: string, formData: FormData): Promise<string> {
  if (formData.get('is_portal_user') !== 'true') return ''
  const email = ((formData.get('email') as string) ?? '').trim()
  if (!email) return ' Portal access checked but no email — add one to create the login.'
  const result = await provisionPortalLogin(clientId, email)
  if ('error' in result) {
    return result.error === 'This client already has a portal login.'
      ? '' // already provisioned — the checkbox is just informational now
      : ` Portal login NOT created: ${result.error}`
  }
  return ` Portal login created for ${email} — one-time password (copy now): ${result.password}`
}

export async function createContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim()
  const clientId = formData.get('client_id') as string
  if (!name) return { errors: { name: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase.from('contacts').insert({
    client_id: clientId,
    name,
    title: formData.get('title') || null,
    role: formData.get('role') || 'contact',
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    is_portal_user: formData.get('is_portal_user') === 'true',
    notes: formData.get('notes') || null,
    linkedin_url: formData.get('linkedin_url') || null,
    x_url: formData.get('x_url') || null,
    facebook_url: formData.get('facebook_url') || null,
    instagram_url: formData.get('instagram_url') || null,
    website: formData.get('website') || null,
  })

  if (error) {
    queryFailed('contacts', error)
    return { errors: { _root: error.message } }
  }

  const note = await maybeProvision(clientId, formData)
  revalidatePath(`/clients/${clientId}`)
  return { message: `Contact added.${note}` }
}

export async function updateContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { errors: { name: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase.from('contacts').update({
    name,
    title: formData.get('title') || null,
    role: formData.get('role') || 'contact',
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    is_portal_user: formData.get('is_portal_user') === 'true',
    notes: formData.get('notes') || null,
    linkedin_url: formData.get('linkedin_url') || null,
    x_url: formData.get('x_url') || null,
    facebook_url: formData.get('facebook_url') || null,
    instagram_url: formData.get('instagram_url') || null,
    website: formData.get('website') || null,
  }).eq('id', id)

  if (error) {
    queryFailed('contacts', error)
    return { errors: { _root: error.message } }
  }

  const note = await maybeProvision(clientId, formData)
  revalidatePath(`/clients/${clientId}`)
  return { message: `Saved.${note}` }
}

export async function deleteContactAction(id: string, clientId: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  queryFailed('contacts', error)
  revalidatePath(`/clients/${clientId}`)
}
