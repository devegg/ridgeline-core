'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

/** Light/dark toggle for any themed surface. Defaults preserve the original
    portal behavior; the dashboard passes its own root + storage key. The
    pre-paint script in each layout sets the initial attribute; this keeps
    it in sync. */
export function ThemeToggle({
  rootSelector = '.portal-layout',
  storageKey = 'rk-portal-theme',
}: {
  rootSelector?: string
  storageKey?: string
} = {}) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    const root = document.querySelector(rootSelector)
    const current = root?.getAttribute('data-theme')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.querySelector(rootSelector)?.setAttribute('data-theme', next)
    try { localStorage.setItem(storageKey, next) } catch { /* private mode */ }
  }

  if (theme === null) return <span style={{ width: 16, height: 16, display: 'inline-block' }} />

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--ink-soft)', cursor: 'pointer' }}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
