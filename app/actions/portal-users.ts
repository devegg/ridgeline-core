'use server'

import type { User } from '@supabase/supabase-js'
import { createClient as createSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNotification } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ridgelineknows.com'

/** Owner-only guard shared by portal-login administration. */
async function assertOwner(): Promise<boolean> {
  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user && (user.app_metadata?.role as string | undefined) === 'owner'
}

/**
 * Find the client's portal login (the auth user whose app_metadata.client_id
 * matches). Returns null when none exists or when the admin key isn't
 * configured. Owner-gated read used by the portal-data page.
 */
export async function getPortalLogin(clientId: string): Promise<
  | { configured: true; email: string | null; userId: string | null }
  | { configured: false; reason: 'missing_key' | 'key_rejected' }
> {
  if (!(await assertOwner())) return { configured: false, reason: 'missing_key' }
  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { configured: false, reason: 'missing_key' }
  }
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error('[portal-login] listUsers failed:', error.message)
    return { configured: false, reason: 'key_rejected' }
  }
  const match = data.users.find(u => (u.app_metadata as { client_id?: string })?.client_id === clientId)
  return { configured: true, email: match?.email ?? null, userId: match?.id ?? null }
}

/**
 * Owner changes a client's LOGIN email (Supabase Auth). Optionally notifies
 * both the old and the new address (standard practice for account-email
 * changes), and optionally syncs the client record's contact email.
 */
export async function changePortalEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await assertOwner())) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const newEmail = ((formData.get('new_email') as string) ?? '').trim().toLowerCase()
  const notify = formData.get('notify') === 'on'
  const syncContact = formData.get('sync_contact') === 'on'
  if (!clientId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return { errors: { _root: 'A valid new email is required.' } }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { errors: { _root: 'SUPABASE_SECRET_KEY is not configured yet (see BACKLOG) — the login email lives in Supabase Auth and needs it.' } }
  }

  const { data, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) return { errors: { _root: 'Could not reach Supabase Auth.' } }
  const user = data.users.find(u => (u.app_metadata as { client_id?: string })?.client_id === clientId)
  if (!user) {
    return { errors: { _root: 'This client has no portal login yet — create one per docs/setup/CLIENT-PORTAL-RUNBOOK.md first.' } }
  }

  const oldEmail = user.email ?? null
  if (oldEmail === newEmail) return { errors: { _root: 'That is already the login email.' } }

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    email: newEmail,
    email_confirm: true, // owner-administered change; no double-confirm dance
  })
  if (updateError) {
    return { errors: { _root: `Supabase refused the change: ${updateError.message}` } }
  }

  if (syncContact) {
    const supabase = await createSupabase()
    await supabase.from('clients').update({ email: newEmail }).eq('id', clientId)
  }

  if (notify) {
    // New address: what changed + how to sign in (magic link is the house path).
    await sendNotification({
      to: newEmail,
      subject: 'Your Ridgeline portal sign-in email changed',
      html: `<p>Your portal login is now <strong>${newEmail}</strong>.</p>
<p>To sign in: go to <a href="${SITE}/login">${SITE.replace('https://', '')}/login</a> and choose
<em>"Get a sign-in link by email"</em> — no password needed. (If you prefer a password,
use the sign-in link first, then set one from your account.)</p>
<p>If you didn't expect this change, reply to this email.</p>`,
    })
    // Old address: the security courtesy note.
    if (oldEmail) {
      await sendNotification({
        to: oldEmail,
        subject: 'Your Ridgeline portal sign-in email was changed',
        html: `<p>The sign-in email for your Ridgeline portal account was changed to <strong>${newEmail}</strong> by Ridgeline.</p>
<p>If this wasn't expected, reply to this email immediately.</p>`,
      })
    }
  }

  revalidatePath(`/clients/${clientId}/portal`)
  return { message: `Login email changed${oldEmail ? ` from ${oldEmail}` : ''} to ${newEmail}.${notify ? ' Both addresses were notified.' : ''}` }
}

/**
 * Shared: create the auth user for a client (used by the Portal login panel
 * and the contact form's portal-access checkbox). Returns the one-time
 * password or a plain-language error.
 */
export async function provisionPortalLogin(clientId: string, email: string): Promise<{ password: string } | { error: string }> {
  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { error: 'SUPABASE_SECRET_KEY is not configured (see BACKLOG).' }
  }
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (existing?.users.some(u => (u.app_metadata as { client_id?: string })?.client_id === clientId)) {
    return { error: 'This client already has a portal login.' }
  }
  const { randomBytes } = await import('node:crypto')
  const password = `rk-${randomBytes(12).toString('base64url')}`
  const { error } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    app_metadata: { role: 'client', client_id: clientId },
  })
  if (error) return { error: `Supabase refused: ${error.message}` }
  return { password }
}

/**
 * Owner creates a client's portal login: an auth user stamped with
 * app_metadata { role: 'client', client_id } (the runbook's manual steps,
 * automated). Generates a strong password shown ONCE; magic-link sign-in
 * works too when the address can receive mail.
 */
export async function createPortalLoginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await assertOwner())) return { errors: { _root: 'Owner only.' } }

  const clientId = formData.get('client_id') as string
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase()
  if (!clientId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { _root: 'A valid email is required.' } }
  }

  const result = await provisionPortalLogin(clientId, email)
  if ('error' in result) return { errors: { _root: result.error } }

  revalidatePath(`/clients/${clientId}/portal`)
  revalidatePath('/accounts')
  return {
    message: `Login created for ${email}. One-time password (copy now, it will not be shown again): ${result.password} — magic-link sign-in also works if that address receives mail.`,
  }
}

// ============================================================
// Accounts screen — every client, whether a login exists, and its state.
// ============================================================

/**
 * One row of the accounts screen. A row exists for every client (whether or
 * not it has a login) and for every non-owner auth user that does NOT map to
 * a client — the second kind is the whole reason this screen is worth having,
 * because an orphaned account is invisible everywhere else in the app.
 */
export interface PortalAccountRow {
  kind: 'client' | 'orphan'
  clientId: string | null
  clientName: string | null
  clientStatus: string | null
  userId: string | null
  email: string | null
  lastSignInAt: string | null
  createdAt: string | null
  disabled: boolean
  /** Why this auth user has no client: it names one that's gone, or names none. */
  orphanReason: 'client_missing' | 'no_client_id' | null
}

export type PortalAccountsResult =
  | { configured: true; rows: PortalAccountRow[]; ownerCount: number }
  | { configured: false; reason: 'not_owner' | 'missing_key' | 'key_rejected' }

/**
 * Measured against a real throwaway user, not inferred: `banned_until` is
 * ABSENT on a user that has never been banned, carries a FUTURE timestamp
 * while banned (through `listUsers` as well as `updateUserById`), and is
 * absent again once the ban is lifted with `ban_duration: 'none'`.
 *
 * The comparison against now is therefore belt-and-braces — it also covers a
 * ban left to expire on its own, which is a case nothing here exercises.
 */
function isDisabled(user: { banned_until?: string | null }): boolean {
  const until = user.banned_until
  if (!until) return false
  const at = Date.parse(until)
  return Number.isFinite(at) && at > Date.now()
}

/**
 * Every auth user, walked page by page. The three older call sites in this
 * file ask for `perPage: 1000` and silently drop anything past the first
 * thousand; this one cannot, because the whole point of the screen is that
 * nothing is missing from it.
 */
async function listAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const PER_PAGE = 200
  const MAX_PAGES = 50 // 10k users — a guard against looping, not a real ceiling
  const all: User[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE })
    if (error) throw new Error(error.message)
    all.push(...data.users)
    if (data.users.length < PER_PAGE) break
  }
  return all
}

/** Owner-gated read behind the accounts screen. One auth call, one clients query. */
export async function listPortalAccounts(): Promise<PortalAccountsResult> {
  if (!(await assertOwner())) return { configured: false, reason: 'not_owner' }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { configured: false, reason: 'missing_key' }
  }

  let users
  try {
    users = await listAllAuthUsers(admin)
  } catch (e) {
    console.error('[accounts] listUsers failed:', e instanceof Error ? e.message : e)
    return { configured: false, reason: 'key_rejected' }
  }

  const supabase = await createSupabase()
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, status')
    .order('name')

  const meta = (u: User) =>
    (u.app_metadata ?? {}) as { role?: string; client_id?: string }

  const byClientId = new Map<string, User>()
  for (const u of users) {
    const cid = meta(u).client_id
    if (cid && !byClientId.has(cid)) byClientId.set(cid, u)
  }

  const rows: PortalAccountRow[] = []

  for (const c of (clients ?? []) as { id: string; name: string; status: string }[]) {
    const u = byClientId.get(c.id)
    rows.push({
      kind: 'client',
      clientId: c.id,
      clientName: c.name,
      clientStatus: c.status,
      userId: u?.id ?? null,
      email: u?.email ?? null,
      lastSignInAt: u?.last_sign_in_at ?? null,
      createdAt: u?.created_at ?? null,
      disabled: u ? isDisabled(u) : false,
      orphanReason: null,
    })
  }

  const clientIds = new Set((clients ?? []).map((c: { id: string }) => c.id))
  let ownerCount = 0
  for (const u of users) {
    const { role, client_id } = meta(u)
    if (role === 'owner') {
      ownerCount++
      continue
    }
    if (client_id && clientIds.has(client_id)) continue
    rows.push({
      kind: 'orphan',
      clientId: client_id ?? null,
      clientName: null,
      clientStatus: null,
      userId: u.id,
      email: u.email ?? null,
      lastSignInAt: u.last_sign_in_at ?? null,
      createdAt: u.created_at ?? null,
      disabled: isDisabled(u),
      orphanReason: client_id ? 'client_missing' : 'no_client_id',
    })
  }

  return { configured: true, rows, ownerCount }
}

/**
 * Owner turns a client's portal access off or back on. This is a Supabase Auth
 * ban with a long duration, NOT a delete: the account and its sign-in history
 * survive, so "when did we cut them off" stays answerable and the decision is
 * reversible. Deleting an auth account is not offered anywhere in this screen.
 */
export async function setPortalAccessAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createSupabase()
  const { data: { user: actor } } = await supabase.auth.getUser()
  if (!actor || (actor.app_metadata?.role as string | undefined) !== 'owner') {
    return { errors: { _root: 'Owner only.' } }
  }

  const userId = (formData.get('user_id') as string) ?? ''
  const disable = formData.get('disable') === 'true'
  if (!userId) return { errors: { _root: 'Which account?' } }

  // Two guards that matter more than they look: locking yourself out of the
  // dashboard has no in-app recovery path, and an owner account is never a
  // "portal access" question in the first place.
  if (userId === actor.id) {
    return { errors: { _root: 'That is your own account — disabling it would lock you out of the dashboard.' } }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { errors: { _root: 'SUPABASE_SECRET_KEY is not configured — portal access lives in Supabase Auth and needs it.' } }
  }

  const { data: target, error: readError } = await admin.auth.admin.getUserById(userId)
  if (readError || !target?.user) return { errors: { _root: 'That account no longer exists.' } }
  if ((target.user.app_metadata as { role?: string })?.role === 'owner') {
    return { errors: { _root: 'That is an owner account, not a client portal login.' } }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: disable ? '876000h' : 'none', // ~100 years, or lifted
  })
  if (error) return { errors: { _root: `Supabase refused: ${error.message}` } }

  revalidatePath('/accounts')
  return {
    message: disable
      ? `Portal access disabled for ${target.user.email ?? 'that account'}. Their sign-in history is kept, and you can re-enable it here.`
      : `Portal access restored for ${target.user.email ?? 'that account'}.`,
  }
}
