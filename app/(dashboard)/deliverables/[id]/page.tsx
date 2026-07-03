import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { approveDeliverableAction, deliverToClientAction, updateDeliverableStatusAction } from '@/app/actions/deliverables'
import { scheduleDeleteAction } from '@/app/actions/cleanup'
import type { Deliverable } from '@/lib/types'

export default async function DeliverableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: deliverable } = await supabase
    .from('deliverables')
    .select('*, project:projects(id, name, client:clients(id, name))')
    .eq('id', id)
    .single()

  if (!deliverable) notFound()
  const d = deliverable as Deliverable & { project: { id: string; name: string; client: { id: string; name: string } | null } | null }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="page-eyebrow">Deliverables · <StatusBadge status={d.status} /></div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{d.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {d.status === 'completed' && (
            <form action={approveDeliverableAction.bind(null, id)}>
              <button type="submit" className="btn-success">Approve</button>
            </form>
          )}
          {d.status === 'approved' && (
            <form action={deliverToClientAction.bind(null, id)}>
              <button type="submit" className="btn-primary">Mark as delivered <span className="arrow" /></button>
            </form>
          )}
          {!['approved', 'delivered'].includes(d.status) && (
            <form action={updateDeliverableStatusAction.bind(null, id, 'in_progress')}>
              <button type="submit" className="btn-outline" disabled={d.status === 'in_progress'}>
                {d.status === 'in_progress' ? 'In progress' : 'Mark in progress'}
              </button>
            </form>
          )}
          {d.status === 'in_progress' && (
            <form action={updateDeliverableStatusAction.bind(null, id, 'completed')}>
              <button type="submit" className="btn-outline">Mark complete</button>
            </form>
          )}
          {d.status !== 'scheduled_delete' && (
            <form action={scheduleDeleteAction.bind(null, 'deliverables', id)}>
              <button type="submit" className="btn-danger" style={{ opacity: 0.7 }}>Schedule delete</button>
            </form>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <Field label="Project">
          {d.project ? <Link href={`/projects/${d.project.id}`} style={{ color: 'var(--blue)' }}>{d.project.name}</Link> : null}
        </Field>
        <Field label="Client">
          {d.project?.client ? <Link href={`/clients/${d.project.client.id}`} style={{ color: 'var(--blue)' }}>{d.project.client.name}</Link> : null}
        </Field>
        <Field label="Due Date">{d.due_date}</Field>
        <Field label="Status"><StatusBadge status={d.status} /></Field>
        <Field label="Approved">{d.approved_at ? new Date(d.approved_at).toLocaleDateString() : null}</Field>
        <Field label="Delivered">{d.delivered_at ? new Date(d.delivered_at).toLocaleDateString() : null}</Field>
        {d.description && <Field label="Description" full>{d.description}</Field>}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/deliverables" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to deliverables</Link>
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
