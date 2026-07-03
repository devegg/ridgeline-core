import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Invoice, InvoiceStatus } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const current = status || 'all'
  const supabase = await createClient()

  let query = supabase.from('invoices').select('*, client:clients(id, name)').order('created_at', { ascending: false })
  if (current !== 'all') query = query.eq('status', current as InvoiceStatus)
  const { data: invoices, error } = await query
  const loadFailed = queryFailed('invoices', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Billing · Invoices</div>
        <h1 className="page-title">Invoices</h1>
        <p className="page-description">{invoices?.length ?? 0} invoice{invoices?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="page-actions">
        <Link href="/billing/invoices/new" className="btn-primary">New invoice <span className="arrow" /></Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <FilterTabs tabs={TABS} current={current} basePath="/billing/invoices" />

        {loadFailed ? (
          <ErrorState title="Couldn't load invoices" />
        ) : !invoices?.length ? (
          <EmptyState title="No invoices" body={current === 'all' ? 'Create your first invoice.' : `No ${current} invoices.`} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Client</th><th>Total</th><th>Due</th><th>Paid</th><th>Status</th></tr></thead>
              <tbody>
                {(invoices as (Invoice & { client: { id: string; name: string } | null })[]).map(inv => (
                  <tr key={inv.id}>
                    <td><Link href={`/billing/invoices/${inv.id}`}>{inv.invoice_number ?? inv.id.slice(0, 8)}</Link></td>
                    <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                      {inv.client ? <Link href={`/clients/${inv.client.id}`} style={{ color: 'var(--blue)' }}>{inv.client.name}</Link> : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>${Number(inv.total).toLocaleString()}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>{inv.due_date ?? '—'}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '—'}</td>
                    <td><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
