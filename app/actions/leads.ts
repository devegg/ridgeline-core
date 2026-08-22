'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { blendedRate } from '@/lib/field/estimate'
import type { ActionState, LeadStage } from '@/lib/types'

/** Only the columns the carry-across selects — not the whole VisitTask row,
    so the type cannot claim fields the query did not ask for. */
type CarriedTask = {
  label: string
  minutes_each: number
  times_per_week: number
  hourly_rate: number
  sort_order: number
}

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
  const patch: Record<string, unknown> = { stage }
  // Moving off 'lost' clears the reason; moving TO 'lost' without one leaves
  // whatever was there, so correcting a stage by hand can't silently wipe it.
  if (stage !== 'lost') patch.lost_reason = null
  else if (lostReason !== undefined) patch.lost_reason = lostReason || null

  const { error } = await supabase.from('leads').update(patch).eq('id', id)
  queryFailed('leads', error)
  revalidatePath(`/leads/${id}`)
  revalidatePath('/leads')
}

/**
 * "Move to Meeting scheduled" used to change a label and nothing else — there
 * was no way to record WHEN. This books the date at the same time, into the
 * follow_up_date the leads list already sorts and flags overdue on.
 */
export async function scheduleMeetingAction(id: string, formData: FormData) {
  const when = String(formData.get('follow_up_date') ?? '').trim()
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('leads')
    .update({ stage: 'meeting_scheduled', follow_up_date: when || null })
    .eq('id', id)
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

  await carryTheVisitAcross(supabase, id, client.id)

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

/**
 * Carry the on-site visit's findings onto the new client (build plan 1.5).
 *
 * Without this the client is created at the default $45/hr with nothing else,
 * and the rate and task list measured in the owner's own office — the thing
 * the whole drop-in existed to produce — have to be typed in again from a
 * table nothing reads. That is the last break in the chain from card to
 * portal.
 *
 * TWO THINGS DELIBERATELY NOT DONE HERE:
 *
 * 1. No `automations` rows. `automations.status` is running/issue/paused —
 *    there is no "planned", so anything written here would show a client work
 *    as LIVE that has not been built. The portal's honesty rails forbid that
 *    more clearly than any schema does. The tasks land on the roadmap, which
 *    is exactly what "what's next" means, and the automation gets created for
 *    real when the build goes live (Clients -> Portal data), where the
 *    baseline can be read off the same visit.
 *
 * 2. Nothing is overwritten. A rate is only set if the visit measured one,
 *    and roadmap items are only added if the client has none — re-running a
 *    conversion, or converting a second lead onto an existing client, must
 *    not duplicate the list or reset a rate the client has since corrected
 *    through the portal (D18: the client owns these inputs).
 *
 * Failures here never fail the conversion. The client record is the thing
 * that matters; a missing roadmap row is a nuisance the owner can fix in
 * thirty seconds on the portal-data screen.
 */
async function carryTheVisitAcross(
  supabase: Awaited<ReturnType<typeof createSupabase>>,
  leadId: string,
  clientId: string,
): Promise<void> {
  try {
    const { data: prospect } = await supabase
      .from('prospects')
      .select('id')
      .eq('lead_id', leadId)
      .maybeSingle()
    if (!prospect) return // converted from a lead that never came off a card

    // The most recent visit that actually priced something — same rule as the
    // visit screen. A bare touchpoint logged later must not hide the estimate.
    const { data: newest } = await supabase
      .from('visit_tasks')
      .select('visit_id')
      .eq('prospect_id', prospect.id)
      .order('created_at', { ascending: false })
      .limit(1)
    const visitId = (newest ?? [])[0]?.visit_id
    if (!visitId) return

    const { data: taskRows } = await supabase
      .from('visit_tasks')
      .select('label, minutes_each, times_per_week, hourly_rate, sort_order')
      .eq('visit_id', visitId)
      .order('sort_order')
    const tasks = (taskRows ?? []) as CarriedTask[]
    if (tasks.length === 0) return

    const rate = blendedRate(tasks)
    if (rate !== null) {
      await supabase.from('clients').update({ blended_labor_rate: rate }).eq('id', clientId)
    }

    const { count } = await supabase
      .from('roadmap_items')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
    if ((count ?? 0) > 0) return

    await supabase.from('roadmap_items').insert(
      tasks.map((t, i) => ({
        client_id: clientId,
        title: t.label,
        state: 'next',
        sort_order: t.sort_order ?? i,
      })),
    )
  } catch (err) {
    console.error('[leads] carrying the visit across failed:', err)
  }
}
