'use client'

import Link from 'next/link'
import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateLeadAction, advanceStageAction, setStageAction, convertToClientAction, deleteLeadAction } from '@/app/actions/leads'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { safeHttpUrl } from '@/lib/safe-url'
import type { Lead, LeadStage, ActionState } from '@/lib/types'

const STAGE_LABELS: Record<LeadStage, string> = {
  identified: 'Identified',
  contacted: 'Contacted',
  meeting_scheduled: 'Meeting Scheduled',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  lost: 'Lost',
}

const SOURCE_LABELS: Record<string, string> = {
  card_drop: 'Card drop', referral: 'Referral', networking_event: 'Networking event',
  cold_outreach: 'Cold outreach', inbound: 'Inbound', other: 'Other',
}

const SOURCES = Object.entries(SOURCE_LABELS)
const STAGE_ORDER: LeadStage[] = ['identified', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won']

function EditForm({ lead, onCancel }: { lead: Lead; onCancel: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateLeadAction, null)

  useEffect(() => {
    if (state?.message) onCancel()
  }, [state?.message, onCancel])

  return (
    <form action={formAction} className="form" style={{ maxWidth: 680 }}>
      <input type="hidden" name="id" value={lead.id} />
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      <div className={`field ${state?.errors?.business_name ? 'field--error' : ''}`}>
        <label>Business name *</label>
        <input name="business_name" type="text" defaultValue={lead.business_name} required />
      </div>
      <div className="field-row">
        <div className="field"><label>Contact name</label><input name="contact_name" defaultValue={lead.contact_name ?? ''} /></div>
        <div className="field"><label>Their title</label><input name="contact_title" defaultValue={lead.contact_title ?? ''} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Phone</label><input name="phone" type="tel" defaultValue={lead.phone ?? ''} /></div>
        <div className="field"><label>Email</label><input name="email" type="email" defaultValue={lead.email ?? ''} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Industry</label><input name="industry" defaultValue={lead.industry ?? ''} /></div>
        <div className="field"><label>Location</label><input name="location" defaultValue={lead.location ?? ''} /></div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>How you met</label>
          <select name="source" defaultValue={lead.source}>
            {SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field"><label>Referred by</label><input name="referred_by" defaultValue={lead.referred_by ?? ''} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Follow-up date</label><input name="follow_up_date" type="date" defaultValue={lead.follow_up_date ?? ''} /></div>
        <div className="field"><label>Website</label><input name="website" type="url" defaultValue={lead.website ?? ''} /></div>
      </div>
      <div className="field"><label>LinkedIn</label><input name="linkedin_url" type="url" defaultValue={lead.linkedin_url ?? ''} /></div>
      <div className="field"><label>Notes</label><textarea name="notes" defaultValue={lead.notes ?? ''} style={{ minHeight: 90 }} /></div>
      <div className="form__footer">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}{!pending && <span className="arrow" />}
        </button>
      </div>
    </form>
  )
}

export function LeadDetail({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [converting, setConverting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [lostReason, setLostReason] = useState('')
  const [showLostForm, setShowLostForm] = useState(false)

  const currentIndex = STAGE_ORDER.indexOf(lead.stage)
  const canAdvance = currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1
  const nextStage = canAdvance ? STAGE_ORDER[currentIndex + 1] : null
  const isActive = !['won', 'lost'].includes(lead.stage)
  const today = new Date().toISOString().split('T')[0]

  const handleConvert = async () => {
    setConverting(true)
    const result = await convertToClientAction(lead.id)
    if (result.clientId) {
      router.push(`/clients/${result.clientId}`)
      router.refresh()
    } else {
      setConverting(false)
      alert(result.error ?? 'Conversion failed')
    }
  }

  if (editing) return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">CRM · Leads</div>
        <h1 className="page-title">Edit Lead</h1>
      </div>
      <EditForm lead={lead} onCancel={() => setEditing(false)} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="page-eyebrow">CRM · Leads</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{lead.business_name}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={lead.stage} />
            <span className={`badge badge-${lead.source}`}>{SOURCE_LABELS[lead.source]}</span>
            {lead.follow_up_date && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.1em', color: lead.follow_up_date < today && isActive ? '#B14B3C' : 'var(--ink-soft)' }}>
                Follow-up: {lead.follow_up_date}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <button className="btn-outline" onClick={() => setEditing(true)}>Edit</button>
          {confirmDelete ? (
            <>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8B2A1E', letterSpacing: '0.1em', textTransform: 'uppercase', alignSelf: 'center' }}>Delete?</span>
              <form action={deleteLeadAction.bind(null, lead.id)}>
                <button type="submit" className="btn-danger">Yes, delete</button>
              </form>
              <button className="btn-outline" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn-danger" style={{ opacity: 0.7 }} onClick={() => setConfirmDelete(true)}>Delete</button>
          )}
        </div>
      </div>

      {/* Stage pipeline */}
      {isActive && (
        <div style={{ marginBottom: 28, padding: '20px 24px', background: 'var(--paper)', border: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {STAGE_ORDER.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= currentIndex ? 'var(--blue)' : 'var(--rule)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {canAdvance && nextStage && (
              <form action={advanceStageAction.bind(null, lead.id, lead.stage)}>
                <button type="submit" className="btn-primary">
                  Move to {STAGE_LABELS[nextStage]} <span className="arrow" />
                </button>
              </form>
            )}
            {lead.stage === 'proposal_sent' && (
              <button className="btn-success" onClick={handleConvert} disabled={converting}>
                {converting ? 'Converting…' : '✓ Convert to client'}
              </button>
            )}
            {!showLostForm ? (
              <button className="btn-outline" onClick={() => setShowLostForm(true)}>Mark as lost</button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={lostReason}
                  onChange={e => setLostReason(e.target.value)}
                  style={{ fontFamily: 'var(--sans)', fontSize: 13, border: 'none', borderBottom: '1px solid var(--rule)', background: 'transparent', padding: '4px 0', outline: 'none', color: 'var(--ink)', width: 200 }}
                />
                <form action={setStageAction.bind(null, lead.id, 'lost', lostReason || undefined)}>
                  <button type="submit" className="btn-danger">Confirm lost</button>
                </form>
                <button className="btn-outline" onClick={() => setShowLostForm(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {lead.stage === 'won' && lead.converted_client_id && (
        <div style={{ marginBottom: 24, padding: '16px 22px', background: 'rgba(40,120,60,0.08)', border: '1px solid rgba(40,120,60,0.2)' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#1E5C2A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Won — <Link href={`/clients/${lead.converted_client_id}`} style={{ color: '#1E5C2A', borderBottom: '1px solid rgba(40,120,60,0.4)' }}>View client record →</Link>
          </span>
        </div>
      )}
      {lead.stage === 'lost' && (
        <div style={{ marginBottom: 24, padding: '16px 22px', background: 'rgba(27,26,23,0.04)', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-soft)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Lost{lead.lost_reason ? ` — ${lead.lost_reason}` : ''}
          </span>
          <form action={setStageAction.bind(null, lead.id, 'identified', undefined)}>
            <button type="submit" style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Reopen →
            </button>
          </form>
        </div>
      )}

      <div className="detail-grid">
        <Field label="Contact">
          {[lead.contact_name, lead.contact_title].filter(Boolean).join(' · ') || null}
        </Field>
        <Field label="Phone">{lead.phone ? <a href={`tel:${lead.phone}`} style={{ color: 'var(--blue)' }}>{lead.phone}</a> : null}</Field>
        <Field label="Email">{lead.email ? <a href={`mailto:${lead.email}`} style={{ color: 'var(--blue)' }}>{lead.email}</a> : null}</Field>
        <Field label="Industry">{lead.industry}</Field>
        <Field label="Location">{lead.location}</Field>
        <Field label="Referred by">{lead.referred_by}</Field>
        {lead.website && (
          <Field label="Website">
            {safeHttpUrl(lead.website)
              ? <a href={safeHttpUrl(lead.website)!} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>{lead.website}</a>
              : <span title="Blocked: not an http(s) link">{lead.website}</span>}
          </Field>
        )}
        {lead.linkedin_url && (
          <Field label="LinkedIn">
            {safeHttpUrl(lead.linkedin_url)
              ? <a href={safeHttpUrl(lead.linkedin_url)!} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>View profile ↗</a>
              : <span title="Blocked: not an http(s) link">{lead.linkedin_url}</span>}
          </Field>
        )}
        {lead.notes && <Field label="Notes" full>{lead.notes}</Field>}
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/leads" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to leads</Link>
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
