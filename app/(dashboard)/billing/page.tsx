import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Invoice } from '@/lib/types'

export default async function BillingPage() {
  const supabase = await createClient()

  const [{ data: invoices }, { data: overdue }] = await Promise.all([
    supabase.from('invoices').select('*, client:clients(id, name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('invoices').select('id').eq('status', 'overdue'),
  ])

  const allInvoices = (invoices as (Invoice & { client: { id: string; name: string } | null })[]) ?? []

  const outstanding = allInvoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + Number(i.total), 0)
  const paidThisMonth = allInvoices.filter(i => i.status === 'paid' && i.paid_at && new Date(i.paid_at).getMonth() === new Date().getMonth()).reduce((s, i) => s + Number(i.total), 0)
  const draftCount = allInvoices.filter(i => i.status === 'draft').length

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Billing</div>
        <h1 className="page-title">Billing Overview</h1>
      </div>

      <div className="page-actions">
        <Link href="/billing/invoices/new" className="btn-primary">New invoice <span className="arrow" /></Link>
        <Link href="/billing/invoices" className="btn-outline">All invoices</Link>
        <Link href="/billing/rates" className="btn-outline">Rates</Link>
      </div>

      {/* Stats */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)' }}>
        {[
          { label: 'Outstanding', value: `$${outstanding.toLocaleString()}`, sub: `${(overdue?.length ?? 0)} overdue` },
          { label: 'Paid this month', value: `$${paidThisMonth.toLocaleString()}`, sub: '' },
          { label: 'Draft invoices', value: String(draftCount), sub: 'not yet sent' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--paper)', padding: '24px 22px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', color: 'var(--ink)', lineHeight: 1 }}>{stat.value}</div>
            {stat.sub && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', marginTop: 6, letterSpacing: '0.1em' }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      {allInvoices.length > 0 && (
        <div className="section-card" style={{ marginTop: 32 }}>
          <div className="section-card__head">
            <span className="section-card__label">Recent Invoices</span>
            <Link href="/billing/invoices" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>All invoices →</Link>
          </div>
          <div className="section-card__body">
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Client</th><th>Total</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {allInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td><Link href={`/billing/invoices/${inv.id}`}>{inv.invoice_number ?? inv.id.slice(0, 8)}</Link></td>
                    <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                      {inv.client ? <Link href={`/clients/${inv.client.id}`} style={{ color: 'var(--blue)' }}>{inv.client.name}</Link> : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>${Number(inv.total).toLocaleString()}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>{inv.due_date ?? '—'}</td>
                    <td><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
