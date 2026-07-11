'use client'

import { useActionState } from 'react'
import { generateIntakeLinkAction } from '@/app/actions/intake'
import { baselineWeeklyHours, type IntakeAnswers } from '@/lib/portal/intake'
import type { ActionState } from '@/lib/types'

export function IntakePanel({
  assessmentId,
  submittedAt,
  answers,
}: {
  assessmentId: string
  submittedAt: string | null
  answers: IntakeAnswers | null
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(generateIntakeLinkAction, null)
  const link = state?.message

  return (
    <div className="section-card">
      <div className="section-card__head">
        <span className="section-card__label">Written intake</span>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}

        {answers ? (
          <>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
              Submitted {submittedAt ? new Date(submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
              {' · '}{answers.contact_name} ({answers.contact_role || 'role n/a'}) · {answers.business_name}
              {answers.team_size ? ` · team of ${answers.team_size}` : ''}
            </div>
            {answers.pains.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber-deep)', marginBottom: 6 }}>Pains checked</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {answers.pains.map(p => <li key={p} style={{ fontSize: 14, lineHeight: 1.6 }}>{p}</li>)}
                </ul>
              </div>
            )}
            {answers.worst_time_eater && (
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber-deep)', marginBottom: 6 }}>Worst time-eater, their words</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{answers.worst_time_eater}</p>
              </div>
            )}
            {answers.tools && (
              <div style={{ fontSize: 14 }}><strong>Tools:</strong> {answers.tools}</div>
            )}
            {answers.baselines.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber-deep)', marginBottom: 6 }}>
                  Measured baselines (feed these into the automations)
                </div>
                <table className="data-table" style={{ fontSize: 13.5 }}>
                  <thead><tr><th>Task</th><th>Min each</th><th>×/week</th><th>Who</th><th>Hrs/week (raw)</th></tr></thead>
                  <tbody>
                    {answers.baselines.map((b, i) => {
                      const wk = baselineWeeklyHours(b)
                      return (
                        <tr key={i}>
                          <td>{b.task}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>{b.minutes_each ?? '—'}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>{b.times_per_week ?? '—'}</td>
                          <td>{b.who || '—'}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>{wk ? wk.toFixed(1) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {answers.anything_else && (
              <p style={{ fontSize: 14, lineHeight: 1.6 }}><strong>Anything else:</strong> {answers.anything_else}</p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
            No intake yet. Generate a single-use link and send it to the prospect —
            their written answers land here.
          </p>
        )}

        {link && (
          <div style={{ padding: '10px 14px', border: '1px solid var(--amber)', background: 'var(--paper)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber-deep)', marginBottom: 6 }}>
              Intake link (single use — copy and send)
            </div>
            <code style={{ fontFamily: 'var(--mono)', fontSize: 12.5, wordBreak: 'break-all' }}>{link}</code>
          </div>
        )}

        <form action={formAction}>
          <input type="hidden" name="assessment_id" value={assessmentId} />
          <button className="btn-outline" disabled={pending} style={{ fontSize: 12, padding: '6px 14px' }}>
            {pending ? 'Working…' : answers || submittedAt ? 'Generate a fresh link (re-opens intake)' : 'Generate intake link'}
          </button>
        </form>
      </div>
    </div>
  )
}
