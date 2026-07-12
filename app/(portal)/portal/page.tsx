import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { queryFailed } from '@/lib/supabase/errors'
import { relativeLabel, totalsFromRaw, type ValueRawRow } from '@/lib/portal/value'
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

  // Explicit roles only (deny by default): an account with no role is
  // neither owner nor client and sees nothing.
  const role = user.app_metadata?.role as string | undefined
  const isOwner = role === 'owner'
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

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Every query filters by client_id explicitly — defense in depth on top of
  // RLS. Counts are real aggregates, never derived from a display-limited
  // slice, and the value totals aggregate in SQL (portal_value_raw) so they
  // cannot silently truncate at a row cap.
  const [
    clientRes, automationsRes, resolvedRes, activeRes,
    totalIssuesRes, monthIssuesRes, roadmapRes, highlightsRes, rawRes,
  ] = await Promise.all([
    supabase.from('clients').select('id, name, blended_labor_rate, plan_tier').eq('id', clientId).single(),
    supabase.from('automations').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.from('caught_issues').select('*').eq('client_id', clientId)
      .eq('status', 'resolved').order('occurred_on', { ascending: false }).limit(5),
    supabase.from('caught_issues').select('*').eq('client_id', clientId)
      .eq('status', 'active').order('occurred_on', { ascending: false }),
    supabase.from('caught_issues').select('id', { count: 'exact', head: true })
      .eq('client_id', clientId),
    supabase.from('caught_issues').select('id', { count: 'exact', head: true })
      .eq('client_id', clientId).gte('occurred_on', monthStart),
    supabase.from('roadmap_items').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.from('portal_highlights').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.rpc('portal_value_raw', { p_client: clientId, p_month_start: monthStart }),
  ])

  if (queryFailed('clients', clientRes.error) || !clientRes.data) {
    return <ErrorState title="Couldn't load your overview" body="Refresh to try again. If it keeps happening, reach out." />
  }

  const client = clientRes.data as Pick<Client, 'id' | 'name'> & { blended_labor_rate: number; plan_tier?: string }
  const automations = (automationsRes.data ?? []) as Automation[]
  const resolvedRecent = (resolvedRes.data ?? []) as CaughtIssue[]
  const activeIssues = (activeRes.data ?? []) as CaughtIssue[]
  const roadmap = (roadmapRes.data ?? []) as RoadmapItem[]
  const highlights = (highlightsRes.data ?? []) as PortalHighlight[]

  const loadFailed =
    queryFailed('automations', automationsRes.error) ||
    queryFailed('caught_issues', resolvedRes.error) ||
    queryFailed('caught_issues', activeRes.error) ||
    queryFailed('caught_issues', totalIssuesRes.error) ||
    queryFailed('caught_issues', monthIssuesRes.error) ||
    queryFailed('roadmap_items', roadmapRes.error) ||
    queryFailed('portal_highlights', highlightsRes.error) ||
    queryFailed('portal_value_raw', rawRes.error)
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

  const raw = ((rawRes.data ?? []) as ValueRawRow[])[0]
  const totals = totalsFromRaw(
    raw ?? { month_raw_minutes: 0, month_items: 0, launch_raw_minutes: 0, launch_items: 0, last_activity_at: null },
    Number(client.blended_labor_rate),
  )

  return (
    <div>
      {isOwner && <OwnerRibbon name={client.name} />}
      <PageHeader name={client.name} />

      <HealthBanner
        automations={automations}
        activeIssues={activeIssues}
        lastUpdatedLabel={relativeLabel(raw?.last_activity_at ?? null)}
      />

      <ValueCards
        totals={totals}
        issuesMonth={monthIssuesRes.count ?? 0}
        issuesTotal={totalIssuesRes.count ?? 0}
      />
      <HowWeCount automations={automations} totals={totals} laborRate={Number(client.blended_labor_rate)} viewerIsClient={!isOwner} />

      <PeaceOfMind highlights={highlights} />
      <CaughtFixedLog issues={resolvedRecent} />
      <WhatsNext items={roadmap} requestHref={requestHref} />
      {client.plan_tier === 'watch' && (
        <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--ink-soft)' }}>
          &#128274; On the Improve plan, I build one enhancement like these every month.
          Reply to any monthly report if you&rsquo;d like to see what that would look like.
        </p>
      )}
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
