import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listPortalAccounts } from '@/app/actions/portal-users'
import { AccessToggle, CreateLogin } from '@/components/dashboard/AccountsPanels'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'

export const dynamic = 'force-dynamic'

const muted = { color: 'var(--ink-muted)', fontSize: 13 } as const

function when(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AccountsPage() {
  const result = await listPortalAccounts()

  if (!result.configured) {
    if (result.reason === 'not_owner') {
      return <ErrorState title="Owner only" body="This screen administers Supabase Auth." />
    }
    return (
      <div>
        <div className="page-header">
          <div className="page-eyebrow">Accounts</div>
          <h1 className="page-title">Portal accounts</h1>
        </div>
        <ErrorState
          title={result.reason === 'missing_key' ? 'SUPABASE_SECRET_KEY is not configured' : 'Supabase rejected the secret key'}
          body={
            result.reason === 'missing_key'
              ? 'Portal logins live in Supabase Auth, which RLS cannot reach — this screen needs the secret key in the environment.'
              : 'The key is present but Supabase refused it. It may have been rotated.'
          }
        />
      </div>
    )
  }

  const { rows, ownerCount } = result
  // Client emails are the sensible default when provisioning a missing login.
  const supabase = await createClient()
  const { data: contacts } = await supabase.from('clients').select('id, email')
  const emailFor = new Map((contacts ?? []).map((c: { id: string; email: string | null }) => [c.id, c.email]))

  const clientRows = rows.filter((r) => r.kind === 'client')
  const orphans = rows.filter((r) => r.kind === 'orphan')
  const withLogin = clientRows.filter((r) => r.userId)
  const signedIn = withLogin.filter((r) => r.lastSignInAt)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Accounts</div>
        <h1 className="page-title">Portal accounts</h1>
        <p className="page-description">
          Who can sign in to the client portal, and when they last did.{' '}
          {clientRows.length} client{clientRows.length !== 1 ? 's' : ''} · {withLogin.length} with a login ·{' '}
          {signedIn.length} {signedIn.length === 1 ? 'has' : 'have'} ever signed in.
          {ownerCount > 0 && ` ${ownerCount} owner account${ownerCount !== 1 ? 's' : ''} not listed here.`}
        </p>
      </div>

      {!clientRows.length ? (
        <EmptyState title="No clients yet" body="Portal logins are created per client." actionLabel="Add client" actionHref="/clients/new" />
      ) : (
        <div className="table-wrap" style={{ marginTop: 28 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Login</th>
                <th>Last sign-in</th>
                <th>Access</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clientRows.map((r) => (
                <tr key={r.clientId}>
                  <td>
                    <Link href={`/clients/${r.clientId}`} style={{ display: 'block' }}>{r.clientName}</Link>
                    <span style={{ ...muted, fontSize: 12 }}>{r.clientStatus}</span>
                  </td>
                  <td style={muted}>
                    {r.email ?? <span style={{ opacity: 0.6 }}>No login</span>}
                    {r.email && (
                      <>
                        {' · '}
                        <Link href={`/clients/${r.clientId}/portal`} style={{ borderBottom: '1px solid var(--amber)' }}>
                          change
                        </Link>
                      </>
                    )}
                  </td>
                  <td style={muted}>
                    {r.lastSignInAt ? (
                      when(r.lastSignInAt)
                    ) : r.userId ? (
                      <span title="The login exists but has never been used.">Never</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={muted}>{!r.userId ? '—' : r.disabled ? 'Disabled' : 'Active'}</td>
                  <td>
                    {r.userId ? (
                      <AccessToggle userId={r.userId} disabled={r.disabled} />
                    ) : (
                      <CreateLogin clientId={r.clientId!} defaultEmail={emailFor.get(r.clientId!) ?? null} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orphans.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 className="portal-section__title">Accounts with no client</h2>
          <p className="page-description" style={{ marginTop: 6 }}>
            These can sign in but RLS scopes them to a client that is gone or was never set, so the
            portal shows them nothing. They are invisible everywhere else in the app.
          </p>
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Why</th>
                  <th>Last sign-in</th>
                  <th>Access</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orphans.map((r) => (
                  <tr key={r.userId}>
                    <td style={muted}>{r.email ?? '—'}</td>
                    <td style={muted}>
                      {r.orphanReason === 'no_client_id'
                        ? 'No client_id on the account'
                        : `Points at a client that no longer exists`}
                    </td>
                    <td style={muted}>{r.lastSignInAt ? when(r.lastSignInAt) : 'Never'}</td>
                    <td style={muted}>{r.disabled ? 'Disabled' : 'Active'}</td>
                    <td>{r.userId && <AccessToggle userId={r.userId} disabled={r.disabled} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
