'use client'

import { useState } from 'react'

/** Pre-written emails for the moments that repeat. Fill the fields once,
    every template updates live, copy lands in the clipboard ready to paste
    into the mail client. House style: plain, warm, no hard sell. */

interface Template {
  id: string
  label: string
  when: string
  subject: (f: Fields) => string
  body: (f: Fields) => string
}

interface Fields {
  first: string
  business: string
  word: string
  project: string
  invoice: string
}

const t = (s: string) => s.trim()

const TEMPLATES: Template[] = [
  {
    id: 'card-drop',
    label: 'Field-day thank-you',
    when: 'Same evening as a card drop',
    subject: () => 'Good meeting you today',
    body: (f) => t(`
Hi ${f.first || 'there'},

Thanks for taking a minute today. I know walk-ins land mid-chaos, so I appreciate it.

I wrote a short page about what usually eats the week in your line of work. The word on the back of my card takes you there: ridgelineknows.com/${f.word || '_____'}

If any of it sounds like ${f.business || 'your shop'}, I'd be glad to hear about it. And if nothing does, that page cost you two minutes and nothing else.

Brian Boyd
Ridgeline Knows · Myrtle Beach
843-425-7030`),
  },
  {
    id: 'proposal-follow-up',
    label: 'Proposal follow-up',
    when: 'A few days after a proposal goes quiet',
    subject: (f) => `Checking in on the ${f.project || 'proposal'}`,
    body: (f) => t(`
Hi ${f.first || 'there'},

No pressure on this one. I just want to make sure the proposal for ${f.project || 'the project'} didn't get buried, and to catch any questions while they're small.

If the scope missed something, or the timing isn't right, say so plainly. I'd rather rework it or shelve it than have it sit awkwardly in your inbox.

Brian`),
  },
  {
    id: 'assessment-confirm',
    label: 'Assessment confirmation',
    when: 'After an assessment gets scheduled',
    subject: () => 'Confirmed. Here is what to expect',
    body: (f) => t(`
Hi ${f.first || 'there'},

Confirmed. When I'm there I'll mostly watch and ask questions: how work comes in, where it gets typed twice, what waits on whom. Nothing to prepare, though if a report or a spreadsheet makes you sigh every week, have it in mind.

You get a written assessment of where the time goes. It's yours to keep either way, whether or not we go further.

Brian`),
  },
  {
    id: 'invoice-reminder',
    label: 'Invoice reminder',
    when: 'An invoice past its due date',
    subject: (f) => `Invoice ${f.invoice || ''} — friendly nudge`.replace('  ', ' '),
    body: (f) => t(`
Hi ${f.first || 'there'},

A quick nudge on invoice ${f.invoice || '____'} for ${f.business || 'your account'}. It may have slipped past, these things do.

The portal has a Pay button if that's easiest, or reply here if something about it looks off and I'll straighten it out.

Brian`),
  },
  {
    id: 'project-complete',
    label: 'Project completion',
    when: 'Hand-off day',
    subject: (f) => `${f.project || 'The project'} is live`,
    body: (f) => t(`
Hi ${f.first || 'there'},

${f.project || 'The project'} is finished and running. Everything we agreed on in the scope is in place, and your portal shows what it's doing from today forward: what ran, what it saved, and the math behind the number.

I keep watching it after hand-off. If anything looks off to you at any point, use Request a change in the portal and it comes straight to me.

Thank you for trusting me with it.

Brian`),
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="btn-outline"
      style={{ fontSize: 12, padding: '6px 14px', whiteSpace: 'nowrap' }}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch { /* clipboard blocked: label must not lie */ }
      }}
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

export function EmailTemplates() {
  const [fields, setFields] = useState<Fields>({ first: '', business: '', word: '', project: '', invoice: '' })
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="section-card">
        <div className="section-card__head"><span className="section-card__label">Fill once — every template updates</span></div>
        <div style={{ padding: '16px 22px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: '1 1 140px' }}>
            <label>First name</label>
            <input value={fields.first} onChange={set('first')} placeholder="Jane" />
          </div>
          <div className="field" style={{ flex: '1 1 170px' }}>
            <label>Business</label>
            <input value={fields.business} onChange={set('business')} placeholder="Salt Realty" />
          </div>
          <div className="field" style={{ flex: '0 1 120px' }}>
            <label>Card word</label>
            <input value={fields.word} onChange={set('word')} placeholder="real" />
          </div>
          <div className="field" style={{ flex: '1 1 170px' }}>
            <label>Project</label>
            <input value={fields.project} onChange={set('project')} placeholder="the intake build" />
          </div>
          <div className="field" style={{ flex: '0 1 140px' }}>
            <label>Invoice #</label>
            <input value={fields.invoice} onChange={set('invoice')} placeholder="2026-004" />
          </div>
        </div>
      </div>

      {TEMPLATES.map(tpl => {
        const subject = tpl.subject(fields)
        const body = tpl.body(fields)
        return (
          <div className="section-card" key={tpl.id}>
            <div className="section-card__head">
              <span className="section-card__label">{tpl.label} · {tpl.when}</span>
              <CopyButton text={`Subject: ${subject}\n\n${body}`} />
            </div>
            <div style={{ padding: '14px 22px 18px' }}>
              <div style={{ fontSize: 13.5, marginBottom: 10 }}><b style={{ fontWeight: 600 }}>Subject:</b> {subject}</div>
              <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--ink-muted)' }}>{body}</pre>
            </div>
          </div>
        )
      })}
    </div>
  )
}
