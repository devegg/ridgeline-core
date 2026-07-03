import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Project, ProjectStatus } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
]

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()
  const current = status || 'all'

  let query = supabase
    .from('projects')
    .select('*, client:clients(id, name)')
    .order('created_at', { ascending: false })
  if (current !== 'all') query = query.eq('status', current as ProjectStatus)

  const { data: projects } = await query

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Projects</div>
        <h1 className="page-title">All Projects</h1>
        <p className="page-description">{projects?.length ?? 0} project{projects?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="page-actions">
        <Link href="/projects/new" className="btn-primary">New project <span className="arrow" /></Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <FilterTabs tabs={TABS} current={current} basePath="/projects" />

        {!projects?.length ? (
          <EmptyState
            title="No projects yet"
            body={current === 'all' ? 'Create your first project to get started.' : `No ${current.replace('_', ' ')} projects.`}
            actionLabel={current === 'all' ? 'New project' : undefined}
            actionHref={current === 'all' ? '/projects/new' : undefined}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Start</th>
                  <th>Target End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(projects as (Project & { client: { id: string; name: string } | null })[]).map((p) => (
                  <tr key={p.id}>
                    <td><Link href={`/projects/${p.id}`}>{p.name}</Link></td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                      {p.client ? <Link href={`/clients/${p.client.id}`} style={{ color: 'var(--blue)' }}>{p.client.name}</Link> : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{p.start_date ?? '—'}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{p.end_date ?? '—'}</td>
                    <td><StatusBadge status={p.status} /></td>
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
