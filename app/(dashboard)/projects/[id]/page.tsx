import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { MilestoneList } from '@/components/projects/MilestoneList'
import { archiveProjectAction, closeProjectAction, updateProjectAction } from '@/app/actions/projects'
import { scheduleDeleteAction } from '@/app/actions/cleanup'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Project, Milestone, Deliverable } from '@/lib/types'

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams
  const supabase = await createClient()

  const [
    { data: project, error: projectError },
    { data: milestones, error: milestonesError },
    { data: deliverables, error: deliverablesError },
    { data: clients, error: clientsError },
  ] =
    await Promise.all([
      supabase.from('projects').select('*, client:clients(id, name)').eq('id', id).single(),
      supabase.from('milestones').select('*').eq('project_id', id).order('sort_order').order('created_at'),
      supabase.from('deliverables').select('*').eq('project_id', id).order('due_date'),
      supabase.from('clients').select('id, name').neq('status', 'archived').order('name'),
    ])

  if (queryFailed('projects', projectError)) return <ErrorState title="Couldn't load this project" />
  const milestonesFailed = queryFailed('milestones', milestonesError)
  const deliverablesFailed = queryFailed('deliverables', deliverablesError)
  queryFailed('clients', clientsError)

  if (!project) notFound()
  const p = project as Project & { client: { id: string; name: string } | null }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="page-eyebrow">Projects{p.client ? ` · ${p.client.name}` : ''}</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{p.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {mode !== 'edit' ? (
            <Link href={`/projects/${id}?mode=edit`} className="btn-outline">Edit</Link>
          ) : (
            <Link href={`/projects/${id}`} className="btn-outline">Cancel</Link>
          )}
          {p.status === 'active' && (
            <form action={closeProjectAction.bind(null, id)}>
              <button type="submit" className="btn-outline">Mark complete</button>
            </form>
          )}
          {p.status !== 'archived' && (
            <form action={archiveProjectAction.bind(null, id)}>
              <button type="submit" className="btn-danger">Archive</button>
            </form>
          )}
          {p.status !== 'scheduled_delete' && (
            <form action={scheduleDeleteAction.bind(null, 'projects', id)}>
              <button type="submit" className="btn-danger" style={{ opacity: 0.7 }}>Schedule delete</button>
            </form>
          )}
        </div>
      </div>

      {mode === 'edit' ? (
        <ProjectForm action={updateProjectAction} project={p} clients={clients ?? []} submitLabel="Save changes" />
      ) : (
        <div className="detail-grid">
          <Field label="Status"><StatusBadge status={p.status} /></Field>
          <Field label="Client">
            {p.client ? <Link href={`/clients/${p.client.id}`} style={{ color: 'var(--blue)' }}>{p.client.name}</Link> : null}
          </Field>
          <Field label="Start Date">{p.start_date}</Field>
          <Field label="Target End">{p.end_date}</Field>
          {p.description && <Field label="Description" full>{p.description}</Field>}
          {p.scope && <Field label="Scope" full>{p.scope}</Field>}
        </div>
      )}

      {/* Milestones */}
      <div className="section-card">
        <div className="section-card__head">
          <span className="section-card__label">
            Milestones
            <span style={{ marginLeft: 8, color: 'var(--ink-soft)' }}>
              ({((milestones as Milestone[]) ?? []).filter(m => m.completed_at).length}/{milestones?.length ?? 0} done)
            </span>
          </span>
        </div>
        {milestonesFailed ? (
          <div className="section-card__error">Milestones failed to load.</div>
        ) : (
          <MilestoneList milestones={(milestones as Milestone[]) ?? []} projectId={id} />
        )}
      </div>

      {/* Deliverables */}
      <div className="section-card">
        <div className="section-card__head">
          <span className="section-card__label">Deliverables</span>
          <Link href={`/deliverables?project_id=${id}`} style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            View all →
          </Link>
        </div>
        <div className="section-card__body">
          {deliverablesFailed ? (
            <div className="section-card__error">Deliverables failed to load.</div>
          ) : !deliverables?.length ? (
            <div className="section-card__empty">No deliverables linked to this project.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Title</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {(deliverables as Deliverable[]).map((d) => (
                  <tr key={d.id}>
                    <td><Link href={`/deliverables/${d.id}`}>{d.title}</Link></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{d.due_date ?? '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/projects" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to projects</Link>
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
