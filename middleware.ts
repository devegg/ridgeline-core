import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DASHBOARD_PATHS = /^\/(overview|leads|clients|projects|proposals|assessments|deliverables|billing|scaffolder|documents|communications|settings|cleanup)(\/|$)/

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const role = (user?.app_metadata?.role as string) ?? 'owner'

  // Unauthenticated users can't access protected routes
  if ((isDashboard || isPortal) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Client-role users cannot access the dashboard — send them to the portal
  if (isDashboard && user && role === 'client') {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // After login, route by role
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL(role === 'client' ? '/portal' : '/overview', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
