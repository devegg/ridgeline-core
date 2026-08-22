'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { notifyClient } from '@/lib/portal/notify'
import type { ActionState } from '@/lib/types'

export async function createDeliverableAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  const projectId = formData.get('project_id') as string
  if (!title) return { errors: { title: 'Required' } }
  if (!projectId) return { errors: { project_id: 'Required' } }

  const supabase = await createSupabase()
  const { error } = await supabase.from('deliverables').insert({
    title,
    project_id: projectId,
    description: formData.get('description') || null,
    due_date: formData.get('due_date') || null,
    status: 'pending',
  })

  if (error) {
    queryFailed('deliverables', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath('/deliverables')
  revalidatePath(`/projects/${projectId}`)
  return { message: 'Deliverable added.' }
}

export async function approveDeliverableAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('deliverables')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', id)
  queryFailed('deliverables', error)
  revalidatePath('/deliverables')
  revalidatePath(`/deliverables/${id}`)
}

export async function deliverToClientAction(id: string, formData?: FormData) {
  const supabase = await createSupabase()
  // Deliverables carry no client_id — they hang off a project, which does.
  const { data: deliverable } = await supabase
    .from('deliverables')
    .select('title, project:projects(client_id)')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('deliverables')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', id)
  queryFailed('deliverables', error)

  const outcome = await notifyClient({
    clientId: (deliverable as { project?: { client_id?: string } | null } | null)?.project?.client_id,
    kind: 'deliverable_delivered',
    title: (deliverable as { title?: string } | null)?.title ?? 'Deliverable',
    path: '/portal/deliverables',
    notify: formData?.get('notify') === 'on',
  })

  revalidatePath('/deliverables')
  revalidatePath(`/deliverables/${id}`)
  redirect(`/deliverables/${id}?notified=${outcome}`)
}

export async function updateDeliverableStatusAction(id: string, status: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('deliverables').update({ status }).eq('id', id)
  queryFailed('deliverables', error)
  revalidatePath('/deliverables')
  revalidatePath(`/deliverables/${id}`)
}
