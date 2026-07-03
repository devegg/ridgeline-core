import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Proposal, ProposalStatus } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Archived', value: 'archived' },
]

export default async function ProposalsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const current = status || 'all'
  const supabase = await createClient()

  let query = supabase.from('proposals').select('*, client:clients(id, name)').order('created_at', { ascending: false })
  if (current !== 'all') query = query.eq('status', current as ProposalStatus)
  const { data: proposals, error } = await query
  const loadFailed = queryFailed('proposals', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Proposals</div>
        <h1 className="page-title">All Proposals</h1>
        <p className="page-description">{proposals?.length ?? 0} proposal{proposals?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="page-actions">
        <Link href="/proposals/new" className="btn-primary">New proposal <span className="arrow" /></Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <FilterTabs tabs={TABS} current={current} basePath="/proposals" />

        {loadFailed ? (
          <ErrorState title="Couldn't load proposals" />
        ) : !proposals?.length ? (
          <EmptyState title="No proposals" body={current === 'all' ? 'Create your first proposal.' : `No ${current} proposals.`} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Title</th><th>Client</th><th>Amount</th><th>Sent</th><th>Status</th></tr></thead>
              <tbody>
                {(proposals as (Proposal & { client: { id: string; name: string } | null })[]).map(p => (
                  <tr key={p.id}>
                    <td><Link href={`/proposals/${p.id}`}>{p.title}</Link></td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                      {p.client ? <Link href={`/clients/${p.client.id}`} style={{ color: 'var(--blue)' }}>{p.client.name}</Link> : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {p.total_amount != null ? `$${Number(p.total_amount).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                      {p.sent_at ? new Date(p.sent_at).toLocaleDateString() : '—'}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
