import { createClient } from '@/lib/supabase/server'
import { PasswordForm } from '@/components/portal/PasswordForm'

export const dynamic = 'force-dynamic'

export default async function PortalAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = (user?.app_metadata?.role as string | undefined) === 'owner'

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Account</div>
        <h1 className="page-title">Your sign-in</h1>
        <p className="page-description">
          You sign in as <strong>{user?.email ?? '—'}</strong>. You can always get in with an
          emailed sign-in link and no password at all — setting one here is optional, and the link
          keeps working either way.
        </p>
      </div>

      {isOwner && (
        <div
          role="note"
          style={{
            maxWidth: 560,
            padding: '11px 14px',
            borderRadius: 2,
            border: '1px solid var(--amber)',
            background: 'rgba(200, 145, 60, 0.09)',
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          Owner preview. This screen belongs to the client, and the password it changes would be
          yours, not theirs — so it is switched off here. Change a client&rsquo;s login from the
          Accounts screen in the dashboard.
        </div>
      )}

      <PasswordForm disabled={isOwner} />
    </div>
  )
}
