'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { saveVisitEstimateAction, sendVisitRecapAction } from '@/app/actions/prospects'
import { annualCost, annualRecovered, visitTotals, type EstimateInput } from '@/lib/field/estimate'
import { formatDollars } from '@/lib/portal/value'
import { noAutofill } from '@/lib/field/no-autofill'
import type { ActionState, Prospect, VisitTask } from '@/lib/types'

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

/** A date column is 'YYYY-MM-DD'. `new Date(that)` parses as UTC midnight and
    shows the day before west of Greenwich, so build it from the parts. Only
    month and day are formatted, which makes the output timezone-independent
    and safe to render on both sides of hydration. */
function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Today plus n days as 'YYYY-MM-DD', built from local parts. toISOString()
    is UTC, which hands back yesterday's date after 8pm on the east coast —
    i.e. exactly when a field day is being written up. */
function inDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const FOLLOW_UPS = [
  { label: 'In a week', value: () => inDays(7) },
  { label: 'Two weeks', value: () => inDays(14) },
  { label: 'A month', value: () => inDays(30) },
]

export function VisitEstimator({
  prospect, lastCardWord, lastVisitOn, lastTasks, photoUrl,
}: {
  prospect: Prospect
  lastCardWord: string | null
  lastVisitOn: string | null
  lastTasks: VisitTask[]
  photoUrl: string | null
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveVisitEstimateAction, null)
  const [visitRate, setVisitRate] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([emptyDraft(1)])
  const [note, setNote] = useState('')
  const [contact, setContact] = useState(prospect.contact_name ?? '')
  const [showCard, setShowCard] = useState(false)
  const [showMath, setShowMath] = useState(false)
  const [showPrior, setShowPrior] = useState(false)
  const [followUp, setFollowUp] = useState<string>(prospect.follow_up_date ?? '')
  const [recap, recapAction, recapPending] = useActionState<ActionState, FormData>(sendVisitRecapAction, null)

  const set = (key: number, patch: Partial<Draft>) =>
    setDrafts(ds => ds.map(d => (d.key === key ? { ...d, ...patch } : d)))

  // Last visit's numbers run through the same functions as the live ones, so
  // a figure quoted in June and re-read in September cannot disagree.
  const priorTotals = visitTotals(lastTasks)

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
        {lastCardWord && <p className="field-sub">Card word: {lastCardWord}</p>}
        {/* The estimator prices what they told you. The note records what you
            saw and heard, which is the half no amount of desk research can
            reach — so it gets a door from here, not a buried menu. */}
        <Link href={`/visit/${prospect.id}/notes`} className="field-linkbtn">
          Write the field note
        </Link>
        <label className="field-label">
          Who are you talking to?
          <input
            type="text" className="field-input" {...noAutofill}
            placeholder="Name on the card, or who met you at the desk"
            value={contact} onChange={e => setContact(e.target.value)}
          />
        </label>
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

      {lastTasks.length > 0 && (
        <section className="field-prior">
          <button
            type="button"
            className="field-prior__head"
            onClick={() => setShowPrior(v => !v)}
            aria-expanded={showPrior}
          >
            <span className="field-prior__when">
              Priced here {lastVisitOn ? `on ${shortDate(lastVisitOn)}` : 'before'} &middot;{' '}
              {lastTasks.length} task{lastTasks.length === 1 ? '' : 's'}
            </span>
            <span className="field-prior__sum">
              <strong>{formatDollars(priorTotals.cost)}/yr</strong>
              <span className="field-prior__hint">{showPrior ? 'hide' : 'see it'}</span>
            </span>
          </button>

          {showPrior && (
            <ul className="field-prior__list">
              {lastTasks.map(t => (
                <li key={t.id}>
                  <span className="field-prior__task">
                    {t.label}
                    {t.who && <em> &mdash; {t.who}</em>}
                  </span>
                  <span className="field-prior__detail">
                    {t.minutes_each} min &times; {t.times_per_week}/wk &middot;{' '}
                    {formatDollars(annualCost(t.minutes_each, t.times_per_week, t.hourly_rate))}/yr
                  </span>
                </li>
              ))}
              <li className="field-prior__foot">
                Last time&rsquo;s numbers. Anything you enter below is a new visit &mdash;
                it does not overwrite this one.
              </li>
            </ul>
          )}

          {showPrior && lastTasks[0]?.visit_id && (
            <form action={recapAction} className="field-prior__send">
              <input type="hidden" name="visit_id" value={lastTasks[0].visit_id} />
              <button type="submit" className="field-prior__sendbtn" disabled={recapPending}>
                {recapPending ? 'Sending…' : 'Email me this recap'}
              </button>
              <p className="field-prior__sendnote">
                Comes to you, written so you can forward it to them.
              </p>
              {recap?.message && <p className="field-ok">{recap.message}</p>}
              {recap?.errors?._root && <p className="field-error">{recap.errors._root}</p>}
            </form>
          )}
        </section>
      )}

      <label className="field-label">
        What does an hour of their time cost? (loaded)
        <input
          type="number" inputMode="decimal" min="5" max="500" placeholder="28"
          className="field-input field-input--num" {...noAutofill}
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
                type="text" className="field-input" {...noAutofill} placeholder="Retyping vendor invoices by hand"
                value={d.label} onChange={e => set(d.key, { label: e.target.value })}
              />
            </label>

            <label className="field-label">
              Who does it?
              <input
                type="text" className="field-input" {...noAutofill} placeholder="Sherri at the front desk"
                value={d.who} onChange={e => set(d.key, { who: e.target.value })}
              />
            </label>

            <div className="field-row">
              <label className="field-label">
                Minutes each
                <input
                  type="number" inputMode="decimal" min="0.5" max="480" placeholder="4"
                  className="field-input field-input--num" {...noAutofill}
                  value={d.minutes_each} onChange={e => set(d.key, { minutes_each: e.target.value })}
                />
              </label>
              <label className="field-label">
                Times per week
                <input
                  type="number" inputMode="decimal" min="0.1" max="500" placeholder="60"
                  className="field-input field-input--num" {...noAutofill}
                  value={d.times_per_week} onChange={e => set(d.key, { times_per_week: e.target.value })}
                />
              </label>
            </div>

            <label className="field-label field-label--muted">
              Different rate for this one?
              <input
                type="number" inputMode="decimal" min="5" max="500" placeholder={visitRate || 'same as above'}
                className="field-input field-input--num" {...noAutofill}
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

      <div className="field-label">
        When should I come back?
        <div className="field-chips">
          {FOLLOW_UPS.map(f => {
            const v = f.value()
            return (
              <button
                key={f.label} type="button"
                className={`field-chip ${followUp === v ? 'field-chip--on' : ''}`}
                onClick={() => setFollowUp(followUp === v ? '' : v)}
              >
                {f.label}
              </button>
            )
          })}
          {followUp && (
            <button type="button" className="field-chip" onClick={() => setFollowUp('none')}>
              Clear
            </button>
          )}
        </div>
        {followUp && followUp !== 'none' && (
          <p className="field-chips__note">Shows up in Follow-ups due on {shortDate(followUp)}.</p>
        )}
      </div>

      <label className="field-label">
        Notes
        <textarea
          className="field-input" {...noAutofill} rows={3} placeholder="Who I spoke to, what happens next"
          value={note} onChange={e => setNote(e.target.value)}
        />
      </label>

      <form action={formAction} className="field-save">
        <input type="hidden" name="prospect_id" value={prospect.id} />
        <input type="hidden" name="note" value={note} />
        <input type="hidden" name="contact_name" value={contact} />
        <input type="hidden" name="card_word" value={lastCardWord ?? ''} />
        <input type="hidden" name="follow_up_date" value={followUp} />
        <input type="hidden" name="tasks" value={JSON.stringify(payload)} />
        <button type="submit" className="field-submit" disabled={pending || payload.length === 0}>
          {pending ? 'Saving…' : `Save visit${payload.length ? ` (${payload.length})` : ''}`}
        </button>
        {state?.errors?._root && <p className="field-error">{state.errors._root}</p>}
        {state?.message && <p className="field-ok">{state.message}</p>}
      </form>

      <button
        type="button"
        className="field-total"
        onClick={() => setShowMath(v => !v)}
        aria-expanded={showMath}
      >
        <div className="field-total__tag">
          Rough estimate
          <span className="field-total__hint">{showMath ? 'tap to close' : 'tap for the math'}</span>
        </div>

        <div className="field-total__row field-total__row--lead">
          <span>Costs you now</span><strong>{formatDollars(totals.cost)}/yr</strong>
        </div>

        {/* The middle number lives behind the tap. Two rows read as one clear
            gap in the owner's favour; three rows invite arithmetic. */}
        {showMath && (
          <div className="field-total__row field-total__row--mid">
            <span>I&rsquo;d realistically recover</span><strong>{formatDollars(totals.recovered)}/yr</strong>
          </div>
        )}

        <div className="field-total__row field-total__row--fee">
          <span>My fee &mdash; one time</span><strong>{formatDollars(totals.fee)}</strong>
        </div>

        {showMath && (
          <p className="field-total__note">
            30% held back — I&rsquo;d rather beat the number than miss it. The yearly
            numbers are estimates until we count the real thing. My fee is 25% of the
            first year&rsquo;s savings, charged once, not every year — and that rate is
            firm as long as these counts hold up. New work later is a change order we
            price together.
          </p>
        )}
      </button>
    </div>
  )
}
