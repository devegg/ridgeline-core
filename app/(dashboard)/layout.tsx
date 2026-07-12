import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

// Pre-paint: apply the saved (or system) theme before first render so the
// dashboard never flashes the wrong mode. Same pattern as the portal.
const THEME_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('rk-dash-theme');
    var theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var el = document.querySelector('.dash-layout');
    if (el) el.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Defense in depth: the middleware gates this too, but the layout must not
  // rely on a hand-maintained path regex. Explicit owner role or out.
  const role = user.app_metadata?.role as string | undefined
  if (role !== 'owner') redirect('/portal')

  return (
    <div className="dash-layout" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <Sidebar role={role} />
      <div className="dash-main">
        <TopBar email={user.email ?? ''} />
        <div className="dash-content">
          {children}
        </div>
      </div>
    </div>
  )
}
