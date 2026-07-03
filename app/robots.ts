import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/overview', '/clients', '/projects', '/proposals', '/assessments', '/deliverables', '/documents', '/billing', '/leads', '/communications', '/settings', '/scaffolder', '/cleanup', '/portal', '/login'],
    },
    sitemap: 'https://www.ridgelineknows.com/sitemap.xml',
  }
}
