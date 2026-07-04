'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/papers', label: 'Papers' },
  { href: '/#contact', label: 'Contact' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const menuRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // While open: close on Escape or a click/tap outside the menu and toggle.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!menuRef.current?.contains(t) && !toggleRef.current?.contains(t)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])

  return (
    <header className={`site-header ${scrolled || open ? 'scrolled' : ''}`}>
      <div className="site-header__inner">
        {/* On the homepage the wordmark scrolls to top; on any other page it navigates home. */}
        <Link href={isHome ? '#top' : '/'} className="wordmark" aria-label="Ridgeline Knows — home">
          <span>Ridgeline</span>
          <span className="wordmark__rule" />
          <em>Knows</em>
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>

        <nav ref={menuRef} id="site-menu" className={`site-menu ${open ? 'is-open' : ''}`} aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="site-menu__link" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="site-menu__link site-menu__link--login"
            onClick={() => setOpen(false)}
          >
            Client Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
