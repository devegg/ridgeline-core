import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as string | undefined) ?? 'owner'

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
