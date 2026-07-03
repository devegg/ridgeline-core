'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types'

export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { errors: { name: 'Required' } }

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      client_id: formData.get('client_id') || null,
      description: formData.get('description') || null,
      scope: formData.get('scope') || null,
      status: formData.get('status') || 'active',
      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
    })
    .select('id')
    .single()

  if (error) {
    queryFailed('projects', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath('/projects')
  redirect(`/projects/${data.id}`)
}

export async function updateProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { errors: { name: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('projects')
    .update({
      name,
      client_id: formData.get('client_id') || null,
      description: formData.get('description') || null,
      scope: formData.get('scope') || null,
      status: formData.get('status') || 'active',
      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
    })
    .eq('id', id)

  if (error) {
    queryFailed('projects', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/projects/${id}`)
  revalidatePath('/projects')
  return { message: 'Saved.' }
}

export async function closeProjectAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('projects').update({ status: 'completed' }).eq('id', id)
  queryFailed('projects', error)
  revalidatePath(`/projects/${id}`)
  revalidatePath('/projects')
}

export async function archiveProjectAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('projects').update({ status: 'archived' }).eq('id', id)
  queryFailed('projects', error)
  revalidatePath('/projects')
  redirect('/projects')
}

export async function addMilestoneAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = formData.get('project_id') as string
  const title = (formData.get('title') as string)?.trim()
  if (!title) return { errors: { title: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('milestones')
    .insert({ project_id: projectId, title, due_date: formData.get('due_date') || null })

  if (error) {
    queryFailed('milestones', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/projects/${projectId}`)
  return null
}

export async function toggleMilestoneAction(milestoneId: string, projectId: string, completed: boolean) {
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('milestones')
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq('id', milestoneId)
  queryFailed('milestones', error)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteMilestoneAction(milestoneId: string, projectId: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('milestones').delete().eq('id', milestoneId)
  queryFailed('milestones', error)
  revalidatePath(`/projects/${projectId}`)
}
