import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import { RespondForm } from '@/components/dashboard/RespondForm'
import type { ChangeRequest } from '@/lib/types'

const URGENCY_LABEL: Record<ChangeRequest['urgency'], string> = {
  low: 'No rush',
  normal: 'Normal',
  high: 'Urgent',
}

export default async function DashboardRequestsPage() {
  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from('change_requests')
    .select('*, client:clients(id, name)')
    .order('created_at', { ascending: false })
  const loadFailed = queryFailed('change_requests', error)

  const open = ((requests ?? []) as ChangeRequest[]).filter(r => r.status !== 'done')
  const done = ((requests ?? []) as ChangeRequest[]).filter(r => r.status === 'done')

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Requests</div>
        <h1 className="page-title">Client change requests</h1>
        <p className="page-description">
          Written requests from the portal. Replies show up on the client&rsquo;s Requests page.
        </p>
      </div>

      {loadFailed ? (
        <ErrorState title="Couldn't load requests" body="Refresh to try again." />
      ) : !requests?.length ? (
        <EmptyState title="No requests yet" body="Client requests from the portal will land here." />
      ) : (
        <>
          {[...open, ...done].map(req => (
            <div key={req.id} className="request-card">
              <div className="request-card__head">
                <div className="request-card__title">{req.title}</div>
                <div className="request-card__meta">
                  {req.client?.name ?? 'Unknown client'} ·{' '}
                  {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
                  {URGENCY_LABEL[req.urgency]} · {req.status.replace('_', ' ')}
                </div>
              </div>
              {req.detail && <p className="request-card__detail">{req.detail}</p>}
              <RespondForm request={req} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
