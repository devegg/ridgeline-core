import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Milestone, Deliverable } from '@/lib/types'

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: project, error: projectError },
    { data: milestones, error: milestonesError },
    { data: deliverables, error: deliverablesError },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('milestones').select('*').eq('project_id', id).order('sort_order').order('created_at'),
    supabase.from('deliverables').select('*').eq('project_id', id).eq('status', 'delivered').order('delivered_at'),
  ])

  if (queryFailed('projects', projectError)) {
    return <ErrorState title="Couldn't load this project" body="Refresh to try again. If it keeps happening, reach out." />
  }
  const milestonesFailed = queryFailed('milestones', milestonesError)
  const deliverablesFailed = queryFailed('deliverables', deliverablesError)

  if (!project) notFound()

  const completedMilestones = (milestones ?? []).filter(m => m.completed_at).length
  const totalMilestones = milestones?.length ?? 0

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="page-eyebrow">
          <Link href="/portal/projects" style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--rule)' }}>
            ← Projects
          </Link>
        </div>
        <h1 className="page-title" style={{ marginTop: 10 }}>{project.name}</h1>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status={project.status} />
          {project.start_date && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>
              {project.start_date}{project.end_date ? ` → ${project.end_date}` : ''}
            </span>
          )}
        </div>
      </div>

      {project.description && (
        <p style={{ fontSize: 15.5, color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: 28, maxWidth: '64ch' }}>
          {project.description}
        </p>
      )}

      {/* Milestones */}
      <div className="section-card">
        <div className="section-card__head">
          <span className="section-card__label">
            Milestones
            {totalMilestones > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--ink-soft)' }}>
                {completedMilestones}/{totalMilestones} complete
              </span>
            )}
          </span>
          {totalMilestones > 0 && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>
              {Math.round((completedMilestones / totalMilestones) * 100)}%
            </span>
          )}
        </div>
        <div className="section-card__body">
          {milestonesFailed ? (
            <div className="section-card__error">Milestones failed to load.</div>
          ) : !totalMilestones ? (
            <div className="section-card__empty">No milestones have been added yet.</div>
          ) : (
            (milestones as Milestone[]).map(m => (
              <div key={m.id} className="milestone-row" style={{ cursor: 'default' }}>
                <div
                  className={`milestone-row__check ${m.completed_at ? 'done' : ''}`}
                  style={{ cursor: 'default', pointerEvents: 'none' }}
                >
                  {m.completed_at && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`milestone-row__title ${m.completed_at ? 'done' : ''}`}>{m.title}</span>
                {m.due_date && (
                  <span className="milestone-row__date">
                    {new Date(m.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delivered deliverables */}
      <div className="section-card">
        <div className="section-card__head">
          <span className="section-card__label">Deliverables</span>
        </div>
        <div className="section-card__body">
          {deliverablesFailed ? (
            <div className="section-card__error">Deliverables failed to load.</div>
          ) : !deliverables?.length ? (
            <div className="section-card__empty">No deliverables have been shared yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Title</th><th>Delivered</th></tr></thead>
              <tbody>
                {(deliverables as Deliverable[]).map(d => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: 'var(--sans)' }}>{d.title}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                      {d.delivered_at ? new Date(d.delivered_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
