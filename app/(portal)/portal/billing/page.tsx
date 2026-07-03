import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Invoice } from '@/lib/types'

export default async function PortalBillingPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  const outstanding = (invoices ?? [])
    .filter(i => ['sent', 'overdue'].includes(i.status))
    .reduce((s, i) => s + Number(i.total), 0)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Billing</div>
        <h1 className="page-title">Invoices</h1>
        <p className="page-description">Your invoices from Ridgeline Knows.</p>
      </div>

      {!invoices?.length ? (
        <EmptyState
          title="No invoices yet"
          body="Invoices will appear here once they have been issued."
        />
      ) : (
        <>
          {outstanding > 0 && (
            <div style={{ marginTop: 28, padding: '20px 24px', border: '1px solid var(--rule)', background: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>
                  Outstanding balance
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink)' }}>
                  ${outstanding.toLocaleString()}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Questions? Contact us at<br />info@ridgelineknows.com
              </div>
            </div>
          )}

          <div className="table-wrap" style={{ marginTop: outstanding > 0 ? 16 : 28 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(invoices as Invoice[]).map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {inv.invoice_number ?? inv.id.slice(0, 8)}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      ${Number(inv.total).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                      {inv.due_date ?? '—'}
                    </td>
                    <td><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
