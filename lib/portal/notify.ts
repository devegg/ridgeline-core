import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabase } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/email'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ridgelineknows.com'

/**
 * What happened when we tried to tell a client something. Every one of these
 * is reported back to the owner, because the failure modes here are silent by
 * nature: an email that never went out looks exactly like one that did.
 */
export type NotifyOutcome =
  | 'sent'
  | 'suppressed'      // owner unticked the box
  | 'no_login'        // client has no portal account — the link would be a dead end
  | 'login_disabled'  // account exists but access was revoked (D26)
  | 'no_client'
  | 'send_failed'

export type ClientNotificationKind =
  | 'proposal_sent'
  | 'deliverable_delivered'
  | 'document_shared'
  | 'invoice_sent'

/** Walk every auth user. Same reason as the accounts screen: nothing missing. */
export async function listAllAuthUsers(admin: ReturnType<typeof createAdminClient>): Promise<User[]> {
  const PER_PAGE = 200
  const MAX_PAGES = 50
  const all: User[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE })
    if (error) throw new Error(error.message)
    all.push(...data.users)
    if (data.users.length < PER_PAGE) break
  }
  return all
}

function isDisabled(user: { banned_until?: string | null }): boolean {
  const until = user.banned_until
  if (!until) return false
  const at = Date.parse(until)
  return Number.isFinite(at) && at > Date.now()
}

/**
 * The client's portal login, or null. This is the address that can actually
 * SIGN IN, which is not necessarily `clients.email` — and a deep link sent to
 * an address with no account behind it is worse than no email at all: public
 * sign-ups are disabled (D5) and `signInWithOtp` runs with
 * `shouldCreateUser: false`, so the recipient has no self-service way in.
 */
export async function findPortalLogin(
  clientId: string
): Promise<{ userId: string; email: string | null; disabled: boolean } | null> {
  const admin = createAdminClient()
  const users = await listAllAuthUsers(admin)
  const match = users.find(
    u => (u.app_metadata as { client_id?: string } | undefined)?.client_id === clientId
  )
  if (!match) return null
  return { userId: match.id, email: match.email ?? null, disabled: isDisabled(match) }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Subject + body per kind. Plain English, short sentences, owner's voice. */
function compose(kind: ClientNotificationKind, title: string, url: string) {
  const button = `<p style="margin:22px 0"><a href="${url}" style="background:#1F3A5F;color:#fff;padding:11px 20px;border-radius:2px;text-decoration:none;font-family:sans-serif;font-size:15px">Open it in your portal</a></p>
<p style="font-size:13px;color:#666">Or paste this into your browser: ${url}</p>`
  const safe = esc(title)

  switch (kind) {
    case 'proposal_sent':
      return {
        subject: `Your proposal is ready — ${title}`.slice(0, 120),
        html: `<p>I've put a proposal in your portal: <strong>${safe}</strong>.</p>
<p>Have a read when you get a minute. You can approve it right on the page, and reply to this email if anything needs changing first.</p>${button}`,
      }
    case 'deliverable_delivered':
      return {
        subject: `Delivered — ${title}`.slice(0, 120),
        html: `<p><strong>${safe}</strong> is done and it's in your portal.</p>
<p>Take a look when you can. Reply to this email if something isn't right.</p>${button}`,
      }
    case 'document_shared':
      return {
        subject: `A document for you — ${title}`.slice(0, 120),
        html: `<p>I've shared <strong>${safe}</strong> with you.</p>
<p>It's in your portal under Documents.</p>${button}`,
      }
    case 'invoice_sent':
      return {
        subject: `Invoice — ${title}`.slice(0, 120),
        html: `<p>Invoice <strong>${safe}</strong> is in your portal, with the payment link on it.</p>
<p>Reply to this email if anything looks off and I'll sort it out.</p>${button}`,
      }
  }
}

/**
 * Tell a client something happened, and land them on the thing itself.
 *
 * Soft-fails in the same spirit as `sendNotification`: it never throws and
 * never fails the action it decorates — marking an invoice sent must not be
 * undone because an email bounced. The OUTCOME is returned so the owner can
 * be told, which is the part that matters: a notification that quietly did
 * not go out is indistinguishable from one that did.
 */
export async function notifyClient(opts: {
  clientId: string | null | undefined
  kind: ClientNotificationKind
  title: string
  /** Portal path the email links to, e.g. `/portal/billing/<id>`. */
  path: string
  /** False when the owner unticked "Email the client". */
  notify: boolean
}): Promise<NotifyOutcome> {
  if (!opts.notify) return 'suppressed'
  if (!opts.clientId) return 'no_client'

  try {
    const login = await findPortalLogin(opts.clientId)
    if (!login) return 'no_login'
    if (login.disabled) return 'login_disabled'
    if (!login.email) return 'no_login'

    const { subject, html } = compose(opts.kind, opts.title, `${SITE}${opts.path}`)
    const ok = await sendNotification({ to: login.email, subject, html })
    return ok ? 'sent' : 'send_failed'
  } catch (err) {
    console.error('[notify-client] failed:', err instanceof Error ? err.message : err)
    return 'send_failed'
  }
}

/**
 * Documents carry no `client_id` — they hang off an entity, and the client
 * is reached through it. These four branches mirror the RLS policy in
 * `20260711000000_portal_value_layer.sql` exactly; if that policy ever grows a
 * fifth entity type, this has to grow with it, or a share will notify nobody.
 */
export async function clientIdForEntity(
  entityType: 'assessment' | 'proposal' | 'project' | 'client',
  entityId: string
): Promise<string | null> {
  if (entityType === 'client') return entityId
  const table = entityType === 'project' ? 'projects' : entityType === 'assessment' ? 'assessments' : 'proposals'
  const supabase = await createSupabase()
  const { data } = await supabase.from(table).select('client_id').eq('id', entityId).single()
  return (data as { client_id: string | null } | null)?.client_id ?? null
}
