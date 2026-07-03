import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { createInvoiceAction } from '@/app/actions/billing'
import { queryFailed } from '@/lib/supabase/errors'

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const [
    { data: clients, error: clientsError },
    { data: projects, error: projectsError },
  ] = await Promise.all([
    supabase.from('clients').select('id, name').neq('status', 'archived').order('name'),
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
  ])
  queryFailed('clients', clientsError)
  queryFailed('projects', projectsError)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Billing · New Invoice</div>
        <h1 className="page-title">Create Invoice</h1>
      </div>

      <InvoiceForm action={createInvoiceAction} clients={clients ?? []} projects={projects ?? []} submitLabel="Save as draft" />

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/billing/invoices" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to invoices</Link>
      </p>
    </div>
  )
}
