import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Deliverable, DeliverableStatus } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Approved', value: 'approved' },
  { label: 'Delivered', value: 'delivered' },
]

export default async function DeliverablesPage({ searchParams }: { searchParams: Promise<{ status?: string; project_id?: string }> }) {
  const { status, project_id } = await searchParams
  const current = status || 'all'
  const supabase = await createClient()

  let query = supabase.from('deliverables').select('*, project:projects(id, name)').order('due_date', { ascending: true, nullsFirst: false })
  if (current !== 'all') query = query.eq('status', current as DeliverableStatus)
  if (project_id) query = query.eq('project_id', project_id)
  const { data: deliverables, error } = await query
  const loadFailed = queryFailed('deliverables', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Deliverables</div>
        <h1 className="page-title">Deliverables</h1>
        <p className="page-description">{deliverables?.length ?? 0} deliverable{deliverables?.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ marginTop: 28 }}>
        <FilterTabs tabs={TABS} current={current} basePath="/deliverables" />

        {loadFailed ? (
          <ErrorState title="Couldn't load deliverables" />
        ) : !deliverables?.length ? (
          <EmptyState title="No deliverables" body="Deliverables are created from project pages." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Title</th><th>Project</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {(deliverables as (Deliverable & { project: { id: string; name: string } | null })[]).map(d => (
                  <tr key={d.id}>
                    <td><Link href={`/deliverables/${d.id}`}>{d.title}</Link></td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                      {d.project ? <Link href={`/projects/${d.project.id}`} style={{ color: 'var(--blue)' }}>{d.project.name}</Link> : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: d.due_date && new Date(d.due_date) < new Date() && !['approved','delivered'].includes(d.status) ? '#B14B3C' : 'var(--ink-soft)' }}>
                      {d.due_date ?? '—'}
                    </td>
                    <td><StatusBadge status={d.status} /></td>
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
