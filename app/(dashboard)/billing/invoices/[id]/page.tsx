import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { updateInvoiceAction, sendInvoiceAction, markInvoicePaidAction, cancelInvoiceAction } from '@/app/actions/billing'
import { scheduleDeleteAction } from '@/app/actions/cleanup'
import type { Invoice } from '@/lib/types'

export default async function InvoiceDetailPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams
  const supabase = await createClient()

  const [{ data: invoice }, { data: clients }, { data: projects }] = await Promise.all([
    supabase.from('invoices').select('*, client:clients(id, name), project:projects(id, name)').eq('id', id).single(),
    supabase.from('clients').select('id, name').neq('status', 'archived').order('name'),
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
  ])

  if (!invoice) notFound()
  const inv = invoice as Invoice & {
    client: { id: string; name: string } | null
    project: { id: string; name: string } | null
  }

  const lineItems = Array.isArray(inv.line_items) ? inv.line_items : []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="page-eyebrow">Billing · Invoices · <StatusBadge status={inv.status} /></div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{inv.invoice_number ?? `Invoice ${inv.id.slice(0, 8)}`}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {mode !== 'edit' ? (
            <Link href={`/billing/invoices/${id}?mode=edit`} className="btn-outline">Edit</Link>
          ) : (
            <Link href={`/billing/invoices/${id}`} className="btn-outline">Cancel</Link>
          )}
          {inv.status === 'draft' && (
            <form action={sendInvoiceAction.bind(null, id)}>
              <button type="submit" className="btn-primary">Send invoice <span className="arrow" /></button>
            </form>
          )}
          {['sent', 'overdue'].includes(inv.status) && (
            <form action={markInvoicePaidAction.bind(null, id)}>
              <button type="submit" className="btn-success">Mark paid</button>
            </form>
          )}
          {!['paid', 'cancelled'].includes(inv.status) && (
            <form action={cancelInvoiceAction.bind(null, id)}>
              <button type="submit" className="btn-danger">Cancel</button>
            </form>
          )}
          {inv.status !== 'scheduled_delete' && (
            <form action={scheduleDeleteAction.bind(null, 'invoices', id)}>
              <button type="submit" className="btn-danger" style={{ opacity: 0.7 }}>Schedule delete</button>
            </form>
          )}
        </div>
      </div>

      {mode === 'edit' ? (
        <InvoiceForm action={updateInvoiceAction} invoice={inv} clients={clients ?? []} projects={projects ?? []} submitLabel="Save changes" />
      ) : (
        <>
          <div className="detail-grid" style={{ marginBottom: 28 }}>
            <Field label="Client">
              {inv.client ? <Link href={`/clients/${inv.client.id}`} style={{ color: 'var(--blue)' }}>{inv.client.name}</Link> : null}
            </Field>
            <Field label="Project">
              {inv.project ? <Link href={`/projects/${inv.project.id}`} style={{ color: 'var(--blue)' }}>{inv.project.name}</Link> : null}
            </Field>
            <Field label="Due Date">{inv.due_date}</Field>
            <Field label="Paid">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : null}</Field>
            {inv.notes && <Field label="Notes" full>{inv.notes}</Field>}
          </div>

          {/* Line items */}
          {lineItems.length > 0 && (
            <div className="section-card">
              <div className="section-card__head"><span className="section-card__label">Line Items</span></div>
              <table className="data-table">
                <thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--sans)' }}>{li.description}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 13, textAlign: 'right' }}>{li.quantity}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 13, textAlign: 'right' }}>${li.rate.toFixed(2)}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 13, textAlign: 'right' }}>${li.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Total</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 600, textAlign: 'right' }}>${Number(inv.total).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/billing/invoices" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to invoices</Link>
      </p>
    </div>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`detail-field${full ? ' detail-full' : ''}`}>
      <div className="detail-field__label">{label}</div>
      {children
        ? <div className="detail-field__value">{children}</div>
        : <div className="detail-field__value-empty">—</div>
      }
    </div>
  )
}
