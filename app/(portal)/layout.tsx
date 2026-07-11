import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalNav } from '@/components/portal/PortalNav'

/* Inline, pre-paint: read the saved portal theme (or system preference)
   and stamp it on the wrapper before first render, so there is no flash.
   The wrapper precedes this script in the DOM, so it is findable. */
const THEME_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('rk-portal-theme');
    var theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var el = document.querySelector('.portal-layout');
    if (el) el.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Owners may browse the portal deliberately — it is the demo and QA
  // surface — but pages label it and scope data via an explicit pick.
  const isOwner = ((user.app_metadata?.role as string) ?? 'owner') !== 'client'

  return (
    <div className="portal-layout" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <PortalNav isOwner={isOwner} />
      <div className="portal-content">
        {children}
      </div>
    </div>
  )
}
