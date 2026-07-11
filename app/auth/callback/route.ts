import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Open-redirect guard: only same-origin relative paths pass. `//evil.com`
  // and `/\evil.com` are protocol-relative escapes; reject both.
  const rawNext = searchParams.get('next')
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\')
      ? rawNext
      : null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`)

      // No explicit destination: route by role (magic-link sign-ins land here).
      // Explicit owner only; anything else gets the portal surface.
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.app_metadata?.role as string | undefined
      return NextResponse.redirect(`${origin}${role === 'owner' ? '/overview' : '/portal'}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
