import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Lead, LeadStage } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Identified', value: 'identified' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Meeting', value: 'meeting_scheduled' },
  { label: 'Proposal Sent', value: 'proposal_sent' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
]

const SOURCE_LABELS: Record<string, string> = {
  card_drop: 'Card drop',
  referral: 'Referral',
  networking_event: 'Networking',
  cold_outreach: 'Cold outreach',
  inbound: 'Inbound',
  other: 'Other',
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const { stage } = await searchParams
  const current = stage || 'all'
  const supabase = await createClient()

  // Stage counts for the funnel summary
  const { data: allLeads, error: allLeadsError } = await supabase
    .from('leads')
    .select('id, stage')
    .not('stage', 'in', '(won,lost)')
  queryFailed('leads', allLeadsError)

  const stageCounts = (allLeads ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] ?? 0) + 1
    return acc
  }, {})

  let query = supabase
    .from('leads')
    .select('*')
    .order('follow_up_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (current !== 'all') {
    query = query.eq('stage', current as LeadStage)
  }

  const { data: leads, error: leadsError } = await query
  const loadFailed = queryFailed('leads', leadsError)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">CRM</div>
        <h1 className="page-title">Leads</h1>
        <p className="page-description">
          {leads?.length ?? 0} lead{leads?.length !== 1 ? 's' : ''}
          {current !== 'all' ? ` · ${TABS.find(t => t.value === current)?.label}` : ''}
        </p>
      </div>

      <div className="page-actions">
        <Link href="/leads/new" className="btn-primary">
          Add lead <span className="arrow" />
        </Link>
      </div>

      {/* Funnel summary — active pipeline only */}
      {current === 'all' && (allLeads?.length ?? 0) > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)', marginTop: 28 }}>
          {[
            { stage: 'identified', label: 'Identified' },
            { stage: 'contacted', label: 'Contacted' },
            { stage: 'meeting_scheduled', label: 'Meeting' },
            { stage: 'proposal_sent', label: 'Proposal Sent' },
          ].map(({ stage: s, label }) => (
            <Link
              key={s}
              href={`/leads?stage=${s}`}
              style={{ background: 'var(--paper)', padding: '18px 20px', display: 'block', textDecoration: 'none' }}
            >
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink)', lineHeight: 1 }}>
                {stageCounts[s] ?? 0}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: current === 'all' ? 20 : 28 }}>
        <FilterTabs tabs={TABS} current={current} basePath="/leads" param="stage" />

        {loadFailed ? (
          <ErrorState title="Couldn't load leads" />
        ) : !leads?.length ? (
          <EmptyState
            title={current === 'all' ? 'No leads yet' : `No ${TABS.find(t => t.value === current)?.label?.toLowerCase()} leads`}
            body={current === 'all' ? 'Add your first lead — a card drop takes under a minute.' : ''}
            actionLabel={current === 'all' ? 'Add lead' : undefined}
            actionHref={current === 'all' ? '/leads/new' : undefined}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Follow-up</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {(leads as Lead[]).map(l => {
                  const overdue = l.follow_up_date && l.follow_up_date < today && !['won', 'lost'].includes(l.stage)
                  return (
                    <tr key={l.id}>
                      <td><Link href={`/leads/${l.id}`}>{l.business_name}</Link></td>
                      <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                        {l.contact_name ?? '—'}
                        {l.contact_title && <span style={{ color: 'var(--ink-soft)' }}> · {l.contact_title}</span>}
                      </td>
                      <td style={{ fontSize: 13 }}>{SOURCE_LABELS[l.source] ?? l.source}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: overdue ? '#B14B3C' : 'var(--ink-soft)' }}>
                        {l.follow_up_date ?? '—'}
                        {overdue && ' ·  overdue'}
                      </td>
                      <td><StatusBadge status={l.stage} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
