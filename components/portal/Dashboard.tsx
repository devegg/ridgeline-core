import Link from 'next/link'
import type { Automation, CaughtIssue, PortalHighlight, RoadmapItem } from '@/lib/types'
import { HAIRCUT, formatDollars, formatHours, type ValueTotals } from '@/lib/portal/value'
import { ValueInputsForm } from '@/components/portal/ValueInputsForm'

/* Server components for the portal home — the ten-second screen.
   Copy rules: plain English, first person singular, no jargon,
   rounded hedged numbers only. */

// ------------------------------------------------------------
// Zone 1 — health banner
// ------------------------------------------------------------
export function HealthBanner({
  automations,
  activeIssues,
  lastUpdatedLabel,
}: {
  automations: Automation[]
  activeIssues: CaughtIssue[]
  lastUpdatedLabel: string
}) {
  const hasIssue = activeIssues.length > 0 || automations.some(a => a.status === 'issue')
  const allPaused = automations.length > 0 && automations.every(a => a.status === 'paused')
  const running = automations.filter(a => a.status === 'running').length

  const tone = hasIssue ? 'amber' : allPaused ? 'paused' : 'green'
  const message = hasIssue
    ? 'Heads up — one thing needs attention.'
    : allPaused
      ? 'Automations are paused right now.'
      : "Everything's running normally."

  return (
    <div className={`health-banner health-banner--${tone}`} role="status">
      <span className="health-banner__dot" aria-hidden="true" />
      <span className="health-banner__msg">{message}</span>
      <span className="health-banner__meta">
        {running > 0 && `${running} automation${running === 1 ? '' : 's'} running · `}
        Last updated {lastUpdatedLabel}
      </span>
      {activeIssues.map(issue => (
        <p key={issue.id} className="health-banner__detail">
          {issue.summary}
          {issue.detail ? ` ${issue.detail}` : ''} I&rsquo;m on it — no action needed from you.
        </p>
      ))}
    </div>
  )
}

// ------------------------------------------------------------
// Zone 2 — value scoreboard + the honest math
// ------------------------------------------------------------
export function ValueCards({
  totals,
  issuesMonth,
  issuesTotal,
}: {
  totals: ValueTotals
  issuesMonth: number
  issuesTotal: number
}) {
  return (
    <div className="value-cards">
      <div className="value-card">
        <div className="value-card__num">{formatHours(totals.monthHours)} hours</div>
        <div className="value-card__label">
          of manual work your team didn&rsquo;t have to do this month
        </div>
        <div className="value-card__since">
          {formatHours(totals.launchHours, true)} hrs since we started
        </div>
      </div>
      <div className="value-card">
        <div className="value-card__num">{formatDollars(totals.monthDollars)}</div>
        <div className="value-card__label">
          in staff time you didn&rsquo;t spend — counted conservatively
        </div>
        <div className="value-card__since">
          {formatDollars(totals.launchDollars, true)} since we started
        </div>
      </div>
      <div className="value-card">
        <div className="value-card__num">{issuesMonth} {issuesMonth === 1 ? 'issue' : 'issues'}</div>
        <div className="value-card__label">
          caught and fixed before they reached you or a customer
        </div>
        <div className="value-card__since">{issuesTotal} since we started</div>
      </div>
    </div>
  )
}

export function HowWeCount({
  automations,
  totals,
  laborRate,
  viewerIsClient,
}: {
  automations: Automation[]
  totals: ValueTotals
  laborRate: number
  viewerIsClient: boolean
}) {
  const running = automations.filter(a => a.status !== 'paused')
  return (
    <details className="how-we-count">
      <summary>How I count this</summary>
      <div className="how-we-count__body">
        <p>
          Before each automation went live, we measured how long the task took a person
          {running.length > 0 && (
            <>
              {' '}
              ({running.map((a, i) => (
                <span key={a.id}>
                  {i > 0 && (i === running.length - 1 ? ', and ' : ', ')}
                  about {Number(a.baseline_minutes_per_item)} minutes per item for {a.name.split(':')[0].toLowerCase()}
                </span>
              ))})
            </>
          )}.
          This month the system handled {totals.monthItems.toLocaleString()} items. I only count
          work someone on your team actually used to do, and I cut the total by {Math.round(HAIRCUT * 100)}%
          so the number stays on the safe side. That leaves the hours you see above. Your blended
          labor cost is ${laborRate}/hour — a number you can change below — and the dollar figure
          is just hours times that rate. If anything here looks off, adjust it yourself or tell me
          and I&rsquo;ll re-measure.
        </p>
        <ValueInputsForm
          rate={laborRate}
          automations={running.map(a => ({
            id: a.id,
            name: a.name,
            baseline_minutes_per_item: a.baseline_minutes_per_item,
          }))}
          viewerIsClient={viewerIsClient}
        />
      </div>
    </details>
  )
}

// ------------------------------------------------------------
// Zone 3 — peace of mind (no numeric claims)
// ------------------------------------------------------------
export function PeaceOfMind({ highlights }: { highlights: PortalHighlight[] }) {
  if (highlights.length === 0) return null
  return (
    <section className="portal-section">
      <h2 className="portal-section__title">Peace of mind</h2>
      <div className="peace-card">
        <ul>
          {highlights.map(h => <li key={h.id}>{h.line}</li>)}
        </ul>
      </div>
    </section>
  )
}

// ------------------------------------------------------------
// Zone 4 — caught & fixed log
// ------------------------------------------------------------
export function CaughtFixedLog({ issues }: { issues: CaughtIssue[] }) {
  if (issues.length === 0) return null
  return (
    <section className="portal-section">
      <h2 className="portal-section__title">Caught &amp; fixed</h2>
      <div className="caught-log">
        {issues.map(issue => (
          <div key={issue.id} className="caught-log__row">
            <div className="caught-log__date">
              {new Date(issue.occurred_on + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div>
              <div className="caught-log__text">{issue.summary}</div>
              {issue.detail && <div className="caught-log__detail">{issue.detail}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------
// Zone 5 — what's next + request a change
// ------------------------------------------------------------
const STATE_LABEL: Record<RoadmapItem['state'], string> = {
  next: 'Next up',
  in_progress: 'In progress',
  shipped: 'Just shipped',
}
const STATE_ORDER: RoadmapItem['state'][] = ['in_progress', 'next', 'shipped']

export function WhatsNext({
  items,
  requestHref,
}: {
  items: RoadmapItem[]
  requestHref: string
}) {
  const ordered = [...items].sort(
    (a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) || a.sort_order - b.sort_order,
  )
  return (
    <section className="portal-section">
      <h2 className="portal-section__title">What&rsquo;s next</h2>
      {ordered.length > 0 ? (
        <div className="next-list">
          {ordered.map(item => (
            <div key={item.id} className="next-list__row">
              <span className={`next-list__state next-list__state--${item.state}`}>
                {STATE_LABEL[item.state]}
              </span>
              <span className="next-list__title">{item.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14.5, color: 'var(--ink-muted)' }}>
          Nothing queued right now. Have something in mind?
        </p>
      )}
      <div style={{ marginTop: 20 }}>
        <Link href={requestHref} className="btn-primary">
          Request a change <span className="arrow" />
        </Link>
      </div>
    </section>
  )
}
