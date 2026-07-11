import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import { RequestForm } from '@/components/portal/RequestForm'
import { RequestCard } from '@/components/portal/RequestCard'
import type { ChangeRequest } from '@/lib/types'

export default async function PortalRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null // layout redirects

  const role = user.app_metadata?.role as string | undefined
  const isOwner = role === 'owner'
  const params = await searchParams
  const clientId = isOwner ? params.client : (user.app_metadata?.client_id as string | undefined)

  let query = supabase.from('change_requests').select('*').order('created_at', { ascending: false })
  if (clientId) query = query.eq('client_id', clientId)
  const { data: requests, error } = await query
  const loadFailed = queryFailed('change_requests', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Requests</div>
        <h1 className="page-title">Request a change</h1>
        <p className="page-description">
          Tell me what you need in writing — a tweak, a fix, or a new idea. I reply here
          within one business day, and everything stays on the record.
        </p>
      </div>

      {isOwner ? (
        <div className="owner-preview">
          Owner preview — clients see a request form here. Reply from the dashboard&rsquo;s Requests page.
        </div>
      ) : (
        <RequestForm />
      )}

      <section className="portal-section">
        <h2 className="portal-section__title">Your requests</h2>
        {loadFailed ? (
          <ErrorState title="Couldn't load requests" body="Refresh to try again." />
        ) : !requests?.length ? (
          <EmptyState
            title="Nothing here yet"
            body="Your requests and my replies will show up here."
          />
        ) : (
          (requests as ChangeRequest[]).map(req => <RequestCard key={req.id} request={req} />)
        )}
      </section>
    </div>
  )
}
