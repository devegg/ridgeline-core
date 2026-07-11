'use server'

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
  { configured: true; email: string | null; userId: string | null } | { configured: false }
> {
  if (!(await assertOwner())) return { configured: false }
  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { configured: false }
  }
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return { configured: true, email: null, userId: null }
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
