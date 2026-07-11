'use client'

import { useActionState } from 'react'
import { submitIntakeAction } from '@/app/actions/intake'
import { INTAKE_PAINS } from '@/lib/portal/intake'
import type { ActionState } from '@/lib/types'

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--amber-deep)', margin: '34px 0 14px',
}

export function IntakeForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(submitIntakeAction, null)

  if (state?.message) {
    return (
      <div style={{ padding: '22px 26px', border: '1px solid var(--rule)', background: 'var(--paper)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <input type="hidden" name="token" value={token} />
      {/* Honeypot — humans never see it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} aria-hidden="true" />

      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}

      <div style={sectionTitle}>The basics</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="field"><label>Business name</label><input name="business_name" required /></div>
        <div className="field"><label>Your name</label><input name="contact_name" required /></div>
        <div className="field"><label>Your role</label><input name="contact_role" placeholder="Owner, office manager…" /></div>
        <div className="field"><label>Team size</label><input name="team_size" placeholder="e.g. 6" /></div>
        <div className="field"><label>Email</label><input name="email" type="email" /></div>
        <div className="field"><label>Phone</label><input name="phone" /></div>
      </div>

      <div style={sectionTitle}>Where the hours go</div>
      <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: '0 0 6px' }}>Check everything that sounds familiar:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {INTAKE_PAINS.map(p => (
          <label key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, cursor: 'pointer' }}>
            <input type="checkbox" name="pains" value={p} style={{ marginTop: 3 }} /> {p}
          </label>
        ))}
      </div>
      <div className="field">
        <label>What eats the most time right now, in your words?</label>
        <textarea name="worst_time_eater" rows={4} />
      </div>
      <div className="field">
        <label>What tools does the business run on?</label>
        <input name="tools" placeholder="QuickBooks, Gmail, a shared drive, a whiteboard…" />
      </div>

      <div style={sectionTitle}>The repeating tasks (best guesses are fine)</div>
      <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: '0 0 6px' }}>
        Up to five tasks someone does over and over. Rough numbers beat blank boxes.
      </p>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: 10 }}>
          <div className="field"><label>{i === 0 ? 'Task' : ''}</label><input name={`bl_task_${i}`} placeholder={i === 0 ? 'Re-typing invoices' : ''} /></div>
          <div className="field"><label>{i === 0 ? 'Minutes each' : ''}</label><input name={`bl_minutes_${i}`} type="number" min="1" /></div>
          <div className="field"><label>{i === 0 ? 'Times / week' : ''}</label><input name={`bl_times_${i}`} type="number" min="1" /></div>
          <div className="field"><label>{i === 0 ? 'Who does it' : ''}</label><input name={`bl_who_${i}`} /></div>
        </div>
      ))}

      <div className="field" style={{ marginTop: 12 }}>
        <label>Anything else I should know?</label>
        <textarea name="anything_else" rows={3} />
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Sending…' : 'Send it in'}
          {!pending && <span className="arrow" />}
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
        Your answers go straight to Brian and nowhere else.
      </p>
    </form>
  )
}
