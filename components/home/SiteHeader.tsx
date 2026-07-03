'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-header__inner">
        <a href="#top" className="wordmark" aria-label="Ridgeline Knows — home">
          <span>Ridgeline</span>
          <span className="wordmark__rule" />
          <em>Knows</em>
        </a>
        <div>
          <Link href="/login" className="login-link">
            Client Login
          </Link>
        </div>
      </div>
    </header>
  )
}
