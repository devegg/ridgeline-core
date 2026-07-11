'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'rk-portal-theme'

/** Light/dark toggle for the portal only. The pre-paint script in the
    portal layout sets the initial attribute; this keeps it in sync. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    const root = document.querySelector('.portal-layout')
    const current = root?.getAttribute('data-theme')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.querySelector('.portal-layout')?.setAttribute('data-theme', next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode */ }
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
