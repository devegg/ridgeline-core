'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types'

export async function createAssessmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  if (!title) return { errors: { title: 'Required' } }

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      title,
      client_id: formData.get('client_id') || null,
      project_id: formData.get('project_id') || null,
      scheduled_date: formData.get('scheduled_date') || null,
      status: 'scheduled',
    })
    .select('id')
    .single()

  if (error) {
    queryFailed('assessments', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath('/assessments')
  redirect(`/assessments/${data.id}`)
}

export async function updateAssessmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  const title = (formData.get('title') as string)?.trim()
  if (!title) return { errors: { title: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('assessments')
    .update({
      title,
      client_id: formData.get('client_id') || null,
      project_id: formData.get('project_id') || null,
      scheduled_date: formData.get('scheduled_date') || null,
      findings: formData.get('findings') || null,
      recommendations: formData.get('recommendations') || null,
    })
    .eq('id', id)

  if (error) {
    queryFailed('assessments', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/assessments/${id}`)
  revalidatePath('/assessments')
  return { message: 'Saved.' }
}

export async function completeAssessmentAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('assessments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
  queryFailed('assessments', error)
  revalidatePath(`/assessments/${id}`)
  revalidatePath('/assessments')
}

export async function linkAssessmentToProjectAction(assessmentId: string, projectId: string) {
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('assessments')
    .update({ follow_up_project_id: projectId })
    .eq('id', assessmentId)
  queryFailed('assessments', error)
  revalidatePath(`/assessments/${assessmentId}`)
}
