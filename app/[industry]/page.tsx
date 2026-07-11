import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { LANDING_INDUSTRIES, findLanding } from '@/lib/landing-data'
import { IndustryLanding } from '@/components/landing/IndustryLanding'

/** The card-word routes (/vrm, /trades, /books, …). Static segments elsewhere
    in app/ always win over this dynamic one, so it only sees unclaimed words.
    Aliases and any-cased variants 308 to the canonical lowercase word; unknown
    words fall through to the not-found net. */

export function generateStaticParams() {
  return LANDING_INDUSTRIES.map((i) => ({ industry: i.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await params
  const hit = findLanding(industry)
  if (!hit) return {}
  const { entry } = hit
  const title = `${entry.name} — Ridgeline Knows`
  return {
    title,
    description: entry.headline,
    alternates: { canonical: `https://www.ridgelineknows.com/${entry.slug}` },
    openGraph: { title, description: entry.headline },
  }
}

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params
  const hit = findLanding(industry)
  if (!hit) notFound()
  if (industry !== hit.entry.slug) permanentRedirect(`/${hit.entry.slug}`)
  return <IndustryLanding entry={hit.entry} />
}
