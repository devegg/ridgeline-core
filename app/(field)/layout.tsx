import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Pre-paint: apply the saved (or system) theme before first render so the
// screen never flashes the wrong mode. Same pattern as the dashboard.
const THEME_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('rk-dash-theme');
    var theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var el = document.querySelector('.field-layout');
    if (el) el.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

/**
 * Field screens are used standing in someone else's shop, on a phone, with
 * the owner reading over your shoulder. The dashboard layout's fixed 220px
 * sidebar leaves ~170px of content at 390px wide, so these routes get their
 * own full-bleed shell instead.
 *
 * The auth gate is duplicated from app/(dashboard)/layout.tsx rather than
 * shared: ~15 lines against restyling 15 shipped pages mid-feature.
 */
export default async function FieldLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | undefined
  if (role !== 'owner') redirect('/portal')

  return (
    <div className="field-layout" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {children}
    </div>
  )
}
