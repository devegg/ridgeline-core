import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Deliverable } from '@/lib/types'

export default async function PortalDeliverablesPage() {
  const supabase = await createClient()

  const { data: deliverables, error } = await supabase
    .from('deliverables')
    .select('*, project:projects(id, name)')
    .eq('status', 'delivered')
    .order('delivered_at', { ascending: false })
  const loadFailed = queryFailed('deliverables', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Deliverables</div>
        <h1 className="page-title">Delivered Work</h1>
        <p className="page-description">Items that have been completed and released to you.</p>
      </div>

      {loadFailed ? (
        <ErrorState title="Couldn't load your deliverables" body="Refresh to try again. If it keeps happening, reach out." />
      ) : !deliverables?.length ? (
        <EmptyState
          title="Nothing delivered yet"
          body="Completed deliverables will appear here once they have been released by Ridgeline Knows."
        />
      ) : (
        <div className="table-wrap" style={{ marginTop: 28 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Delivered</th>
              </tr>
            </thead>
            <tbody>
              {(deliverables as (Deliverable & { project: { id: string; name: string } | null })[]).map(d => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'var(--sans)' }}>{d.title}</td>
                  <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{d.project?.name ?? '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                    {d.delivered_at
                      ? new Date(d.delivered_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
