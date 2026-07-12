'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { createLeadAction } from '@/app/actions/leads'
import type { ActionState } from '@/lib/types'

const SOURCES = [
  { value: 'card_drop', label: 'Card drop' },
  { value: 'referral', label: 'Referral' },
  { value: 'networking_event', label: 'Networking event' },
  { value: 'cold_outreach', label: 'Cold outreach' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'other', label: 'Other' },
]

export default function NewLeadPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createLeadAction, null)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">CRM · New Lead</div>
        <h1 className="page-title">Add Lead</h1>
        <p className="page-description">A card drop takes under a minute — just business name and a note is enough.</p>
      </div>

      <form action={formAction} className="form" style={{ maxWidth: 680 }}>
        {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}

        {/* Core — always fill these */}
        <div className={`field ${state?.errors?.business_name ? 'field--error' : ''}`}>
          <label htmlFor="l-biz">Business name *</label>
          <input id="l-biz" name="business_name" type="text" required autoFocus />
          {state?.errors?.business_name && <div className="field__error">{state.errors.business_name}</div>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="l-contact">Contact name</label>
            <input id="l-contact" name="contact_name" type="text" />
          </div>
          <div className="field">
            <label htmlFor="l-title">Their title</label>
            <input id="l-title" name="contact_title" type="text" placeholder="Owner, Manager…" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="l-phone">Phone</label>
            <input id="l-phone" name="phone" type="tel" />
          </div>
          <div className="field">
            <label htmlFor="l-email">Email</label>
            <input id="l-email" name="email" type="email" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="l-source">How you met</label>
            <select id="l-source" name="source" defaultValue="card_drop">
              {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="l-followup">Follow-up date</label>
            <input id="l-followup" name="follow_up_date" type="date" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="l-referred">Referred by (who to thank)</label>
            <input id="l-referred" name="referred_by" type="text" placeholder="Name or business" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="l-industry">Industry</label>
            <input id="l-industry" name="industry" type="text" />
          </div>
          <div className="field">
            <label htmlFor="l-location">Location</label>
            <input id="l-location" name="location" type="text" placeholder="City, State" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="l-notes">Notes</label>
          <textarea id="l-notes" name="notes" style={{ minHeight: 80 }} placeholder="Where you met, what they need, anything worth remembering." />
        </div>

        <div className="form__footer">
          <div className="form__note">* Required. Everything else can be filled in later.</div>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Saving…' : 'Add lead'}
            {!pending && <span className="arrow" />}
          </button>
        </div>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/leads" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to leads</Link>
      </p>
    </div>
  )
}
