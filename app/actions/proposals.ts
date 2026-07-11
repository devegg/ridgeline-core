'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
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
      care_plan: (() => {
        try {
          const raw = formData.get('care_plan') as string
          return raw ? JSON.parse(raw) : null
        } catch { return null }
      })(),
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    queryFailed('proposals', error)
    return { errors: { _root: error.message } }
  }

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
      care_plan: (() => {
        try {
          const raw = formData.get('care_plan') as string
          return raw ? JSON.parse(raw) : null
        } catch { return null }
      })(),
    })
    .eq('id', id)

  if (error) {
    queryFailed('proposals', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
  redirect(`/proposals/${id}`) // exit edit mode; the refreshed view is the confirmation
}

export async function approveProposalAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('proposals').update({ status: 'approved' }).eq('id', id)
  queryFailed('proposals', error)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function sendProposalAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('proposals')
    .update({ status: 'pending', sent_at: new Date().toISOString() })
    .eq('id', id)
  queryFailed('proposals', error)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function rejectProposalAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('proposals').update({ status: 'rejected' }).eq('id', id)
  queryFailed('proposals', error)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function acceptProposalAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('proposals')
    .update({ status: 'approved', accepted_at: new Date().toISOString() })
    .eq('id', id)
  queryFailed('proposals', error)
  revalidatePath(`/proposals/${id}`)
  revalidatePath('/proposals')
}

export async function archiveProposalAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('proposals').update({ status: 'archived' }).eq('id', id)
  queryFailed('proposals', error)
  revalidatePath('/proposals')
  redirect('/proposals')
}

/**
 * Owner: draft a proposal FROM a completed assessment — pre-fills the client,
 * provenance link, scope from the recommendations, and the default Care Plan
 * block (opt-out). Lands in edit mode for pricing.
 */
export async function draftProposalFromAssessmentAction(assessmentId: string) {
  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.app_metadata?.role as string | undefined) !== 'owner') return

  const { data: a } = await supabase
    .from('assessments')
    .select('id, client_id, title, recommendations')
    .eq('id', assessmentId)
    .single()
  if (!a) return

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      client_id: a.client_id,
      assessment_id: a.id,
      title: a.title.replace(/^Operations audit/i, 'Proposal').trim() || `Proposal — ${a.title}`,
      scope: a.recommendations
        ? `From the assessment's recommendations:\n\n${a.recommendations}`
        : null,
      status: 'draft',
      care_plan: {
        included: true,
        note: 'Every build includes its first 60 days of care at no charge; the plan below continues month to month after that, cancel anytime.',
        tiers: [
          { name: 'Watch', price: '', summary: 'Monitoring, error alerts, fixes when something breaks, and the monthly report.' },
          { name: 'Improve', price: '', summary: 'Everything in Watch, plus one enhancement like the ones on your roadmap each month.' },
          { name: 'Own', price: '', summary: 'Everything in Improve, with continuous improvement work and first-priority response.' },
        ],
      },
    })
    .select('id')
    .single()
  if (error || !data) {
    queryFailed('proposals', error)
    return
  }
  revalidatePath('/proposals')
  redirect(`/proposals/${data.id}?mode=edit`)
}

/**
 * Owner: create the build project from an APPROVED proposal and link them.
 */
export async function createProjectFromProposalAction(proposalId: string) {
  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.app_metadata?.role as string | undefined) !== 'owner') return

  const { data: p } = await supabase
    .from('proposals')
    .select('id, client_id, title, status, project_id')
    .eq('id', proposalId)
    .single()
  if (!p || p.status !== 'approved' || p.project_id) return

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      client_id: p.client_id,
      name: p.title.replace(/^Proposal[ —:-]*/i, '').trim() || p.title,
      status: 'active',
    })
    .select('id')
    .single()
  if (error || !project) {
    queryFailed('projects', error)
    return
  }
  await supabase.from('proposals').update({ project_id: project.id }).eq('id', p.id)
  revalidatePath(`/proposals/${p.id}`)
  revalidatePath('/projects')
  redirect(`/projects/${project.id}`)
}
