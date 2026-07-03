import { createClient } from '@/lib/supabase/server'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const projectHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace('https://', '')

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Settings</div>
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Account and system. Preferences arrive when there are preferences to set.</p>
      </div>
      <SettingsPanel email={user?.email ?? ''} projectHost={projectHost} />
    </div>
  )
}
