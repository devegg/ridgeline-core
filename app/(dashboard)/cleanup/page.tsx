import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { restoreFromDeleteAction, permanentDeleteAction } from '@/app/actions/cleanup'

export default async function CleanupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if ((user?.app_metadata?.role as string | undefined) === 'client') redirect('/portal')

  const [
    { data: clients },
    { data: projects },
    { data: proposals },
    { data: assessments },
    { data: deliverables },
    { data: invoices },
  ] = await Promise.all([
    supabase.from('clients').select('id, name, status, created_at').eq('status', 'scheduled_delete').order('name'),
    supabase.from('projects').select('id, name, status, created_at').eq('status', 'scheduled_delete').order('name'),
    supabase.from('proposals').select('id, title, status, created_at').eq('status', 'scheduled_delete').order('title'),
    supabase.from('assessments').select('id, title, status, created_at').eq('status', 'scheduled_delete').order('title'),
    supabase.from('deliverables').select('id, title, status, created_at').eq('status', 'scheduled_delete').order('title'),
    supabase.from('invoices').select('id, invoice_number, status, created_at, total').eq('status', 'scheduled_delete').order('created_at'),
  ])

  const totalFlagged =
    (clients?.length ?? 0) + (projects?.length ?? 0) + (proposals?.length ?? 0) +
    (assessments?.length ?? 0) + (deliverables?.length ?? 0) + (invoices?.length ?? 0)

  const sections = [
    { label: 'Clients', table: 'clients' as const, rows: clients ?? [], href: (id: string) => `/clients/${id}`, name: (r: { name?: string; title?: string; invoice_number?: string | null }) => r.name },
    { label: 'Projects', table: 'projects' as const, rows: projects ?? [], href: (id: string) => `/projects/${id}`, name: (r: { name?: string; title?: string }) => r.name },
    { label: 'Proposals', table: 'proposals' as const, rows: proposals ?? [], href: (id: string) => `/proposals/${id}`, name: (r: { name?: string; title?: string }) => r.title },
    { label: 'Assessments', table: 'assessments' as const, rows: assessments ?? [], href: (id: string) => `/assessments/${id}`, name: (r: { name?: string; title?: string }) => r.title },
    { label: 'Deliverables', table: 'deliverables' as const, rows: deliverables ?? [], href: (id: string) => `/deliverables/${id}`, name: (r: { name?: string; title?: string }) => r.title },
    { label: 'Invoices', table: 'invoices' as const, rows: invoices ?? [], href: (id: string) => `/billing/invoices/${id}`, name: (r: { name?: string; title?: string; invoice_number?: string | null; total?: number }) => r.invoice_number ?? `Invoice — $${Number(r.total ?? 0).toLocaleString()}` },
  ]

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Owner only · Cleanup</div>
        <h1 className="page-title">Scheduled for Deletion</h1>
        <p className="page-description">
          {totalFlagged === 0
            ? 'No records are currently scheduled for deletion.'
            : `${totalFlagged} record${totalFlagged !== 1 ? 's' : ''} flagged. Review each one before permanently deleting.`
          }
        </p>
      </div>

      {totalFlagged === 0 ? (
        <div style={{ marginTop: 40, padding: '48px 32px', border: '1px solid var(--rule)', background: 'var(--paper)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 10 }}>All clear</div>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>No records are scheduled for deletion. Use "Schedule delete" on any detail page to flag a record for review here.</p>
        </div>
      ) : (
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sections.filter(s => s.rows.length > 0).map(section => (
            <div key={section.label} className="section-card">
              <div className="section-card__head">
                <span className="section-card__label">{section.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.12em' }}>
                  {section.rows.length} record{section.rows.length !== 1 ? 's' : ''}
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name / Title</th>
                    <th>Flagged on</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row: { id: string; created_at: string; name?: string; title?: string; invoice_number?: string | null; total?: number }) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={section.href(row.id)}>
                          {section.name(row) ?? row.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                        {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <form action={restoreFromDeleteAction.bind(null, section.table, row.id)}>
                            <button type="submit" className="btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>
                              Restore
                            </button>
                          </form>
                          <form action={permanentDeleteAction.bind(null, section.table, row.id)}>
                            <button type="submit" className="btn-danger" style={{ fontSize: 12, padding: '5px 12px' }}>
                              Delete permanently
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div style={{ padding: '16px 20px', border: '1px solid rgba(177,75,60,0.2)', background: 'rgba(177,75,60,0.04)' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B2A1E' }}>
              Permanent deletion cannot be undone. Deleting a project also removes its milestones and deliverables.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
