import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Defense in depth: the middleware gates this too, but the layout must not
  // rely on a hand-maintained path regex. Explicit owner role or out.
  const role = user.app_metadata?.role as string | undefined
  if (role !== 'owner') redirect('/portal')

  return (
    <div className="dash-layout">
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
