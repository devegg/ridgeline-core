'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/portal/ThemeToggle'
import {
  Mail,
  LayoutDashboard,
  Users,
  UserPlus,
  FolderOpen,
  FileText,
  ClipboardList,
  Package,
  DollarSign,
  Receipt,
  SlidersHorizontal,
  File,
  Settings,
  Trash2,
  MessageSquare,
  MapPin,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  stub?: boolean
}

const NAV_MAIN: NavItem[] = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/prospects', label: 'Card Drops', icon: MapPin },
  { href: '/leads', label: 'Leads', icon: UserPlus },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/proposals', label: 'Proposals', icon: FileText },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/deliverables', label: 'Deliverables', icon: Package },
  { href: '/requests', label: 'Requests', icon: MessageSquare },
]

const NAV_BILLING: NavItem[] = [
  { href: '/billing', label: 'Overview', icon: DollarSign },
  { href: '/billing/invoices', label: 'Invoices', icon: Receipt },
  { href: '/billing/rates', label: 'Rates', icon: SlidersHorizontal },
]

const NAV_TOOLS: NavItem[] = []

const NAV_STUBS: NavItem[] = [
  { href: '/templates', label: 'Templates', icon: Mail },
  { href: '/documents', label: 'Documents', icon: File },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavLink({ item, exact = false }: { item: NavItem; exact?: boolean }) {
  const pathname = usePathname()
  const active = exact ? pathname === item.href : pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`dash-nav__item ${active ? 'active' : ''} ${item.stub ? 'opacity-60' : ''}`}
    >
      <Icon size={15} />
      {item.label}
      {item.stub && (
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
          soon
        </span>
      )}
    </Link>
  )
}

export function Sidebar({ role = 'owner' }: { role?: string }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__wordmark">
        <span>Ridgeline</span>
        <span className="dash-sidebar__wordmark-rule" />
        <em>Knows</em>
      </div>

      <nav className="dash-nav">
        <div className="dash-nav__section-label">Workspace</div>
        {NAV_MAIN.map((item) => (
          <NavLink key={item.href} item={item} exact={item.href === '/overview'} />
        ))}

        <div className="dash-nav__section-label" style={{ marginTop: '8px' }}>Billing</div>
        <div className="dash-nav__sub">
          {NAV_BILLING.map((item) => (
            <NavLink key={item.href} item={item} exact={item.href === '/billing'} />
          ))}
        </div>

        {NAV_TOOLS.length > 0 && (
          <>
            <div className="dash-nav__section-label" style={{ marginTop: '8px' }}>Tools</div>
            {NAV_TOOLS.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        )}

        <hr className="dash-nav__divider" />
        {NAV_STUBS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        {role === 'owner' && (
          <NavLink item={{ href: '/cleanup', label: 'Cleanup', icon: Trash2 }} />
        )}
      </nav>

      <div className="dash-sidebar__footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span>Ridgeline · Internal</span>
        <ThemeToggle rootSelector=".dash-layout" storageKey="rk-dash-theme" />
      </div>
    </aside>
  )
}
