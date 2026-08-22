/**
 * Owner-facing sentence per outcome. Lives here, not in `lib/portal/notify.ts`,
 * because that module imports the Supabase admin client — pulling it into a
 * client component (DocumentList is one) would drag server-only code into the
 * browser bundle and fail the build.
 */
function outcomeMessage(outcome: string): { tone: 'good' | 'warn'; text: string } | null {
  switch (outcome) {
    case 'sent':
      return { tone: 'good', text: 'The client was emailed a link to it.' }
    case 'suppressed':
      return { tone: 'good', text: 'No email sent \u2014 you unticked the box.' }
    case 'no_login':
      return {
        tone: 'warn',
        text: 'No email sent \u2014 this client has no portal login yet, so a link would go nowhere. Create one on the Accounts screen.',
      }
    case 'login_disabled':
      return {
        tone: 'warn',
        text: 'No email sent \u2014 this client\u2019s portal access is disabled. Re-enable it on the Accounts screen first.',
      }
    case 'no_client':
      return { tone: 'warn', text: 'No email sent \u2014 this record has no client attached.' }
    case 'send_failed':
      return {
        tone: 'warn',
        text: 'Saved, but the email did NOT go out. Check the Resend logs and tell them another way.',
      }
    default:
      return null
  }
}

/**
 * Says what happened to the client email after a send/share/deliver action.
 *
 * These notifications fail silently by their nature — an email that never
 * left looks exactly like one that did, and the most likely reason it never
 * left (the client has no portal login) is invisible from the page you were
 * standing on. So the outcome rides back on the query string and gets said
 * out loud, rather than only reaching the server log.
 */
export function NotifyBanner({ outcome }: { outcome?: string }) {
  const msg = outcome ? outcomeMessage(outcome) : null
  if (!msg) return null

  const warn = msg.tone === 'warn'
  return (
    <div
      role="status"
      style={{
        margin: '0 0 20px',
        padding: '11px 14px',
        borderRadius: 2,
        fontSize: 13,
        lineHeight: 1.5,
        border: `1px solid ${warn ? 'var(--amber)' : 'var(--rule)'}`,
        background: warn ? 'rgba(200, 145, 60, 0.09)' : 'transparent',
        color: warn ? 'var(--ink)' : 'var(--ink-muted)',
      }}
    >
      {msg.text}
    </div>
  )
}

/**
 * "Email the client" — on by default, per owner. The box exists so a typo'd
 * invoice can be re-sent without mailing them twice; the default is on so
 * the normal case needs no thought.
 */
export function NotifyCheckbox({ label = 'Email the client a link' }: { label?: string }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 12,
        color: 'var(--ink-muted)',
        cursor: 'pointer',
        marginBottom: 7,
        whiteSpace: 'nowrap',
      }}
    >
      <input type="checkbox" name="notify" defaultChecked />
      {label}
    </label>
  )
}
