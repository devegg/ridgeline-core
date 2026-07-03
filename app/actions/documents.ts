'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import type { ActionState, DocumentEntityType } from '@/lib/types'

export async function uploadDocumentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const entityType = formData.get('entity_type') as DocumentEntityType
  const entityId = formData.get('entity_id') as string

  if (!name) return { errors: { name: 'Required' } }
  if (!content) return { errors: { content: 'File appears to be empty' } }

  const supabase = await createSupabase()
  const { error } = await supabase.from('documents').insert({
    name,
    content,
    entity_type: entityType,
    entity_id: entityId,
    is_shared: formData.get('is_shared') === 'true',
  })

  if (error) {
    queryFailed('documents', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/${entityType}s/${entityId}`)
  return { message: 'Document uploaded.' }
}

export async function toggleShareAction(documentId: string, entityType: DocumentEntityType, entityId: string, shared: boolean) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('documents').update({ is_shared: shared }).eq('id', documentId)
  queryFailed('documents', error)
  revalidatePath(`/${entityType}s/${entityId}`)
  revalidatePath('/portal/documents')
}

export async function deleteDocumentAction(documentId: string, entityType: DocumentEntityType, entityId: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  queryFailed('documents', error)
  revalidatePath(`/${entityType}s/${entityId}`)
}
