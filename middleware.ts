import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabasePublishableKey, supabaseUrl } from '@/lib/supabase/keys'

const DASHBOARD_PATHS = /^\/(overview|leads|clients|projects|proposals|assessments|deliverables|billing|requests|documents|settings|cleanup)(\/|$)/

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // Refresh session — do not remove, required for Supabase SSR
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isDashboard = DASHBOARD_PATHS.test(pathname)
  const isPortal = pathname.startsWith('/portal')

  // Deny by default: owner access requires the explicit role. A user with
  // no role gets the portal surface, where RLS gives them nothing.
  const role = user?.app_metadata?.role as string | undefined

  // Unauthenticated users can't access protected routes
  if ((isDashboard || isPortal) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Only the explicit owner role reaches the dashboard
  if (isDashboard && user && role !== 'owner') {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // After login, route by role
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL(role === 'owner' ? '/overview' : '/portal', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
