import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'

export default async function PortalProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const clientId = user?.app_metadata?.client_id as string | undefined

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  const loadFailed = queryFailed('projects', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">My Projects</div>
        <h1 className="page-title">Projects</h1>
        {clientId ? (
          <p className="page-description">{projects?.length ?? 0} project{projects?.length !== 1 ? 's' : ''} in your workspace.</p>
        ) : (
          <p className="page-description">Contact us if you don&rsquo;t see your projects.</p>
        )}
      </div>

      {loadFailed ? (
        <ErrorState title="Couldn't load your projects" body="Refresh to try again. If it keeps happening, reach out." />
      ) : !projects?.length ? (
        <EmptyState
          title="No projects yet"
          body="Your projects will appear here once they have been set up. Reach out if you expected to see something."
        />
      ) : (
        <div className="table-wrap" style={{ marginTop: 28 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Start</th>
                <th>Target End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td><Link href={`/portal/projects/${p.id}`}>{p.name}</Link></td>
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
  )
}
