import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ClientForm } from '@/components/forms/ClientForm'
import { archiveClientAction, updateClientAction } from '@/app/actions/clients'
import { scheduleDeleteAction } from '@/app/actions/cleanup'
import { ContactList } from '@/components/clients/ContactList'
import { ErrorState } from '@/components/ui/ErrorState'
import { MeetingNotesPanel } from '@/components/dashboard/MeetingNotes'
import { queryFailed } from '@/lib/supabase/errors'
import type { Client, Contact, Project } from '@/lib/types'

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams
  const supabase = await createClient()
  const { data: industriesList } = await supabase.from('industries').select('name').order('name')

  const [
    { data: client, error: clientError },
    { data: projects, error: projectsError },
    { data: contacts, error: contactsError },
    { data: meetingNotes },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('projects').select('id, name, status').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('contacts').select('*').eq('client_id', id).order('role').order('name'),
    supabase.from('meeting_notes').select('id, noted_on, note').eq('client_id', id).order('noted_on', { ascending: false }),
  ])

  if (queryFailed('clients', clientError)) return <ErrorState title="Couldn't load this client" />
  const projectsFailed = queryFailed('projects', projectsError)
  const contactsFailed = queryFailed('contacts', contactsError)

  if (!client) notFound()
  const c = client as Client

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="page-eyebrow">Clients</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{c.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <Link href={`/clients/${id}/portal`} className="btn-outline">Portal data</Link>
          {mode !== 'edit' ? (
            <Link href={`/clients/${id}?mode=edit`} className="btn-outline">Edit details</Link>
          ) : (
            <Link href={`/clients/${id}`} className="btn-outline">Cancel edit</Link>
          )}
          {c.status !== 'archived' && (
            <form action={archiveClientAction.bind(null, id)}>
              <button type="submit" className="btn-danger">Archive</button>
            </form>
          )}
          {c.status !== 'scheduled_delete' && (
            <form action={scheduleDeleteAction.bind(null, 'clients', id)}>
              <button type="submit" className="btn-danger" style={{ opacity: 0.7 }}>Schedule delete</button>
            </form>
          )}
        </div>
      </div>

      {mode === 'edit' ? (
        <ClientForm action={updateClientAction} client={c} submitLabel="Save changes" industries={(industriesList ?? []).map(i => i.name)} />
      ) : (
        <div className="detail-grid">
          <Field label="Status"><StatusBadge status={c.status} /></Field>
          <Field label="Primary Contact">{c.primary_contact}</Field>
          <Field label="Email">
            {c.email ? <a href={`mailto:${c.email}`} style={{ color: 'var(--blue)' }}>{c.email}</a> : null}
          </Field>
          <Field label="Phone">
            {c.phone ? <a href={`tel:${c.phone}`} style={{ color: 'var(--blue)' }}>{c.phone}</a> : null}
          </Field>
          <Field label="Industry">{c.industry}</Field>
          <Field label="Location">{c.location}</Field>
          <Field label="Added">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Field>
          <Field label="Last Updated">{new Date(c.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Field>
          {c.relationship_notes && (
            <Field label="Relationship Notes" full>{c.relationship_notes}</Field>
          )}
        </div>
      )}

      <MeetingNotesPanel clientId={id} notes={meetingNotes ?? []} />

      {/* Contacts */}
      <div className="section-card">
        <div className="section-card__head">
          <span className="section-card__label">Contacts</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.12em' }}>
            {(contacts as Contact[] ?? []).length} contact{(contacts?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>
        {contactsFailed ? (
          <div className="section-card__error">Contacts failed to load.</div>
        ) : (
          <ContactList contacts={(contacts as Contact[]) ?? []} clientId={id} />
        )}
      </div>

      {/* Associated Projects */}
      <div className="section-card">
        <div className="section-card__head">
          <span className="section-card__label">Projects</span>
          <Link href={`/projects/new?client_id=${id}`} className="btn-outline" style={{ fontSize: 12, padding: '6px 12px' }}>
            New project
          </Link>
        </div>
        <div className="section-card__body">
          {projectsFailed ? (
            <div className="section-card__error">Projects failed to load.</div>
          ) : !projects?.length ? (
            <div className="section-card__empty">No projects yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Status</th></tr></thead>
              <tbody>
                {(projects as Pick<Project, 'id' | 'name' | 'status'>[]).map((p) => (
                  <tr key={p.id}>
                    <td><Link href={`/projects/${p.id}`}>{p.name}</Link></td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/clients" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to clients</Link>
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
