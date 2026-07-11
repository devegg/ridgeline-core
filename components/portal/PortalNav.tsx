'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/portal/ThemeToggle'

const LINKS = [
  { href: '/portal', label: 'Overview', exact: true },
  { href: '/portal/projects', label: 'My Projects' },
  { href: '/portal/assessments', label: 'Assessments' },
  { href: '/portal/deliverables', label: 'Deliverables' },
  { href: '/portal/billing', label: 'Billing' },
  { href: '/portal/documents', label: 'Documents' },
  { href: '/portal/requests', label: 'Requests' },
]

export function PortalNav({ isOwner = false }: { isOwner?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Owner preview keeps its client context while moving between pages.
  const clientParam = isOwner ? searchParams.get('client') : null
  const withContext = (href: string) => (clientParam ? `${href}?client=${clientParam}` : href)

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="portal-nav">
      <div className="portal-nav__inner">
        <Link href={withContext('/portal')} className="wordmark">
          <span>Ridgeline</span>
          <span className="wordmark__rule" />
          <em>Knows</em>
        </Link>

        <div className="portal-nav__links">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={withContext(link.href)}
                className={`portal-nav__link ${active ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <button className="portal-nav__signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
