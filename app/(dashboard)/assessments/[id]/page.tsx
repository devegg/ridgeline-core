import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { completeAssessmentAction } from '@/app/actions/assessments'
import { draftProposalFromAssessmentAction } from '@/app/actions/proposals'
import { AssessmentForm } from '@/components/forms/AssessmentForm'
import { scheduleDeleteAction } from '@/app/actions/cleanup'
import { DocumentList } from '@/components/documents/DocumentList'
import { IntakePanel } from '@/components/assessments/IntakePanel'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Assessment, Document } from '@/lib/types'

export default async function AssessmentDetailPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams
  const supabase = await createClient()

  const [
    { data: assessment, error: assessmentError },
    { data: clients, error: clientsError },
    { data: projects, error: projectsError },
    { data: docs, error: docsError },
  ] = await Promise.all([
    supabase.from('assessments').select('*, client:clients(id, name), project:projects!project_id(id, name), follow_up:projects!follow_up_project_id(id, name)').eq('id', id).single(),
    supabase.from('clients').select('id, name').neq('status', 'archived').order('name'),
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
    supabase.from('documents').select('*').eq('entity_type', 'assessment').eq('entity_id', id).order('created_at', { ascending: false }),
  ])

  if (queryFailed('assessments', assessmentError)) return <ErrorState title="Couldn't load this assessment" />
  queryFailed('clients', clientsError)
  queryFailed('projects', projectsError)
  const docsFailed = queryFailed('documents', docsError)

  if (!assessment) notFound()
  const a = assessment as Assessment & {
    client: { id: string; name: string } | null
    project: { id: string; name: string } | null
    follow_up: { id: string; name: string } | null
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="page-eyebrow">Assessments · <StatusBadge status={a.status} /></div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{a.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {mode !== 'edit' ? (
            <Link href={`/assessments/${id}?mode=edit`} className="btn-outline">Edit</Link>
          ) : (
            <Link href={`/assessments/${id}`} className="btn-outline">Cancel</Link>
          )}
          {a.status !== 'completed' && (
            <form action={completeAssessmentAction.bind(null, id)}>
              <button type="submit" className="btn-success">Mark complete</button>
            </form>
          )}
          {a.client_id && (
            <form action={draftProposalFromAssessmentAction.bind(null, id)}>
              <button type="submit" className="btn-outline">Draft proposal from this</button>
            </form>
          )}
          {a.status !== 'scheduled_delete' && (
            <form action={scheduleDeleteAction.bind(null, 'assessments', id)}>
              <button type="submit" className="btn-danger" style={{ opacity: 0.7 }}>Schedule delete</button>
            </form>
          )}
        </div>
      </div>

      {mode === 'edit' ? (
        <AssessmentForm a={a} clients={clients ?? []} projects={projects ?? []} />
      ) : (
        <div className="detail-grid">
          <Field label="Client">
            {a.client ? <Link href={`/clients/${a.client.id}`} style={{ color: 'var(--blue)' }}>{a.client.name}</Link> : null}
          </Field>
          <Field label="Project">
            {a.project ? <Link href={`/projects/${a.project.id}`} style={{ color: 'var(--blue)' }}>{a.project.name}</Link> : null}
          </Field>
          <Field label="Scheduled">{a.scheduled_date}</Field>
          <Field label="Completed">{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : null}</Field>
          {a.follow_up && <Field label="Follow-up Project" full>
            <Link href={`/projects/${a.follow_up.id}`} style={{ color: 'var(--blue)' }}>{a.follow_up.name}</Link>
          </Field>}
          {a.findings && <Field label="Findings" full>{a.findings}</Field>}
          {a.recommendations && <Field label="Recommendations" full>{a.recommendations}</Field>}
        </div>
      )}

      <IntakePanel
        assessmentId={a.id}
        submittedAt={a.intake_submitted_at ?? null}
        answers={a.intake_answers ?? null}
      />

      {/* Documents */}
      <div className="section-card">
        <div className="section-card__head">
          <span className="section-card__label">Documents</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.12em' }}>
            {docs?.length ?? 0} file{docs?.length !== 1 ? 's' : ''}
          </span>
        </div>
        {docsFailed ? (
          <div className="section-card__error">Documents failed to load.</div>
        ) : (
          <DocumentList documents={(docs as Document[]) ?? []} entityType="assessment" entityId={id} />
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/assessments" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to assessments</Link>
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

