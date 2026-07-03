'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LINKS = [
  { href: '/portal/projects', label: 'My Projects' },
  { href: '/portal/assessments', label: 'Assessments' },
  { href: '/portal/deliverables', label: 'Deliverables' },
  { href: '/portal/billing', label: 'Billing' },
  { href: '/portal/documents', label: 'Documents' },
]

export function PortalNav() {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="portal-nav">
      <div className="portal-nav__inner">
        <Link href="/portal" className="wordmark">
          <span>Ridgeline</span>
          <span className="wordmark__rule" />
          <em>Knows</em>
        </Link>

        <div className="portal-nav__links">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`portal-nav__link ${pathname.startsWith(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button className="portal-nav__signout" onClick={signOut}>
          Sign out
        </button>
      </div>
    </nav>
  )
}
