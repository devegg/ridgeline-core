import type { Metadata } from 'next'
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-newsreader',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ridgelineknows.com'),
  title: 'Ridgeline Knows — Operations counsel for small business owners',
  description:
    'Ridgeline Knows helps small businesses eliminate hours lost to tasks that can run automatically. Thirty years inside real operations. I find what is costing you time, and I fix it.',
  openGraph: {
    title: 'Ridgeline Knows — Operations counsel for small business owners',
    description:
      'I help businesses eliminate hours lost to tasks that can run automatically. The Lowcountry to Myrtle Beach and beyond.',
    url: 'https://www.ridgelineknows.com',
    siteName: 'Ridgeline Knows',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ridgeline Knows — Operations counsel for small business owners',
    description: 'I help businesses eliminate hours lost to tasks that can run automatically.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
