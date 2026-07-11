import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import {
  ActivityQuickAdd, AutomationForm, CaseStudyPanel, HighlightForm, IngestKeyPanel, IssueForm,
  PortalSettingsPanel, ReportSendPanel, RoadmapForm,
} from '@/components/dashboard/PortalDataPanels'
import { advanceRoadmapAction, deleteHighlightAction, deleteRoadmapAction, resolveIssueAction } from '@/app/actions/portal-data'
import type { Automation, CaughtIssue, PortalHighlight, RoadmapItem } from '@/lib/types'

export default async function ClientPortalDataPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [clientRes, automationsRes, issuesRes, roadmapRes, highlightsRes] = await Promise.all([
    supabase.from('clients').select('id, name, email, blended_labor_rate, ingest_key_created_at, plan_tier, report_auto_send').eq('id', id).single(),
    supabase.from('automations').select('*').eq('client_id', id).order('sort_order'),
    supabase.from('caught_issues').select('*').eq('client_id', id).order('occurred_on', { ascending: false }).limit(12),
    supabase.from('roadmap_items').select('*').eq('client_id', id).order('sort_order'),
    supabase.from('portal_highlights').select('*').eq('client_id', id).order('sort_order'),
  ])

  if (clientRes.error || !clientRes.data) {
    if (queryFailed('clients', clientRes.error)) {
      return <ErrorState title="Couldn't load the client" body="Refresh to try again." />
    }
    notFound()
  }

  const client = clientRes.data
  const automations = (automationsRes.data ?? []) as Automation[]
  const issues = (issuesRes.data ?? []) as CaughtIssue[]
  const roadmap = (roadmapRes.data ?? []) as RoadmapItem[]
  const highlights = (highlightsRes.data ?? []) as PortalHighlight[]

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Portal data</div>
        <h1 className="page-title">{client.name}</h1>
        <p className="page-description">
          Everything the client&rsquo;s portal dashboard shows, managed here — automations
          and baselines, activity, caught issues, the roadmap, and peace-of-mind lines.{' '}
          <Link href={`/portal?client=${client.id}`} style={{ borderBottom: '1px solid var(--amber)' }}>
            Preview their view
          </Link>{' · '}
          <Link href={`/clients/${client.id}`} style={{ borderBottom: '1px solid var(--amber)' }}>
            Back to client
          </Link>
        </p>
      </div>

      <section className="portal-section">
        <h2 className="portal-section__title">Automations · blended rate ${Number(client.blended_labor_rate)}/hr</h2>
        {automations.map(a => (
          <details key={a.id} className="request-card" style={{ cursor: 'default' }}>
            <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span className="request-card__title">{a.name}</span>
              <span className="request-card__meta">
                {Number(a.baseline_minutes_per_item)} min/item · {a.status} · since {a.started_on}
              </span>
            </summary>
            <div style={{ marginTop: 14 }}>
              <AutomationForm clientId={client.id} automation={a} />
            </div>
          </details>
        ))}
        <div className="request-card">
          <div className="request-card__meta" style={{ marginBottom: 10 }}>New automation</div>
          <AutomationForm clientId={client.id} />
        </div>
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">Record activity (manual)</h2>
        {automations.length > 0
          ? <ActivityQuickAdd clientId={client.id} automations={automations} />
          : <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Add an automation first.</p>}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">Machine ingest</h2>
        <IngestKeyPanel clientId={client.id} createdAt={client.ingest_key_created_at ?? null} />
        {automations.length > 0 && (
          <p style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-soft)' }}>
            Automation ids: {automations.map(a => `${a.name.split(':')[0]} = ${a.id}`).join(' · ')}
          </p>
        )}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">Portal settings</h2>
        <PortalSettingsPanel clientId={client.id} planTier={client.plan_tier ?? 'improve'} autoSend={!!client.report_auto_send} />
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">Monthly report</h2>
        <ReportSendPanel clientId={client.id} defaultTo={client.email ?? ''} />
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">Case study</h2>
        <CaseStudyPanel clientId={client.id} />
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">Caught &amp; fixed</h2>
        <div style={{ marginBottom: 16 }}>
          <IssueForm clientId={client.id} automations={automations} />
        </div>
        {issues.map(i => (
          <div key={i.id} className="request-card">
            <div className="request-card__head">
              <div className="request-card__title" style={{ fontSize: 15 }}>{i.summary}</div>
              <div className="request-card__meta">
                {i.occurred_on} · {i.status}
                {i.status === 'active' && (
                  <form action={resolveIssueAction} style={{ display: 'inline', marginLeft: 12 }}>
                    <input type="hidden" name="id" value={i.id} />
                    <input type="hidden" name="client_id" value={client.id} />
                    <button className="portal-nav__signout" style={{ borderBottom: '1px solid var(--amber)' }}>
                      Mark resolved
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">What&rsquo;s next (roadmap)</h2>
        <div style={{ marginBottom: 16 }}>
          <RoadmapForm clientId={client.id} />
        </div>
        <div className="next-list">
          {roadmap.map(r => (
            <div key={r.id} className="next-list__row" style={{ alignItems: 'center' }}>
              <span className={`next-list__state next-list__state--${r.state}`}>{r.state.replace('_', ' ')}</span>
              <span className="next-list__title" style={{ flex: 1 }}>{r.title}</span>
              {r.state !== 'shipped' && (
                <form action={advanceRoadmapAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="client_id" value={client.id} />
                  <input type="hidden" name="state" value={r.state === 'next' ? 'in_progress' : 'shipped'} />
                  <button className="portal-nav__signout" style={{ borderBottom: '1px solid var(--amber)' }}>
                    {r.state === 'next' ? 'Start' : 'Ship'}
                  </button>
                </form>
              )}
              <form action={deleteRoadmapAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="client_id" value={client.id} />
                <button className="portal-nav__signout">Remove</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">Peace of mind</h2>
        <div style={{ marginBottom: 16 }}>
          <HighlightForm clientId={client.id} />
        </div>
        <div className="peace-card">
          <ul>
            {highlights.map(h => (
              <li key={h.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span>{h.line}</span>
                <form action={deleteHighlightAction}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="client_id" value={client.id} />
                  <button className="portal-nav__signout">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
