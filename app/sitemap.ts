import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { WORK } from '@/lib/work-data'
import { LANDING_INDUSTRIES } from '@/lib/landing-data'

// Refresh hourly so papers added to the DB appear without a redeploy.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.ridgelineknows.com'

  const routes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/work`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/papers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/customer-pulse-check`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...LANDING_INDUSTRIES.map((i) => ({
      url: `${base}/${i.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...WORK.map((w) => ({
      url: `${base}/work/${w.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  // Individual paper pages — public rows in `documents` (anon-readable via RLS).
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase.from('documents').select('id').eq('is_public', true)
    for (const paper of data ?? []) {
      routes.push({
        url: `${base}/papers/${paper.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch {
    // If the DB is unreachable at build/revalidate time, ship the static routes.
  }

  return routes
}
