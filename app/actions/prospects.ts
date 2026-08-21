'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseKml } from '@/lib/kml'
import type { ActionState } from '@/lib/types'

/** Field kit actions — owner-only (RLS enforces it; we also gate here). */
async function ownerClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'owner') return null
  return supabase
}

export async function addProspectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const business_name = String(formData.get('business_name') ?? '').trim()
  if (!business_name) return { errors: { _root: 'Business name is required.' } }

  const { error } = await supabase.from('prospects').insert({
    business_name,
    industry: String(formData.get('industry') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
  })
  if (error) {
    return {
      errors: {
        _root: error.message.includes('prospects_dedupe_idx')
          ? 'That business (same name and address) is already in the list.'
          : 'Saving failed — refresh and try again.',
      },
    }
  }
  revalidatePath('/prospects')
  return { message: 'Added.' }
}

/**
 * Add a business by hand, from the field. Most of the people Brian talks to
 * have no card — someone meets him at the desk, gives a name, and that is all
 * he gets. On success this drops straight into that business's visit screen,
 * because the reason he is typing it in is that he is about to price their
 * tasks.
 */
export async function addFieldProspectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const business_name = String(formData.get('business_name') ?? '').trim()
  if (!business_name) return { errors: { _root: 'A business name is the one thing I need.' } }

  const { data, error } = await supabase
    .from('prospects')
    .insert({
      business_name,
      contact_name: String(formData.get('contact_name') ?? '').trim() || null,
      phone: String(formData.get('phone') ?? '').trim() || null,
      email: String(formData.get('email') ?? '').trim() || null,
      notes: String(formData.get('notes') ?? '').trim() || null,
      status: 'visited',
    })
    .select('id')
    .single()

  if (error) {
    // The dedupe index means it is already on the list — say so rather than
    // leaving him wondering why nothing happened.
    return {
      errors: {
        _root: error.message.includes('prospects_dedupe_idx')
          ? `${business_name} is already on your list — find it below instead.`
          : 'Saving failed — try again.',
      },
    }
  }

  revalidatePath('/prospects')
  revalidatePath('/visit')
  // Outside any try/catch on purpose: this signals by throwing.
  redirect(`/visit/${data.id}`)
}

export async function logVisitAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const prospect_id = String(formData.get('prospect_id') ?? '')
  const visited_on = String(formData.get('visited_on') ?? '') || new Date().toISOString().slice(0, 10)
  if (!prospect_id) return { errors: { _root: 'Missing prospect.' } }

  const { error } = await supabase.from('prospect_visits').insert({
    prospect_id,
    visited_on,
    card_word: String(formData.get('card_word') ?? '').trim() || null,
    note: String(formData.get('note') ?? '').trim() || null,
  })
  if (error) return { errors: { _root: 'Saving the visit failed — refresh and try again.' } }

  // First visit moves an untouched prospect forward; never walk a status back.
  await supabase.from('prospects').update({ status: 'visited' }).eq('id', prospect_id).eq('status', 'untouched')

  revalidatePath('/prospects')
  return { message: 'Visit logged.' }
}

/** Bounds are enforced in three places on purpose: the browser input, here,
    and the CHECK constraints. The form is the only one a person can bypass. */
const BOUNDS = {
  minutes_each: [0.5, 480],
  times_per_week: [0.1, 500],
  hourly_rate: [5, 500],
} as const

export async function saveVisitEstimateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const prospect_id = String(formData.get('prospect_id') ?? '')
  if (!prospect_id) return { errors: { _root: 'Missing prospect.' } }

  let parsed: unknown
  try {
    parsed = JSON.parse(String(formData.get('tasks') ?? '[]'))
  } catch {
    return { errors: { _root: 'Could not read the tasks — nothing was saved.' } }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { errors: { _root: 'Add at least one priced task before saving.' } }
  }

  const rows = []
  for (const [i, raw] of parsed.entries()) {
    const t = raw as Record<string, unknown>
    const label = String(t.label ?? '').trim()
    if (!label) return { errors: { _root: `Task ${i + 1} needs a name.` } }

    const nums: Record<string, number> = {}
    for (const [field, [lo, hi]] of Object.entries(BOUNDS)) {
      const n = Number(t[field])
      if (!Number.isFinite(n) || n < lo || n > hi) {
        return { errors: { _root: `Task ${i + 1}: ${field.replace(/_/g, ' ')} must be between ${lo} and ${hi}.` } }
      }
      nums[field] = n
    }

    rows.push({
      prospect_id,
      label,
      who: String(t.who ?? '').trim() || null,
      minutes_each: nums.minutes_each,
      times_per_week: nums.times_per_week,
      hourly_rate: nums.hourly_rate,
      sort_order: i,
    })
  }

  const { data: visit, error: visitErr } = await supabase
    .from('prospect_visits')
    .insert({
      prospect_id,
      visited_on: new Date().toISOString().slice(0, 10),
      card_word: String(formData.get('card_word') ?? '').trim() || null,
      note: String(formData.get('note') ?? '').trim() || null,
    })
    .select('id')
    .single()

  if (visitErr || !visit) return { errors: { _root: 'Saving the visit failed — nothing was saved. Try again.' } }

  const { error: tasksErr } = await supabase
    .from('visit_tasks')
    .insert(rows.map(r => ({ ...r, visit_id: visit.id })))

  if (tasksErr) {
    // All-or-nothing: a half-saved visit is worse than a failed one, because
    // it looks complete when you come back to it.
    await supabase.from('prospect_visits').delete().eq('id', visit.id)
    return { errors: { _root: 'Saving the tasks failed — nothing was saved. Try again.' } }
  }

  // A name typed on the visit screen is a deliberate correction, so unlike
  // the card scan (where OCR guesses never overwrite) this one wins. Blank
  // still never clobbers an existing name.
  const contact_name = String(formData.get('contact_name') ?? '').trim()
  if (contact_name) {
    await supabase.from('prospects').update({ contact_name }).eq('id', prospect_id)
  }

  // Never walk a status backward — same guard as logVisitAction.
  await supabase
    .from('prospects')
    .update({ status: 'interested' })
    .eq('id', prospect_id)
    .in('status', ['untouched', 'visited'])

  revalidatePath('/prospects')
  return { message: `Saved — ${rows.length} task${rows.length === 1 ? '' : 's'} on this visit.` }
}

export async function setProspectStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const id = String(formData.get('prospect_id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !['untouched', 'visited', 'interested', 'archived'].includes(status)) {
    return { errors: { _root: 'Bad status.' } }
  }
  const { error } = await supabase.from('prospects').update({ status }).eq('id', id)
  if (error) return { errors: { _root: 'Update failed — refresh and try again.' } }
  revalidatePath('/prospects')
  return { message: 'Updated.' }
}

export async function promoteToLeadAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const id = String(formData.get('prospect_id') ?? '')
  const { data: prospect, error: readErr } = await supabase.from('prospects').select('*').eq('id', id).single()
  if (readErr || !prospect) return { errors: { _root: 'Prospect not found.' } }
  if (prospect.lead_id) return { errors: { _root: 'Already promoted — see Leads.' } }

  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .insert({
      business_name: prospect.business_name,
      industry: prospect.industry,
      location: prospect.address,
      phone: prospect.phone,
      source: 'card_drop',
      stage: 'identified',
      notes: prospect.notes,
    })
    .select('id')
    .single()
  if (leadErr || !lead) return { errors: { _root: 'Creating the lead failed — refresh and try again.' } }

  await supabase.from('prospects').update({ status: 'lead', lead_id: lead.id }).eq('id', id)
  revalidatePath('/prospects')
  revalidatePath('/leads')
  return { message: 'Promoted — now in Leads.' }
}

export async function importKmlAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const file = formData.get('kml')
  if (!(file instanceof File) || file.size === 0) {
    return { errors: { _root: 'Pick the exported .kml file first.' } }
  }
  if (file.name.toLowerCase().endsWith('.kmz')) {
    return { errors: { _root: 'That is a KMZ (zipped). Re-export with "Export as KML instead of KMZ" checked.' } }
  }
  if (file.size > 10 * 1024 * 1024) return { errors: { _root: 'File too large.' } }

  const placemarks = parseKml(await file.text())
  if (placemarks.length === 0) {
    return { errors: { _root: 'No pins found in that file — is it the My Maps KML export?' } }
  }

  let imported = 0
  let skipped = 0
  for (const p of placemarks) {
    const { error } = await supabase.from('prospects').insert({
      business_name: p.name,
      industry: p.layer,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      source: 'map_import',
    })
    if (error) skipped++ // dedupe index: already imported
    else imported++
  }

  revalidatePath('/prospects')
  return { message: `Imported ${imported} pin${imported === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} already here` : ''}.` }
}

export async function saveCardAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const business_name = String(formData.get('business_name') ?? '').trim()
  if (!business_name) return { errors: { _root: 'Business name is required — fix the guess if OCR missed it.' } }

  const attachTo = String(formData.get('attach_to') ?? '').trim() // existing prospect id, or ''
  // The field flow scans a card in order to start pricing that business, so it
  // asks to be dropped straight into the visit screen. The dashboard flow is
  // desk work — it stays put and shows a confirmation instead.
  const goToVisit = formData.get('go_to_visit') === '1'
  const fields = {
    contact_name: String(formData.get('contact_name') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    website: String(formData.get('website') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
  }

  // Photo first, so a failed upload never leaves a prospect without its card.
  // The cost of that order is an orphan if the row write then fails, so every
  // early return past this point drops the object it uploaded. One real
  // orphan turned up in storage from the Server Action body-limit crash.
  let card_photo_path: string | null = null
  const photo = formData.get('photo')
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 12 * 1024 * 1024) return { errors: { _root: 'Photo too large — 12 MB max.' } }
    const ext = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg'
    card_photo_path = `card-${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from('cards').upload(card_photo_path, photo, { contentType: photo.type || 'image/jpeg' })
    if (upErr) {
      console.error('[prospects] card upload failed:', upErr.message)
      return { errors: { _root: 'Photo upload failed — try again.' } }
    }
  }

  /** Drop a just-uploaded card when the row write fails, so storage doesn't
      collect a file nothing points at. Best-effort: the caller's error is
      what matters, not this cleanup. */
  const dropPhoto = async () => {
    if (card_photo_path) await supabase.storage.from('cards').remove([card_photo_path])
  }

  if (attachTo) {
    // Attach to an existing prospect: fill only what's blank, photo always wins.
    const { data: existing, error: readErr } = await supabase.from('prospects').select('*').eq('id', attachTo).single()
    if (readErr || !existing) {
      await dropPhoto()
      return { errors: { _root: 'That prospect was not found.' } }
    }
    const patch: Record<string, unknown> = { card_photo_path: card_photo_path ?? existing.card_photo_path }
    for (const [k, v] of Object.entries(fields)) {
      if (v && !existing[k]) patch[k] = v
    }
    const { error } = await supabase.from('prospects').update(patch).eq('id', attachTo)
    if (error) {
      await dropPhoto()
      return { errors: { _root: 'Saving failed — refresh and try again.' } }
    }
    revalidatePath('/prospects')
    revalidatePath('/visit')
    if (goToVisit) redirect(`/visit/${attachTo}`)
    return { message: `Card attached to ${existing.business_name}.` }
  }

  const { data: created, error } = await supabase
    .from('prospects')
    .insert({ business_name, ...fields, card_photo_path })
    .select('id')
    .single()
  if (error) {
    await dropPhoto()
    if (!error.message.includes('prospects_dedupe_idx')) {
      return { errors: { _root: 'Saving failed — refresh and try again.' } }
    }
    // "Already in the list" was misleading for a business that had been
    // promoted: it was filtered out of the working list AND out of the
    // "attach to" picker, so the advice pointed at a dropdown it wasn't in.
    // Say where the record actually went.
    const { data: clash } = await supabase
      .from('prospects')
      .select('status')
      .eq('business_name', business_name)
      .maybeSingle()

    const where =
      clash?.status === 'lead' ? 'already promoted to a Lead'
      : clash?.status === 'archived' ? 'archived'
      : 'already on your list'

    return {
      errors: {
        _root: `${business_name} is on file — ${where}. Pick it under "Attach to" to put this card on that record.`,
      },
    }
  }
  revalidatePath('/prospects')
  revalidatePath('/visit')
  if (goToVisit) redirect(`/visit/${created.id}`)
  return { message: 'Prospect created from the card.' }
}
