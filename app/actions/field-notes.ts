'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionState, ServiceLine } from '@/lib/types'

/** Owner-only, like the rest of the field kit (RLS enforces it; gate here too). */
async function ownerClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'owner') return null
  return supabase
}

/** Today as 'YYYY-MM-DD' from local parts. toISOString() is UTC and hands
    back yesterday after 8pm on the east coast — i.e. exactly when a field day
    gets written up. Same reasoning as inDays() on the estimator. */
function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Free-text fields, in table order. Trimmed, and '' becomes null so an
    emptied box reads as "not asked" rather than "asked, answered nothing". */
const TEXT_FIELDS = [
  'card_slug',
  'spoke_with_role',
  'stack_observed',
  'how_things_arrive',
  'who_moves_it',
  'sheet_what',
  'sheet_columns',
  'sheet_owner_role',
  'sheet_owner_out',
  'sheet_document_home',
  'exception_handling',
  'transaction_asked',
  'transaction_observed',
  'owner_words',
  'card_got_wrong',
  'disqualify_map_entry',
  'follow_up_owed',
] as const

const SERVICE_LINES: ServiceLine[] = ['L1', 'L2', 'L3', 'L4', 'L5']

/**
 * Save the field note for a visit.
 *
 * Upsert on visit_id, not insert: the note gets written in pieces — some in
 * the lobby, the rest in the truck ten minutes later — and each save has to
 * replace the last rather than pile up rows or fail on the unique index.
 *
 * If today has no visit logged yet, one is created. Walking out of a business
 * and writing up what was said IS the record that a visit happened, and
 * making him log a touchpoint first is a step he would skip.
 */
export async function saveVisitNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const prospect_id = String(formData.get('prospect_id') ?? '')
  if (!prospect_id) return { errors: { _root: 'Missing the business.' } }

  const row: Record<string, string | number | boolean | null> = {}
  for (const field of TEXT_FIELDS) {
    row[field] = String(formData.get(field) ?? '').trim() || null
  }

  const minutes_raw = String(formData.get('duration_minutes') ?? '').trim()
  if (minutes_raw) {
    const n = Number(minutes_raw)
    if (!Number.isFinite(n) || n < 0 || n > 480) {
      return { errors: { _root: 'How long: minutes must be between 0 and 480.' } }
    }
    row.duration_minutes = n
  } else {
    row.duration_minutes = null
  }

  const line = String(formData.get('service_line') ?? '').trim()
  row.service_line = SERVICE_LINES.includes(line as ServiceLine) ? line : null

  // Three states, not two: walked / still live / never got that far. An
  // unanswered disqualify question must not read as "this one is fine".
  const dq = String(formData.get('disqualified') ?? '').trim()
  row.disqualified = dq === 'yes' ? true : dq === 'no' ? false : null

  // Reuse today's visit if there is one, so a note saved twice in an hour
  // doesn't log two visits to the same desk.
  const visited_on = today()
  const { data: existing } = await supabase
    .from('prospect_visits')
    .select('id')
    .eq('prospect_id', prospect_id)
    .eq('visited_on', visited_on)
    .order('created_at', { ascending: false })
    .limit(1)

  let visit_id = (existing ?? [])[0]?.id as string | undefined

  if (!visit_id) {
    const { data: visit, error } = await supabase
      .from('prospect_visits')
      .insert({ prospect_id, visited_on })
      .select('id')
      .single()
    if (error || !visit) return { errors: { _root: 'Saving the visit failed — nothing was saved. Try again.' } }
    visit_id = visit.id
  }

  const { error } = await supabase
    .from('visit_notes')
    .upsert({ ...row, prospect_id, visit_id }, { onConflict: 'visit_id' })

  if (error) return { errors: { _root: 'Saving the note failed — nothing was saved. Try again.' } }

  // Never walk a status backward — same guard as the estimator.
  await supabase
    .from('prospects')
    .update({ status: 'interested' })
    .eq('id', prospect_id)
    .in('status', ['untouched', 'visited'])

  revalidatePath(`/visit/${prospect_id}/notes`)
  revalidatePath(`/visit/${prospect_id}`)
  revalidatePath('/prospects')
  return { message: 'Note saved.' }
}
