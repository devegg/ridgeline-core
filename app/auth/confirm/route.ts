import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Token-hash confirmation — the browser-independent magic-link path
 * (Supabase's recommended SSR pattern). Unlike the PKCE ?code= callback,
 * verifyOtp with a token_hash needs nothing stored in the clicking
 * browser, so links work from any email app or device.
 *
 * Requires the Magic Link email template to point here (BACKLOG owner
 * step): {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Open-redirect guard, same rule as the callback.
  const rawNext = searchParams.get('next')
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\')
      ? rawNext
      : null

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`)
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.app_metadata?.role as string | undefined
      return NextResponse.redirect(`${origin}${role === 'owner' ? '/overview' : '/portal'}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`)
}
