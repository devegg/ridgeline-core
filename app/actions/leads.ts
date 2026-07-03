'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState, LeadStage } from '@/lib/types'

const STAGE_ORDER: LeadStage[] = [
  'identified', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won',
]

function leadFields(formData: FormData) {
  return {
    business_name: (formData.get('business_name') as string)?.trim(),
    contact_name: formData.get('contact_name') || null,
    contact_title: formData.get('contact_title') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    industry: formData.get('industry') || null,
    location: formData.get('location') || null,
    source: formData.get('source') || 'card_drop',
    referred_by: formData.get('referred_by') || null,
    follow_up_date: formData.get('follow_up_date') || null,
    notes: formData.get('notes') || null,
    linkedin_url: formData.get('linkedin_url') || null,
    x_url: formData.get('x_url') || null,
    facebook_url: formData.get('facebook_url') || null,
    instagram_url: formData.get('instagram_url') || null,
    website: formData.get('website') || null,
  }
}

export async function createLeadAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fields = leadFields(formData)
  if (!fields.business_name) return { errors: { business_name: 'Required' } }

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('leads')
    .insert({ ...fields, stage: 'identified' })
    .select('id')
    .single()

  if (error) {
    queryFailed('leads', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath('/leads')
  redirect(`/leads/${data.id}`)
}

export async function updateLeadAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  const fields = leadFields(formData)
  if (!fields.business_name) return { errors: { business_name: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase.from('leads').update(fields).eq('id', id)

  if (error) {
    queryFailed('leads', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/leads/${id}`)
  revalidatePath('/leads')
  return { message: 'Saved.' }
}

export async function advanceStageAction(id: string, currentStage: LeadStage) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage)
  if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) return
  const nextStage = STAGE_ORDER[currentIndex + 1]

  const supabase = await createSupabase()
  const { error } = await supabase.from('leads').update({ stage: nextStage }).eq('id', id)
  queryFailed('leads', error)
  revalidatePath(`/leads/${id}`)
  revalidatePath('/leads')
}

export async function setStageAction(id: string, stage: LeadStage, lostReason?: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('leads').update({
    stage,
    lost_reason: lostReason ?? null,
  }).eq('id', id)
  queryFailed('leads', error)
  revalidatePath(`/leads/${id}`)
  revalidatePath('/leads')
}

export async function convertToClientAction(id: string): Promise<{ clientId?: string; error?: string }> {
  const supabase = await createSupabase()

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !lead) {
    queryFailed('leads', fetchError)
    return { error: 'Lead not found' }
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: lead.business_name,
      primary_contact: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      industry: lead.industry,
      location: lead.location,
      relationship_notes: lead.notes,
      status: 'active',
    })
    .select('id')
    .single()

  if (clientError || !client) {
    queryFailed('clients', clientError)
    return { error: clientError?.message ?? 'Failed to create client' }
  }

  const { error: linkError } = await supabase.from('leads').update({
    stage: 'won',
    converted_client_id: client.id,
  }).eq('id', id)
  queryFailed('leads', linkError)

  revalidatePath('/leads')
  revalidatePath('/clients')
  return { clientId: client.id }
}

export async function deleteLeadAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  queryFailed('leads', error)
  revalidatePath('/leads')
  redirect('/leads')
}
