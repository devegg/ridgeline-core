'use server'

import { randomBytes, createHash } from 'node:crypto'
import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types'

/** Owner-only gate shared by every portal-data action. */
async function ownerClient() {
  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined
  if (!user || role !== 'owner') return null
  return supabase
}

const revalidate = (clientId: string) => {
  revalidatePath(`/clients/${clientId}/portal`)
  revalidatePath('/portal')
}

// ------------------------------------------------------------
// Automations
// ------------------------------------------------------------
export async function saveAutomationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const id = (formData.get('id') as string) || null
  const name = (formData.get('name') as string)?.trim()
  const baseline = Number(formData.get('baseline_minutes_per_item'))
  if (!clientId || !name || !Number.isFinite(baseline) || baseline <= 0) {
    return { errors: { _root: 'Name and a baseline (minutes per item, > 0) are required.' } }
  }

  const row = {
    client_id: clientId,
    name,
    plain_summary: (formData.get('plain_summary') as string)?.trim() || null,
    status: ['running', 'issue', 'paused'].includes(formData.get('status') as string)
      ? (formData.get('status') as string) : 'running',
    baseline_minutes_per_item: baseline,
    started_on: (formData.get('started_on') as string) || new Date().toISOString().slice(0, 10),
    sort_order: Number(formData.get('sort_order')) || 0,
  }

  const { error } = id
    ? await supabase.from('automations').update(row).eq('id', id)
    : await supabase.from('automations').insert(row)
  if (error) {
    queryFailed('automations', error)
    return { errors: { _root: 'Could not save the automation.' } }
  }
  revalidate(clientId)
  return { message: 'Saved.' }
}

// ------------------------------------------------------------
// Manual activity quick-add (pre-n8n clients)
// ------------------------------------------------------------
export async function addActivityAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const automationId = formData.get('automation_id') as string
  const on = (formData.get('activity_on') as string) || new Date().toISOString().slice(0, 10)
  const items = Number(formData.get('items_processed'))
  if (!automationId || !Number.isFinite(items) || items < 0) {
    return { errors: { _root: 'Pick an automation and a non-negative item count.' } }
  }

  const { error } = await supabase
    .from('automation_activity')
    .upsert({ automation_id: automationId, activity_on: on, items_processed: Math.round(items) },
      { onConflict: 'automation_id,activity_on' })
  if (error) {
    queryFailed('automation_activity', error)
    return { errors: { _root: 'Could not record the activity.' } }
  }
  revalidate(clientId)
  return { message: `Recorded ${Math.round(items)} items for ${on}.` }
}

// ------------------------------------------------------------
// Caught issues
// ------------------------------------------------------------
export async function addIssueAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const summary = (formData.get('summary') as string)?.trim()
  if (!clientId || !summary) return { errors: { _root: 'A plain-language summary is required.' } }

  const status = formData.get('status') === 'active' ? 'active' : 'resolved'
  const { error } = await supabase.from('caught_issues').insert({
    client_id: clientId,
    automation_id: (formData.get('automation_id') as string) || null,
    occurred_on: (formData.get('occurred_on') as string) || new Date().toISOString().slice(0, 10),
    summary,
    detail: (formData.get('detail') as string)?.trim() || null,
    status,
    resolved_on: status === 'resolved' ? new Date().toISOString().slice(0, 10) : null,
  })
  if (error) {
    queryFailed('caught_issues', error)
    return { errors: { _root: 'Could not add the issue.' } }
  }
  revalidate(clientId)
  return { message: 'Added.' }
}

export async function resolveIssueAction(formData: FormData): Promise<void> {
  const supabase = await ownerClient()
  if (!supabase) return
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  if (!id) return
  const { error } = await supabase.from('caught_issues')
    .update({ status: 'resolved', resolved_on: new Date().toISOString().slice(0, 10) })
    .eq('id', id)
  if (error) queryFailed('caught_issues', error)
  if (clientId) revalidate(clientId)
}

// ------------------------------------------------------------
// Roadmap
// ------------------------------------------------------------
export async function addRoadmapAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const title = (formData.get('title') as string)?.trim()
  if (!clientId || !title) return { errors: { _root: 'A title is required.' } }

  const { error } = await supabase.from('roadmap_items').insert({
    client_id: clientId,
    title,
    state: ['next', 'in_progress', 'shipped'].includes(formData.get('state') as string)
      ? (formData.get('state') as string) : 'next',
    sort_order: Number(formData.get('sort_order')) || 0,
  })
  if (error) {
    queryFailed('roadmap_items', error)
    return { errors: { _root: 'Could not add the item.' } }
  }
  revalidate(clientId)
  return { message: 'Added.' }
}

export async function advanceRoadmapAction(formData: FormData): Promise<void> {
  const supabase = await ownerClient()
  if (!supabase) return
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  const next = formData.get('state') as string
  if (!id || !['next', 'in_progress', 'shipped'].includes(next)) return
  const { error } = await supabase.from('roadmap_items')
    .update({ state: next, shipped_on: next === 'shipped' ? new Date().toISOString().slice(0, 10) : null })
    .eq('id', id)
  if (error) queryFailed('roadmap_items', error)
  if (clientId) revalidate(clientId)
}

export async function deleteRoadmapAction(formData: FormData): Promise<void> {
  const supabase = await ownerClient()
  if (!supabase) return
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  if (!id) return
  const { error } = await supabase.from('roadmap_items').delete().eq('id', id)
  if (error) queryFailed('roadmap_items', error)
  if (clientId) revalidate(clientId)
}

// ------------------------------------------------------------
// Peace-of-mind highlights
// ------------------------------------------------------------
export async function addHighlightAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const line = (formData.get('line') as string)?.trim()
  if (!clientId || !line) return { errors: { _root: 'A line is required.' } }

  const { error } = await supabase.from('portal_highlights').insert({
    client_id: clientId, line, sort_order: Number(formData.get('sort_order')) || 0,
  })
  if (error) {
    queryFailed('portal_highlights', error)
    return { errors: { _root: 'Could not add the line.' } }
  }
  revalidate(clientId)
  return { message: 'Added.' }
}

export async function deleteHighlightAction(formData: FormData): Promise<void> {
  const supabase = await ownerClient()
  if (!supabase) return
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  if (!id) return
  const { error } = await supabase.from('portal_highlights').delete().eq('id', id)
  if (error) queryFailed('portal_highlights', error)
  if (clientId) revalidate(clientId)
}

// ------------------------------------------------------------
// Ingest key — generate/rotate; plaintext returned ONCE.
// ------------------------------------------------------------
export async function rotateIngestKeyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  if (!clientId) return { errors: { _root: 'Missing client.' } }

  const key = `rk_ingest_${randomBytes(24).toString('base64url')}`
  const hash = createHash('sha256').update(key).digest('hex')

  const { error } = await supabase.from('clients')
    .update({ ingest_key_hash: hash, ingest_key_created_at: new Date().toISOString() })
    .eq('id', clientId)
  if (error) {
    queryFailed('clients', error)
    return { errors: { _root: 'Could not rotate the key.' } }
  }
  revalidate(clientId)
  return { message: key } // shown once by the panel; only the hash is stored
}

// ------------------------------------------------------------
// Portal settings (tier + report auto-send) + the case-study draft
// ------------------------------------------------------------
export async function savePortalSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const tier = formData.get('plan_tier') as string
  if (!clientId || !['watch', 'improve', 'own'].includes(tier)) {
    return { errors: { _root: 'Pick a valid tier.' } }
  }

  const { error } = await supabase.from('clients')
    .update({ plan_tier: tier, report_auto_send: formData.get('report_auto_send') === 'on' })
    .eq('id', clientId)
  if (error) {
    queryFailed('clients', error)
    return { errors: { _root: 'Could not save.' } }
  }
  revalidate(clientId)
  return { message: `Saved — tier: ${tier[0].toUpperCase()}${tier.slice(1)}, monthly auto-send ${formData.get('report_auto_send') === 'on' ? 'ON' : 'off'}.` }
}

export async function draftCaseStudyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  if (!clientId) return { errors: { _root: 'Missing client.' } }

  const { composeCaseStudyDraft } = await import('@/lib/portal/case-study')
  const draft = await composeCaseStudyDraft(supabase, clientId)
  if ('error' in draft) return { errors: { _root: draft.error } }

  const { error } = await supabase.from('documents').insert({
    entity_type: 'client',
    entity_id: clientId,
    name: draft.name,
    content: draft.content,
    is_shared: false,
  })
  if (error) {
    queryFailed('documents', error)
    return { errors: { _root: 'Could not save the draft.' } }
  }
  return { message: 'Draft saved to Documents (unshared) — edit before any eyes see it. Each click creates a NEW draft; delete extras from All Documents.' }
}
