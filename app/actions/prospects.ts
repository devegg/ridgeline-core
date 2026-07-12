'use server'

import { revalidatePath } from 'next/cache'
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
  const fields = {
    contact_name: String(formData.get('contact_name') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    website: String(formData.get('website') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
  }

  // Photo first, so a failed upload never leaves a prospect without its card.
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

  if (attachTo) {
    // Attach to an existing prospect: fill only what's blank, photo always wins.
    const { data: existing, error: readErr } = await supabase.from('prospects').select('*').eq('id', attachTo).single()
    if (readErr || !existing) return { errors: { _root: 'That prospect was not found.' } }
    const patch: Record<string, unknown> = { card_photo_path: card_photo_path ?? existing.card_photo_path }
    for (const [k, v] of Object.entries(fields)) {
      if (v && !existing[k]) patch[k] = v
    }
    const { error } = await supabase.from('prospects').update(patch).eq('id', attachTo)
    if (error) return { errors: { _root: 'Saving failed — refresh and try again.' } }
    revalidatePath('/prospects')
    return { message: `Card attached to ${existing.business_name}.` }
  }

  const { error } = await supabase.from('prospects').insert({ business_name, ...fields, card_photo_path })
  if (error) {
    return {
      errors: {
        _root: error.message.includes('prospects_dedupe_idx')
          ? 'That business is already in the list — pick it in "Attach to" instead.'
          : 'Saving failed — refresh and try again.',
      },
    }
  }
  revalidatePath('/prospects')
  return { message: 'Prospect created from the card.' }
}
