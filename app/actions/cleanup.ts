'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'

type CleanupTable = 'clients' | 'projects' | 'proposals' | 'assessments' | 'deliverables' | 'invoices'

// Restore-to values when un-scheduling a delete
const RESTORE_STATUS: Record<CleanupTable, string> = {
  clients: 'archived',
  projects: 'archived',
  proposals: 'archived',
  assessments: 'completed',
  deliverables: 'delivered',
  invoices: 'cancelled',
}

export async function scheduleDeleteAction(table: CleanupTable, id: string) {
  const supabase = await createSupabase()
  const { error } = await (supabase.from(table) as ReturnType<typeof supabase.from>).update({ status: 'scheduled_delete' }).eq('id', id)
  queryFailed(table, error)
  revalidatePath(`/${table === 'invoices' ? 'billing/invoices' : table}/${id}`)
  revalidatePath(`/${table === 'invoices' ? 'billing/invoices' : table}`)
  revalidatePath('/cleanup')
}

export async function restoreFromDeleteAction(table: CleanupTable, id: string) {
  const supabase = await createSupabase()
  const status = RESTORE_STATUS[table]
  const { error } = await (supabase.from(table) as ReturnType<typeof supabase.from>).update({ status }).eq('id', id)
  queryFailed(table, error)
  revalidatePath('/cleanup')
  revalidatePath(`/${table === 'invoices' ? 'billing/invoices' : table}`)
}

export async function permanentDeleteAction(table: CleanupTable, id: string) {
  const supabase = await createSupabase()
  const { error } = await (supabase.from(table) as ReturnType<typeof supabase.from>).delete().eq('id', id)
  queryFailed(table, error)
  revalidatePath('/cleanup')
  revalidatePath(`/${table === 'invoices' ? 'billing/invoices' : table}`)
}
