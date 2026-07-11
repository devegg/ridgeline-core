'use server'

import { createClient as createSupabase } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState, LineItem } from '@/lib/types'

export async function createInvoiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const clientId = formData.get('client_id') as string
  if (!clientId) return { errors: { client_id: 'Required' } }

  const lineItemsRaw = formData.get('line_items') as string
  let lineItems: LineItem[] = []
  try { lineItems = lineItemsRaw ? JSON.parse(lineItemsRaw) : [] } catch { /* empty */ }

  const subtotal = lineItems.reduce((sum, li) => sum + (li.amount ?? 0), 0)

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      client_id: clientId,
      project_id: formData.get('project_id') || null,
      invoice_number: formData.get('invoice_number') || null,
      line_items: lineItems,
      subtotal,
      total: subtotal,
      status: 'draft',
      due_date: formData.get('due_date') || null,
      notes: formData.get('notes') || null,
      pay_link: (formData.get('pay_link') as string)?.trim() || null,
    })
    .select('id')
    .single()

  if (error) {
    queryFailed('invoices', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath('/billing/invoices')
  redirect(`/billing/invoices/${data.id}`)
}

export async function updateInvoiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string
  const lineItemsRaw = formData.get('line_items') as string
  let lineItems: LineItem[] = []
  try { lineItems = lineItemsRaw ? JSON.parse(lineItemsRaw) : [] } catch { /* empty */ }

  const subtotal = lineItems.reduce((sum, li) => sum + (li.amount ?? 0), 0)

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('invoices')
    .update({
      client_id: formData.get('client_id') || null,
      project_id: formData.get('project_id') || null,
      invoice_number: formData.get('invoice_number') || null,
      line_items: lineItems,
      subtotal,
      total: subtotal,
      due_date: formData.get('due_date') || null,
      notes: formData.get('notes') || null,
      pay_link: (formData.get('pay_link') as string)?.trim() || null,
    })
    .eq('id', id)

  if (error) {
    queryFailed('invoices', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath(`/billing/invoices/${id}`)
  revalidatePath('/billing/invoices')
  return { message: 'Saved.' }
}

export async function sendInvoiceAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('invoices').update({ status: 'sent' }).eq('id', id)
  queryFailed('invoices', error)
  revalidatePath(`/billing/invoices/${id}`)
  revalidatePath('/billing/invoices')
}

export async function markInvoicePaidAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
  queryFailed('invoices', error)
  revalidatePath(`/billing/invoices/${id}`)
  revalidatePath('/billing/invoices')
  revalidatePath('/billing')
}

export async function cancelInvoiceAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', id)
  queryFailed('invoices', error)
  revalidatePath('/billing/invoices')
  redirect('/billing/invoices')
}

export async function createRateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const label = (formData.get('label') as string)?.trim()
  const rate = Number(formData.get('rate'))
  if (!label) return { errors: { label: 'Required' } }
  if (!rate || rate <= 0) return { errors: { rate: 'Must be a positive number' } }

  const supabase = await createSupabase()
  const { error } = await supabase.from('billing_rates').insert({
    label,
    rate,
    rate_type: formData.get('rate_type') || 'hourly',
    project_id: formData.get('project_id') || null,
    is_default: formData.get('is_default') === 'true',
  })

  if (error) {
    queryFailed('billing_rates', error)
    return { errors: { _root: error.message } }
  }

  revalidatePath('/billing/rates')
  return { message: 'Rate added.' }
}

export async function deleteRateAction(id: string) {
  const supabase = await createSupabase()
  const { error } = await supabase.from('billing_rates').delete().eq('id', id)
  queryFailed('billing_rates', error)
  revalidatePath('/billing/rates')
}
