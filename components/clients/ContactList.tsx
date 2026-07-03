'use client'

import { useActionState, useState } from 'react'
import { createContactAction, updateContactAction, deleteContactAction } from '@/app/actions/contacts'
import type { Contact, ActionState } from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  project_contact: 'Project Contact',
  billing: 'Billing',
  technical: 'Technical',
  other: 'Other',
}

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)

interface ContactListProps {
  contacts: Contact[]
  clientId: string
}

function ContactFields({ contact }: { contact?: Contact }) {
  return (
    <>
      <div className="field-row">
        <div className="field">
          <label>Name *</label>
          <input name="name" type="text" defaultValue={contact?.name ?? ''} required />
        </div>
        <div className="field">
          <label>Title</label>
          <input name="title" type="text" defaultValue={contact?.title ?? ''} placeholder="Operations Manager" />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Role</label>
          <select name="role" defaultValue={contact?.role ?? 'project_contact'}>
            {ROLE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" defaultValue={contact?.email ?? ''} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Phone</label>
          <input name="phone" type="tel" defaultValue={contact?.phone ?? ''} />
        </div>
        <div className="field">
          <label>LinkedIn</label>
          <input name="linkedin_url" type="url" defaultValue={contact?.linkedin_url ?? ''} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <input name="notes" type="text" defaultValue={contact?.notes ?? ''} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
        <input
          name="is_portal_user"
          type="checkbox"
          id={`portal-${contact?.id ?? 'new'}`}
          value="true"
          defaultChecked={contact?.is_portal_user ?? false}
          style={{ width: 14, height: 14, accentColor: 'var(--blue)' }}
        />
        <label htmlFor={`portal-${contact?.id ?? 'new'}`} style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-muted)', cursor: 'pointer' }}>
          Has client portal access
        </label>
      </div>
    </>
  )
}

function AddContactForm({ clientId, onDone }: { clientId: string; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createContactAction, null)

  if (state?.message) {
    onDone()
    return null
  }

  return (
    <form action={formAction} className="inline-form">
      <input type="hidden" name="client_id" value={clientId} />
      {state?.errors?._root && <div className="login-error" style={{ marginBottom: 0 }}>{state.errors._root}</div>}
      <ContactFields />
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn-primary" disabled={pending} style={{ fontSize: 13, padding: '8px 16px' }}>
          {pending ? 'Adding…' : 'Add contact'}
        </button>
        <button type="button" className="btn-outline" onClick={onDone} style={{ fontSize: 13 }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function EditContactForm({ contact, onDone }: { contact: Contact; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateContactAction, null)

  if (state?.message) {
    onDone()
    return null
  }

  return (
    <form action={formAction} className="inline-form">
      <input type="hidden" name="id" value={contact.id} />
      <input type="hidden" name="client_id" value={contact.client_id} />
      {state?.errors?._root && <div className="login-error" style={{ marginBottom: 0 }}>{state.errors._root}</div>}
      <ContactFields contact={contact} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn-primary" disabled={pending} style={{ fontSize: 13, padding: '8px 16px' }}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" className="btn-outline" onClick={onDone} style={{ fontSize: 13 }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export function ContactList({ contacts, clientId }: ContactListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="section-card__body">
      {contacts.length === 0 && !showAdd && (
        <div className="section-card__empty">No contacts yet.</div>
      )}

      {contacts.map(c => (
        <div key={c.id}>
          {editingId === c.id ? (
            <EditContactForm contact={c} onDone={() => setEditingId(null)} />
          ) : (
            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule-soft)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)' }}>{c.name}</span>
                  {c.title && <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{c.title}</span>}
                  <span className={`badge badge-${c.role}`}>{ROLE_LABELS[c.role] ?? c.role}</span>
                  {c.is_portal_user && (
                    <span className="badge badge-active" style={{ fontSize: '8.5px' }}>Portal user</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  {c.email && (
                    <a href={`mailto:${c.email}`} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--blue)', letterSpacing: '0.04em' }}>
                      {c.email}
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.04em' }}>
                      {c.phone}
                    </a>
                  )}
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.04em' }}>
                      LinkedIn ↗
                    </a>
                  )}
                </div>
                {c.notes && <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{c.notes}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                {confirmDeleteId === c.id ? (
                  <>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: '#8B2A1E', textTransform: 'uppercase' }}>Delete?</span>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={async () => { await deleteContactAction(c.id, clientId); setConfirmDeleteId(null) }}
                      style={{ fontSize: 11, padding: '4px 10px' }}
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setConfirmDeleteId(null)}
                      style={{ fontSize: 11, padding: '4px 10px' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => { setEditingId(c.id); setConfirmDeleteId(null) }}
                      style={{ fontSize: 12, padding: '4px 10px' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => setConfirmDeleteId(c.id)}
                      style={{ fontSize: 12, padding: '4px 10px' }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {showAdd ? (
        <AddContactForm clientId={clientId} onDone={() => setShowAdd(false)} />
      ) : (
        <div style={{ padding: '12px 22px' }}>
          <button
            type="button"
            className="btn-outline"
            onClick={() => setShowAdd(true)}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            + Add contact
          </button>
        </div>
      )}
    </div>
  )
}
