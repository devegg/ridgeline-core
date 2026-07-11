import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import { ApproveProposal } from '@/components/portal/ApproveProposal'
import type { Proposal } from '@/lib/types'

export default async function PortalProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const role = user.app_metadata?.role as string | undefined
  const isOwner = role === 'owner'
  const params = await searchParams
  const clientId = isOwner ? params.client : (user.app_metadata?.client_id as string | undefined)

  let query = supabase.from('proposals').select('*')
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
  if (clientId) query = query.eq('client_id', clientId)
  const { data: proposals, error } = await query
  const loadFailed = queryFailed('proposals', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Proposals</div>
        <h1 className="page-title">Proposals</h1>
        <p className="page-description">
          Fixed scope, fixed price, in writing. Approving here is the go-ahead;
          nothing is billed until the work is agreed and scheduled.
        </p>
      </div>

      {isOwner && (
        <div className="owner-preview">
          Owner preview — clients see an Approve button on pending proposals.
        </div>
      )}

      {loadFailed ? (
        <ErrorState title="Couldn't load proposals" body="Refresh to try again." />
      ) : !proposals?.length ? (
        <EmptyState title="No proposals yet" body="Proposals will appear here when they're ready for your review." />
      ) : (
        (proposals as Proposal[]).map(p => (
          <div key={p.id} className="request-card">
            <div className="request-card__head">
              <div className="request-card__title">{p.title}</div>
              <div className="request-card__meta">
                {p.total_amount ? `$${Number(p.total_amount).toLocaleString()} · ` : ''}
                {p.status}
                {p.accepted_at ? ` · approved ${new Date(p.accepted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
              </div>
            </div>
            {p.scope && <p className="request-card__detail" style={{ whiteSpace: 'pre-wrap' }}>{p.scope}</p>}
            {p.pricing_notes && <p className="request-card__detail">{p.pricing_notes}</p>}
            {p.care_plan?.included && (
              <div className="request-card__response" style={{ borderLeftColor: 'var(--blue)' }}>
                <div className="request-card__response-label" style={{ color: 'var(--blue)' }}>Care plan (opt-out)</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-muted)', marginBottom: 8 }}>{p.care_plan.note}</div>
                {p.care_plan.tiers.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '4px 0', fontSize: 14 }}>
                    <strong style={{ minWidth: 80 }}>{t.name}</strong>
                    <span style={{ fontFamily: 'var(--mono)', minWidth: 90 }}>{t.price || '—'}</span>
                    <span style={{ color: 'var(--ink-muted)' }}>{t.summary}</span>
                  </div>
                ))}
              </div>
            )}
            {p.status === 'pending' && !isOwner && <ApproveProposal proposalId={p.id} />}
          </div>
        ))
      )}
    </div>
  )
}
