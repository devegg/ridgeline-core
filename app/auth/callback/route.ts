import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`)

      // No explicit destination: route by role (magic-link sign-ins land here).
      const { data: { user } } = await supabase.auth.getUser()
      const role = (user?.app_metadata?.role as string) ?? 'owner'
      return NextResponse.redirect(`${origin}${role === 'client' ? '/portal' : '/overview'}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
