import type { MetadataRoute } from 'next'
import { WORK } from '@/lib/work-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ridgelineknows.com'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/work`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/papers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...WORK.map((w) => ({
      url: `${base}/work/${w.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
