import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Client, ClientStatus } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Prospective', value: 'prospective' },
  { label: 'Past', value: 'past' },
  { label: 'Archived', value: 'archived' },
]

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('clients').select('*').order('name')
  if (status && status !== 'all') {
    query = query.eq('status', status as ClientStatus)
  }
  const { data: clients, error } = await query
  const loadFailed = queryFailed('clients', error)

  const current = status || 'all'

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Clients</div>
        <h1 className="page-title">All Clients</h1>
        <p className="page-description">
          {clients?.length ?? 0} client{clients?.length !== 1 ? 's' : ''}
          {current !== 'all' ? ` · ${current}` : ''}
        </p>
      </div>

      <div className="page-actions">
        <Link href="/clients/new" className="btn-primary">
          Add client
          <span className="arrow" />
        </Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <FilterTabs tabs={TABS} current={current} basePath="/clients" />

        {loadFailed ? (
          <ErrorState title="Couldn't load clients" />
        ) : !clients?.length ? (
          <EmptyState
            title="No clients yet"
            body={current === 'all' ? 'Add your first client to get started.' : `No ${current} clients.`}
            actionLabel={current === 'all' ? 'Add client' : undefined}
            actionHref={current === 'all' ? '/clients/new' : undefined}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(clients as Client[]).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/clients/${c.id}`} style={{ display: 'block' }}>
                        {c.name}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{c.primary_contact ?? '—'}</td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{c.industry ?? '—'}</td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{c.location ?? '—'}</td>
                    <td><StatusBadge status={c.status} /></td>
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
