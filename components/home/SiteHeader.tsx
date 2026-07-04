'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-header__inner">
        {/* On the homepage the wordmark scrolls to top; on any other page it navigates home. */}
        <Link href={isHome ? '#top' : '/'} className="wordmark" aria-label="Ridgeline Knows — home">
          <span>Ridgeline</span>
          <span className="wordmark__rule" />
          <em>Knows</em>
        </Link>
        <div>
          <Link href="/login" className="login-link">
            Client Login
          </Link>
        </div>
      </div>
    </header>
  )
}
