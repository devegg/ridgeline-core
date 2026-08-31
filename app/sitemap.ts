import type { MetadataRoute } from 'next'
import { LANDING_INDUSTRIES } from '@/lib/landing-data'

// /work, /papers and their children are deliberately absent: those pages are
// unlinked from the site while they wait to be revised, and an unlinked page
// in a sitemap still gets indexed. Put them back when they go back in the nav.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.ridgelineknows.com'

  const routes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/customer-pulse-check`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...LANDING_INDUSTRIES.map((i) => ({
      url: `${base}/${i.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  return routes
}
