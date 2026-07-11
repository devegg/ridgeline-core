import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { queryFailed } from '@/lib/supabase/errors'
import { computeTotals, relativeLabel } from '@/lib/portal/value'
import {
  CaughtFixedLog, HealthBanner, HowWeCount, PeaceOfMind, ValueCards, WhatsNext,
} from '@/components/portal/Dashboard'
import type { Automation, CaughtIssue, Client, PortalHighlight, RoadmapItem } from '@/lib/types'

export default async function PortalHomePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null // layout redirects

  const role = (user.app_metadata?.role as string) ?? 'owner'
  const isOwner = role !== 'client'
  const params = await searchParams

  // Clients are locked to their own record; the owner picks one to preview.
  const clientId = isOwner ? params.client : (user.app_metadata?.client_id as string | undefined)

  // Owner with no pick yet: show the picker, nothing else.
  if (isOwner && !clientId) {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, status')
      .neq('status', 'scheduled_delete')
      .order('name')
    if (queryFailed('clients', error)) {
      return <ErrorState title="Couldn't load clients" body="Refresh to try again." />
    }
    return (
      <div>
        <div className="owner-preview">Owner preview — pick a client to see their portal home.</div>
        <div className="page-header">
          <div className="page-eyebrow">Portal preview</div>
          <h1 className="page-title">Whose view?</h1>
        </div>
        <div className="client-picker">
          {(clients ?? []).map(c => (
            <Link key={c.id} href={`/portal?client=${c.id}`}>
              <span className="client-picker__name">{c.name}</span>
              <span className="client-picker__meta">{c.status}</span>
            </Link>
          ))}
          {(clients ?? []).length === 0 && (
            <EmptyState title="No clients yet" body="Add a client in the dashboard first." />
          )}
        </div>
      </div>
    )
  }

  if (!clientId) {
    return (
      <ErrorState
        title="Your account isn't linked to a client yet"
        body="Reach out and I'll get it connected."
      />
    )
  }

  // Every query filters by client_id explicitly — defense in depth on top of RLS.
  const [clientRes, automationsRes, issuesRes, roadmapRes, highlightsRes] = await Promise.all([
    supabase.from('clients').select('id, name, blended_labor_rate').eq('id', clientId).single(),
    supabase.from('automations').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.from('caught_issues').select('*').eq('client_id', clientId)
      .order('occurred_on', { ascending: false }).limit(8),
    supabase.from('roadmap_items').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.from('portal_highlights').select('*').eq('client_id', clientId).order('sort_order'),
  ])

  if (queryFailed('clients', clientRes.error) || !clientRes.data) {
    return <ErrorState title="Couldn't load your overview" body="Refresh to try again. If it keeps happening, reach out." />
  }

  const client = clientRes.data as Pick<Client, 'id' | 'name'> & { blended_labor_rate: number }
  const automations = (automationsRes.data ?? []) as Automation[]
  const issues = (issuesRes.data ?? []) as CaughtIssue[]
  const roadmap = (roadmapRes.data ?? []) as RoadmapItem[]
  const highlights = (highlightsRes.data ?? []) as PortalHighlight[]

  const loadFailed =
    queryFailed('automations', automationsRes.error) ||
    queryFailed('caught_issues', issuesRes.error) ||
    queryFailed('roadmap_items', roadmapRes.error) ||
    queryFailed('portal_highlights', highlightsRes.error)
  if (loadFailed) {
    return <ErrorState title="Couldn't load your overview" body="Refresh to try again. If it keeps happening, reach out." />
  }

  const requestHref = isOwner ? `/portal/requests?client=${clientId}` : '/portal/requests'

  // Pre-launch client: no automations yet.
  if (automations.length === 0) {
    return (
      <div>
        {isOwner && <OwnerRibbon name={client.name} />}
        <PageHeader name={client.name} />
        <EmptyState
          title="Your automations will show up here"
          body="Once your first build goes live, this page shows what's running, what it's saving you, and what's next — updated as it happens."
        />
        <WhatsNext items={roadmap} requestHref={requestHref} />
      </div>
    )
  }

  // Activity for this client's automations, launch-to-date (daily rollups).
  const automationIds = automations.map(a => a.id)
  const { data: activity, error: activityError } = await supabase
    .from('automation_activity')
    .select('automation_id, activity_on, items_processed, created_at')
    .in('automation_id', automationIds)
  if (queryFailed('automation_activity', activityError)) {
    return <ErrorState title="Couldn't load your overview" body="Refresh to try again. If it keeps happening, reach out." />
  }

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const totals = computeTotals(automations, activity ?? [], Number(client.blended_labor_rate), monthStart)

  const monthIssues = issues.filter(i => i.occurred_on >= monthStart).length
  const activeIssues = issues.filter(i => i.status === 'active')
  const resolvedRecent = issues.filter(i => i.status === 'resolved').slice(0, 5)
  const lastActivity = (activity ?? []).reduce<string | null>(
    (max, row) => (!max || row.created_at > max ? row.created_at : max), null,
  )

  return (
    <div>
      {isOwner && <OwnerRibbon name={client.name} />}
      <PageHeader name={client.name} />

      <HealthBanner
        automations={automations}
        activeIssues={activeIssues}
        lastUpdatedLabel={relativeLabel(lastActivity)}
      />

      <ValueCards totals={totals} issuesMonth={monthIssues} issuesTotal={issues.length} />
      <HowWeCount automations={automations} totals={totals} laborRate={Number(client.blended_labor_rate)} />

      <PeaceOfMind highlights={highlights} />
      <CaughtFixedLog issues={resolvedRecent} />
      <WhatsNext items={roadmap} requestHref={requestHref} />
    </div>
  )
}

function PageHeader({ name }: { name: string }) {
  return (
    <div className="page-header">
      <div className="page-eyebrow">Overview</div>
      <h1 className="page-title">How things are running</h1>
      <p className="page-description">
        What your automations handled, what that saved you, and what&rsquo;s coming next — {name}.
      </p>
    </div>
  )
}

function OwnerRibbon({ name }: { name: string }) {
  return (
    <div className="owner-preview">
      Owner preview — you&rsquo;re seeing what {name} sees.{' '}
      <Link href="/portal">Pick a different client</Link>
    </div>
  )
}
