import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Invoice, LineItem } from '@/lib/types'

// Client-facing invoice detail. RLS scopes reads to the client's own
// non-draft invoices, so a wrong/foreign id simply resolves to notFound().
export default async function PortalInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single<Invoice>()

  if (!invoice) notFound()
  const items = (invoice.line_items ?? []) as LineItem[]

  return (
    <div className="portal-page">
      <div className="page-header">
        <div className="page-eyebrow">Invoice</div>
        <h1 className="page-title">{invoice.invoice_number ?? invoice.id.slice(0, 8)}</h1>
        <p className="page-description">
          <StatusBadge status={invoice.status} />
          {invoice.due_date && (
            <span style={{ marginLeft: 12 }}>Due {new Date(invoice.due_date).toLocaleDateString()}</span>
          )}
        </p>
      </div>

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Rate</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4}>No line items recorded.</td>
              </tr>
            ) : (
              items.map((li, i) => (
                <tr key={i}>
                  <td>{li.description}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{li.quantity}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>${Number(li.rate).toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>${Number(li.amount).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                Total
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                ${Number(invoice.total).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.notes && (
        <div className="section-card" style={{ marginTop: 16 }}>
          <div className="section-card__body">{invoice.notes}</div>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/portal/billing">← Back to billing</Link>
      </p>
    </div>
  )
}
