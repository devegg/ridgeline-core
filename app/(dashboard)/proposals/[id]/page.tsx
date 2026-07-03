import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProposalForm } from '@/components/forms/ProposalForm'
import {
  updateProposalAction, approveProposalAction, sendProposalAction,
  rejectProposalAction, acceptProposalAction, archiveProposalAction,
} from '@/app/actions/proposals'
import { scheduleDeleteAction } from '@/app/actions/cleanup'
import { DocumentList } from '@/components/documents/DocumentList'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Proposal, Document } from '@/lib/types'

export default async function ProposalDetailPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams
  const supabase = await createClient()

  const [
    { data: proposal, error: proposalError },
    { data: clients, error: clientsError },
    { data: projects, error: projectsError },
    { data: docs, error: docsError },
  ] = await Promise.all([
    supabase.from('proposals').select('*, client:clients(id, name), project:projects(id, name)').eq('id', id).single(),
    supabase.from('clients').select('id, name').neq('status', 'archived').order('name'),
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
    supabase.from('documents').select('*').eq('entity_type', 'proposal').eq('entity_id', id).order('created_at', { ascending: false }),
  ])

  if (queryFailed('proposals', proposalError)) return <ErrorState title="Couldn't load this proposal" />
  queryFailed('clients', clientsError)
  queryFailed('projects', projectsError)
  const docsFailed = queryFailed('documents', docsError)

  if (!proposal) notFound()
  const p = proposal as Proposal & { client: { id: string; name: string } | null; project: { id: string; name: string } | null }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="page-eyebrow">Proposals · <StatusBadge status={p.status} /></div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{p.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {mode !== 'edit' ? (
            <Link href={`/proposals/${id}?mode=edit`} className="btn-outline">Edit</Link>
          ) : (
            <Link href={`/proposals/${id}`} className="btn-outline">Cancel</Link>
          )}
          {p.status === 'draft' && (
            <form action={sendProposalAction.bind(null, id)}>
              <button type="submit" className="btn-primary">Send to client <span className="arrow" /></button>
            </form>
          )}
          {p.status === 'pending' && (
            <>
              <form action={acceptProposalAction.bind(null, id)}>
                <button type="submit" className="btn-success">Mark accepted</button>
              </form>
              <form action={rejectProposalAction.bind(null, id)}>
                <button type="submit" className="btn-danger">Mark rejected</button>
              </form>
            </>
          )}
          {!['archived'].includes(p.status) && (
            <form action={archiveProposalAction.bind(null, id)}>
              <button type="submit" className="btn-outline">Archive</button>
            </form>
          )}
          {p.status !== 'scheduled_delete' && (
            <form action={scheduleDeleteAction.bind(null, 'proposals', id)}>
              <button type="submit" className="btn-danger" style={{ opacity: 0.7 }}>Schedule delete</button>
            </form>
          )}
        </div>
      </div>

      {mode === 'edit' ? (
        <ProposalForm action={updateProposalAction} proposal={p} clients={clients ?? []} projects={projects ?? []} submitLabel="Save changes" />
      ) : (
        <div className="detail-grid">
          <Field label="Client">
            {p.client ? <Link href={`/clients/${p.client.id}`} style={{ color: 'var(--blue)' }}>{p.client.name}</Link> : null}
          </Field>
          <Field label="Project">
            {p.project ? <Link href={`/projects/${p.project.id}`} style={{ color: 'var(--blue)' }}>{p.project.name}</Link> : null}
          </Field>
          <Field label="Total Amount">
            {p.total_amount != null ? `$${Number(p.total_amount).toLocaleString()}` : null}
          </Field>
          <Field label="Sent">{p.sent_at ? new Date(p.sent_at).toLocaleDateString() : null}</Field>
          <Field label="Accepted">{p.accepted_at ? new Date(p.accepted_at).toLocaleDateString() : null}</Field>
          <Field label="Created">{new Date(p.created_at).toLocaleDateString()}</Field>
          {p.scope && <Field label="Scope" full>{p.scope}</Field>}
          {p.pricing_notes && <Field label="Pricing Notes" full>{p.pricing_notes}</Field>}
        </div>
      )}

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
          <DocumentList documents={(docs as Document[]) ?? []} entityType="proposal" entityId={id} />
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/proposals" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to proposals</Link>
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
