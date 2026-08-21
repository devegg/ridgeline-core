'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { saveVisitEstimateAction } from '@/app/actions/prospects'
import { annualCost, annualRecovered, visitTotals, type EstimateInput } from '@/lib/field/estimate'
import { formatDollars } from '@/lib/portal/value'
import type { ActionState, Prospect } from '@/lib/types'

/** One task in progress. Strings, not numbers — an in-progress field is "" or
    "1." and coercing early fights the keyboard. Parsed at the edges. */
type Draft = {
  key: number
  label: string
  who: string
  minutes_each: string
  times_per_week: string
  rate_override: string
}

const emptyDraft = (key: number): Draft => ({
  key, label: '', who: '', minutes_each: '', times_per_week: '', rate_override: '',
})

/** A draft only counts toward the total once all three numbers are real. */
function priced(d: Draft, visitRate: string): EstimateInput | null {
  const minutes_each = Number(d.minutes_each)
  const times_per_week = Number(d.times_per_week)
  const hourly_rate = Number(d.rate_override || visitRate)
  if (!(minutes_each > 0 && times_per_week > 0 && hourly_rate > 0)) return null
  return { minutes_each, times_per_week, hourly_rate }
}

export function VisitEstimator({
  prospect, lastCardWord, photoUrl,
}: {
  prospect: Prospect
  lastCardWord: string | null
  photoUrl: string | null
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveVisitEstimateAction, null)
  const [visitRate, setVisitRate] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([emptyDraft(1)])
  const [note, setNote] = useState('')
  const [showCard, setShowCard] = useState(false)

  const set = (key: number, patch: Partial<Draft>) =>
    setDrafts(ds => ds.map(d => (d.key === key ? { ...d, ...patch } : d)))

  const pricedTasks = drafts
    .map(d => priced(d, visitRate))
    .filter((p): p is EstimateInput => p !== null)
  const totals = visitTotals(pricedTasks)

  const payload = drafts.flatMap(d => {
    const p = priced(d, visitRate)
    return p && d.label.trim() ? [{ label: d.label.trim(), who: d.who.trim() || null, ...p }] : []
  })

  return (
    <div className="field-screen">
      <header className="field-head">
        <Link href="/visit" className="field-back">&larr; Card drops</Link>
        <h1 className="field-title">{prospect.business_name}</h1>
        <p className="field-sub">
          {prospect.contact_name ?? 'No contact name yet'}
          {lastCardWord ? ` · card word: ${lastCardWord}` : ''}
        </p>
        {(photoUrl || prospect.phone) && (
          <button type="button" className="field-linkbtn" onClick={() => setShowCard(v => !v)}>
            {showCard ? 'Hide card' : 'Show card'}
          </button>
        )}
        {showCard && (
          <div className="field-card">
            {prospect.phone && <a href={`tel:${prospect.phone}`} className="field-tel">{prospect.phone}</a>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photoUrl && <img src={photoUrl} alt="Business card" className="field-cardimg" />}
          </div>
        )}
      </header>

      <label className="field-label">
        What does an hour of their time cost? (loaded)
        <input
          type="number" inputMode="decimal" min="5" max="500" placeholder="28"
          className="field-input field-input--num"
          value={visitRate} onChange={e => setVisitRate(e.target.value)}
        />
      </label>

      {drafts.map((d, i) => {
        const p = priced(d, visitRate)
        return (
          <section key={d.key} className="field-task">
            <div className="field-task__num">Task {i + 1}</div>

            <label className="field-label">
              What is it?
              <input
                type="text" className="field-input" placeholder="Retyping vendor invoices from email"
                value={d.label} onChange={e => set(d.key, { label: e.target.value })}
              />
            </label>

            <label className="field-label">
              Who does it?
              <input
                type="text" className="field-input" placeholder="Sherri, office admin"
                value={d.who} onChange={e => set(d.key, { who: e.target.value })}
              />
            </label>

            <div className="field-row">
              <label className="field-label">
                Minutes each
                <input
                  type="number" inputMode="decimal" min="0.5" max="480" placeholder="4"
                  className="field-input field-input--num"
                  value={d.minutes_each} onChange={e => set(d.key, { minutes_each: e.target.value })}
                />
              </label>
              <label className="field-label">
                Times per week
                <input
                  type="number" inputMode="decimal" min="0.1" max="500" placeholder="60"
                  className="field-input field-input--num"
                  value={d.times_per_week} onChange={e => set(d.key, { times_per_week: e.target.value })}
                />
              </label>
            </div>

            <label className="field-label field-label--muted">
              Different rate for this one?
              <input
                type="number" inputMode="decimal" min="5" max="500" placeholder={visitRate || 'same as above'}
                className="field-input field-input--num"
                value={d.rate_override} onChange={e => set(d.key, { rate_override: e.target.value })}
              />
            </label>

            {p && (
              <div className="field-task__money">
                <span>Costs now</span>
                <strong>{formatDollars(annualCost(p.minutes_each, p.times_per_week, p.hourly_rate))}/yr</strong>
                <span>I&rsquo;d recover</span>
                <strong>{formatDollars(annualRecovered(p.minutes_each, p.times_per_week, p.hourly_rate))}/yr</strong>
              </div>
            )}

            {drafts.length > 1 && (
              <button
                type="button" className="field-linkbtn"
                onClick={() => setDrafts(ds => ds.filter(x => x.key !== d.key))}
              >
                Remove this task
              </button>
            )}
          </section>
        )
      })}

      <button
        type="button" className="field-add"
        onClick={() => setDrafts(ds => [...ds, emptyDraft(Math.max(0, ...ds.map(x => x.key)) + 1)])}
      >
        + Add another task
      </button>

      <label className="field-label">
        Notes
        <textarea
          className="field-input" rows={3} placeholder="Who I spoke to, what happens next"
          value={note} onChange={e => setNote(e.target.value)}
        />
      </label>

      <form action={formAction} className="field-save">
        <input type="hidden" name="prospect_id" value={prospect.id} />
        <input type="hidden" name="note" value={note} />
        <input type="hidden" name="card_word" value={lastCardWord ?? ''} />
        <input type="hidden" name="tasks" value={JSON.stringify(payload)} />
        <button type="submit" className="field-submit" disabled={pending || payload.length === 0}>
          {pending ? 'Saving…' : `Save visit${payload.length ? ` (${payload.length})` : ''}`}
        </button>
        {state?.errors?._root && <p className="field-error">{state.errors._root}</p>}
        {state?.message && <p className="field-ok">{state.message}</p>}
      </form>

      <div className="field-total">
        <div className="field-total__tag">Rough estimate</div>
        <div className="field-total__row">
          <span>Costs you now</span><strong>{formatDollars(totals.cost)}/yr</strong>
        </div>
        <div className="field-total__row field-total__row--lead">
          <span>I&rsquo;d realistically recover</span><strong>{formatDollars(totals.recovered)}/yr</strong>
        </div>
        <div className="field-total__row field-total__row--fee">
          <span>My fee (25% of that)</span><strong>{formatDollars(totals.fee)}/yr</strong>
        </div>
        <p className="field-total__note">
          30% held back — I&rsquo;d rather beat the number than miss it. The numbers are
          estimates until we count the real thing. The 25% rate is not — it&rsquo;s firm as
          long as these counts hold up. New work later is a change order we price together.
        </p>
      </div>
    </div>
  )
}
