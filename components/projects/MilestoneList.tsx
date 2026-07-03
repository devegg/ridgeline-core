'use client'

import { useActionState } from 'react'
import { addMilestoneAction, toggleMilestoneAction, deleteMilestoneAction } from '@/app/actions/projects'
import type { Milestone, ActionState } from '@/lib/types'

interface MilestoneListProps {
  milestones: Milestone[]
  projectId: string
}

export function MilestoneList({ milestones, projectId }: MilestoneListProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addMilestoneAction, null)

  const toggle = (m: Milestone) =>
    toggleMilestoneAction(m.id, projectId, !m.completed_at)

  const remove = (id: string) =>
    deleteMilestoneAction(id, projectId)

  return (
    <div className="section-card__body">
      {milestones.length === 0 && (
        <div className="section-card__empty">No milestones. Add one below.</div>
      )}

      {milestones.map((m) => (
        <div key={m.id} className="milestone-row">
          <form action={() => toggle(m)}>
            <button
              type="submit"
              className={`milestone-row__check ${m.completed_at ? 'done' : ''}`}
              title={m.completed_at ? 'Mark incomplete' : 'Mark complete'}
            >
              {m.completed_at && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </form>

          <span className={`milestone-row__title ${m.completed_at ? 'done' : ''}`}>{m.title}</span>

          {m.due_date && (
            <span className="milestone-row__date">
              {new Date(m.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}

          <form action={() => remove(m.id)}>
            <button type="submit" style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }} title="Remove">
              ×
            </button>
          </form>
        </div>
      ))}

      {/* Add milestone form */}
      <form action={formAction} className="milestone-add">
        <input type="hidden" name="project_id" value={projectId} />
        <input
          name="title"
          type="text"
          placeholder="Add a milestone…"
          required
        />
        <input name="due_date" type="date" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', border: 'none', borderBottom: '1px solid var(--rule)', background: 'transparent', outline: 'none', padding: '4px 0' }} />
        <button type="submit" className="btn-outline" disabled={pending} style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }}>
          {pending ? '…' : 'Add'}
        </button>
      </form>
      {state?.errors?._root && (
        <div style={{ padding: '8px 22px', fontFamily: 'var(--mono)', fontSize: 10, color: '#B14B3C', letterSpacing: '0.1em' }}>
          {state.errors._root}
        </div>
      )}
    </div>
  )
}
