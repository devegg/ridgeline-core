'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { saveVisitNoteAction } from '@/app/actions/field-notes'
import { noAutofill } from '@/lib/field/no-autofill'
import type { ActionState, Prospect, VisitNote } from '@/lib/types'

/**
 * The field note, on a phone.
 *
 * This is docs/business-dev/field-notes/TEMPLATE.md as a form. The template
 * was the right shape and the wrong medium — nobody opens a markdown file
 * standing in a shop, so the structure never got used and the app captured a
 * single free-text blob instead.
 *
 * Two boxes here matter more than the rest and are marked in the UI: what
 * happens when something goes wrong, and what breaks when the spreadsheet
 * owner is out. Seven rounds of desk research could not answer either one.
 * They are the reason to walk in.
 */

type Draft = Record<string, string>

const SECTIONS: {
  title: string
  hint?: string
  fields: { name: string; label: string; hint?: string; lines?: number; starred?: boolean }[]
}[] = [
  {
    title: 'What they actually run',
    hint: 'Software, and everything else — a whiteboard, a wall calendar, a notebook.',
    fields: [
      { name: 'stack_observed', label: 'The stack you saw', lines: 3 },
      { name: 'how_things_arrive', label: 'How things arrive', hint: 'Handed over · post · a portal they log into · a phone call · a photo', lines: 3 },
      { name: 'who_moves_it', label: 'Who moves it, and where it goes', hint: 'The role. And whether they type it, scan it, upload it, or paste it.', lines: 3 },
    ],
  },
  {
    title: 'The spreadsheet',
    hint: 'Almost every business has one the software does not cover. Nobody publishes this — it can only be found by asking.',
    fields: [
      { name: 'sheet_what', label: 'What it is', lines: 2 },
      { name: 'sheet_columns', label: 'What is in it', hint: 'The columns', lines: 2 },
      { name: 'sheet_owner_role', label: 'Who owns it', hint: 'The role, not the name' },
      { name: 'sheet_owner_out', label: 'What breaks when they are out', starred: true, lines: 3 },
      { name: 'sheet_document_home', label: 'Where the real document lives', hint: 'When the sheet only holds the date', lines: 2 },
    ],
  },
  {
    title: 'When something goes wrong',
    hint: 'A refund · a void · a chargeback · card fees · a partial payment · something billed wrong.',
    fields: [
      { name: 'exception_handling', label: 'Who handles it, and how', starred: true, lines: 4 },
    ],
  },
  {
    title: 'The transaction',
    hint: '"Show me the transaction", never "does it integrate" — everyone says yes to the second one.',
    fields: [
      { name: 'transaction_asked', label: 'What you asked to see', lines: 2 },
      { name: 'transaction_observed', label: 'What was actually on screen', lines: 3 },
    ],
  },
  {
    title: 'Their words',
    hint: 'Verbatim. Do not tidy it up.',
    fields: [
      { name: 'owner_words', label: 'Quotes', lines: 5 },
    ],
  },
  {
    title: 'What the card got wrong',
    hint: 'The most important box on this page. Anything the card said that turned out wrong, out of date, or missing.',
    fields: [
      { name: 'card_got_wrong', label: 'Corrections', lines: 4 },
    ],
  },
]

const LINES = [
  { value: 'L1', label: 'L1 · Intake' },
  { value: 'L2', label: 'L2 · Reconciliation' },
  { value: 'L3', label: 'L3 · Unbilled-work sweep' },
  { value: 'L4', label: 'L4 · Deadline & document chains' },
  { value: 'L5', label: 'L5 · Encoding audit' },
]

function initialDraft(note: VisitNote | null): Draft {
  const d: Draft = {}
  for (const s of SECTIONS) for (const f of s.fields) d[f.name] = (note?.[f.name as keyof VisitNote] as string | null) ?? ''
  d.card_slug = note?.card_slug ?? ''
  d.spoke_with_role = note?.spoke_with_role ?? ''
  d.duration_minutes = note?.duration_minutes != null ? String(note.duration_minutes) : ''
  d.service_line = note?.service_line ?? ''
  d.disqualified = note?.disqualified === true ? 'yes' : note?.disqualified === false ? 'no' : ''
  d.disqualify_map_entry = note?.disqualify_map_entry ?? ''
  d.follow_up_owed = note?.follow_up_owed ?? ''
  return d
}

export function VisitNotes({
  prospect, note, cardSlugs,
}: {
  prospect: Prospect
  note: VisitNote | null
  cardSlugs: string[]
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveVisitNoteAction, null)
  const [draft, setDraft] = useState<Draft>(() => initialDraft(note))
  const [restored, setRestored] = useState(false)

  const storageKey = `rk-visitnote-${prospect.id}`
  const set = (name: string, value: string) => setDraft(d => ({ ...d, [name]: value }))

  // A phone call, a low battery, a tab the OS reclaims while you are talking —
  // any of them wipes a half-written note, and a note you have to write twice
  // is a note that stops getting written. Keep an unsaved copy locally.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const saved = JSON.parse(raw) as Draft
      if (saved && typeof saved === 'object') {
        setDraft(d => ({ ...d, ...saved }))
        setRestored(true)
      }
    } catch { /* private mode, cleared storage — the form still works */ }
  }, [storageKey])

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(draft)) } catch { /* ignore */ }
  }, [draft, storageKey])

  // Once it is in the database the local copy is the stale one.
  useEffect(() => {
    if (state?.message) {
      try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
      setRestored(false)
    }
  }, [state?.message, storageKey])

  return (
    <div className="field-screen">
      <header className="field-head">
        <Link href={`/visit/${prospect.id}`} className="field-back">&larr; Visit</Link>
        <h1 className="field-title">{prospect.business_name}</h1>
        <p className="field-sub">Field note{note ? ' — saved earlier today' : ''}</p>
      </header>

      {restored && (
        <p className="field-ok">Picked up an unsaved draft from this phone.</p>
      )}

      <form action={formAction}>
        <input type="hidden" name="prospect_id" value={prospect.id} />

        <div className="field-row">
          <label className="field-label">
            Card you read
            <input
              name="card_slug" list="rk-cards" className="field-input" {...noAutofill}
              value={draft.card_slug} onChange={e => set('card_slug', e.target.value)}
              placeholder="hvac-plumbing-electrical"
            />
          </label>
          <label className="field-label">
            How long (minutes)
            <input
              name="duration_minutes" type="number" inputMode="numeric" min={0} max={480}
              className="field-input field-input--num" {...noAutofill}
              value={draft.duration_minutes} onChange={e => set('duration_minutes', e.target.value)}
            />
          </label>
        </div>
        <datalist id="rk-cards">
          {cardSlugs.map(s => <option key={s} value={s} />)}
        </datalist>

        <label className="field-label">
          Who you spoke to
          <input
            name="spoke_with_role" className="field-input" {...noAutofill}
            value={draft.spoke_with_role} onChange={e => set('spoke_with_role', e.target.value)}
            placeholder="The role, not the name"
          />
        </label>

        {SECTIONS.map(section => (
          <section key={section.title} className="fieldnote-sec">
            <h2 className="fieldnote-sec__title">{section.title}</h2>
            {section.hint && <p className="fieldnote-sec__hint">{section.hint}</p>}
            {section.fields.map(f => (
              <label key={f.name} className="field-label">
                {f.label}
                {f.starred && <span className="fieldnote-star" title="Nothing published anywhere answers this"> — only answerable in the room</span>}
                {f.hint && <span className="fieldnote-hint">{f.hint}</span>}
                <textarea
                  name={f.name} rows={f.lines ?? 2} className="field-input fieldnote-area" {...noAutofill}
                  value={draft[f.name]} onChange={e => set(f.name, e.target.value)}
                />
              </label>
            ))}
          </section>
        ))}

        <section className="fieldnote-sec">
          <h2 className="fieldnote-sec__title">Where this fits</h2>

          <label className="field-label">
            Service line
            <select
              name="service_line" className="field-input"
              value={draft.service_line} onChange={e => set('service_line', e.target.value)}
            >
              <option value="">Not sure yet</option>
              {LINES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </label>

          <label className="field-label">
            Did you walk?
            <select
              name="disqualified" className="field-input"
              value={draft.disqualified} onChange={e => set('disqualified', e.target.value)}
            >
              <option value="">Never got that far</option>
              <option value="no">No — this one is live</option>
              <option value="yes">Yes — walked</option>
            </select>
          </label>

          <label className="field-label">
            Map entry tested
            <input
              name="disqualify_map_entry" className="field-input" {...noAutofill}
              value={draft.disqualify_map_entry} onChange={e => set('disqualify_map_entry', e.target.value)}
              placeholder="If any"
            />
          </label>

          <label className="field-label">
            Follow-up you owe them
            <textarea
              name="follow_up_owed" rows={2} className="field-input fieldnote-area" {...noAutofill}
              value={draft.follow_up_owed} onChange={e => set('follow_up_owed', e.target.value)}
            />
          </label>
        </section>

        {state?.errors?._root && <p className="field-error">{state.errors._root}</p>}
        {state?.message && <p className="field-ok">{state.message}</p>}

        <button type="submit" className="field-submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save the note'}
        </button>
      </form>
    </div>
  )
}
