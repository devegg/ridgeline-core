import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Assessment, AssessmentStatus } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

export default async function AssessmentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const current = status || 'all'
  const supabase = await createClient()

  let query = supabase.from('assessments').select('*, client:clients(id, name)').order('scheduled_date', { ascending: true, nullsFirst: false })
  if (current !== 'all') query = query.eq('status', current as AssessmentStatus)
  const { data: assessments } = await query

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Assessments</div>
        <h1 className="page-title">All Assessments</h1>
        <p className="page-description">{assessments?.length ?? 0} assessment{assessments?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="page-actions">
        <Link href="/assessments/new" className="btn-primary">New assessment <span className="arrow" /></Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <FilterTabs tabs={TABS} current={current} basePath="/assessments" />

        {!assessments?.length ? (
          <EmptyState title="No assessments" body={current === 'all' ? 'Create your first assessment record.' : `No ${current.replace('_', ' ')} assessments.`} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Title</th><th>Client</th><th>Scheduled</th><th>Status</th></tr></thead>
              <tbody>
                {(assessments as (Assessment & { client: { id: string; name: string } | null })[]).map(a => (
                  <tr key={a.id}>
                    <td><Link href={`/assessments/${a.id}`}>{a.title}</Link></td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                      {a.client ? <Link href={`/clients/${a.client.id}`} style={{ color: 'var(--blue)' }}>{a.client.name}</Link> : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>{a.scheduled_date ?? '—'}</td>
                    <td><StatusBadge status={a.status} /></td>
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
