'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TopBarProps {
  email: string
}

export function TopBar({ email }: TopBarProps) {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="dash-topbar">
      <div className="dash-topbar__breadcrumb">Ridgeline Knows</div>
      <div className="dash-topbar__right">
        <span className="dash-topbar__email">{email}</span>
        <button className="dash-topbar__signout" onClick={signOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
