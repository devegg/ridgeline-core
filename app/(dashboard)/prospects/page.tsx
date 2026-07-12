import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import { KmlImport, ProspectCard, ProspectQuickAdd } from '@/components/dashboard/ProspectPanels'
import type { Prospect, ProspectVisit } from '@/lib/types'

const TABS = [
  { label: 'Working', value: 'working' }, // everything not archived/promoted
  { label: 'Untouched', value: 'untouched' },
  { label: 'Visited', value: 'visited' },
  { label: 'Interested', value: 'interested' },
  { label: 'Promoted', value: 'lead' },
  { label: 'Archived', value: 'archived' },
]

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; industry?: string }>
}) {
  const { status, industry } = await searchParams
  const current = status || 'working'
  const supabase = await createClient()

  let query = supabase.from('prospects').select('*').order('business_name')
  if (current === 'working') query = query.in('status', ['untouched', 'visited', 'interested'])
  else query = query.eq('status', current)
  if (industry) query = query.eq('industry', industry)

  const [prospectsRes, visitsRes, industriesRes] = await Promise.all([
    query,
    supabase.from('prospect_visits').select('*').order('visited_on', { ascending: false }),
    supabase.from('prospects').select('industry').not('industry', 'is', null),
  ])

  if (queryFailed('prospects', prospectsRes.error)) {
    return <ErrorState title="Couldn't load prospects" body="Refresh to try again. If this is the first visit, the field-kit migration may not be applied yet." />
  }

  const prospects = (prospectsRes.data ?? []) as Prospect[]
  const visits = (visitsRes.data ?? []) as ProspectVisit[]
  const visitsByProspect = new Map<string, ProspectVisit[]>()
  for (const v of visits) {
    const list = visitsByProspect.get(v.prospect_id) ?? []
    list.push(v)
    visitsByProspect.set(v.prospect_id, list)
  }
  const industries = [...new Set((industriesRes.data ?? []).map(r => r.industry as string))].sort()

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Field kit</div>
        <h1 className="page-title">Card drops</h1>
        <p className="page-sub">
          Businesses you&rsquo;ve visited or plan to visit. Log each drop with the card word you
          handwrote; promote the warm ones to Leads.
        </p>
      </div>

      <details className="prospect-tools">
        <summary>Add a prospect</summary>
        <div className="prospect-tools__body"><ProspectQuickAdd industries={industries} /></div>
      </details>
      <details className="prospect-tools">
        <summary>Import from Google My Maps</summary>
        <div className="prospect-tools__body"><KmlImport /></div>
      </details>

      <FilterTabs tabs={TABS} current={current} basePath="/prospects" />

      {industries.length > 0 && (
        <div className="prospect-industries">
          <a href={`/prospects?status=${current}`} className={!industry ? 'is-active' : ''}>All industries</a>
          {industries.map(i => (
            <a
              key={i}
              href={`/prospects?status=${current}&industry=${encodeURIComponent(i)}`}
              className={industry === i ? 'is-active' : ''}
            >
              {i}
            </a>
          ))}
        </div>
      )}

      {prospects.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="Add a prospect above, or import your Drop-Ins map — every pin becomes a row."
        />
      ) : (
        <div className="prospect-list">
          {prospects.map(p => (
            <ProspectCard key={p.id} prospect={p} visits={visitsByProspect.get(p.id) ?? []} />
          ))}
        </div>
      )}
    </div>
  )
}
