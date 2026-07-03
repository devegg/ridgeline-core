import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/home/SiteHeader'
import { SiteFooter } from '@/components/home/SiteFooter'
import { WORK } from '@/lib/work-data'

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const w = WORK.find((x) => x.slug === slug)
  if (!w) return {}
  return { title: `${w.name} — Ridgeline Knows`, description: w.oneLiner }
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const w = WORK.find((x) => x.slug === slug)
  if (!w) notFound()

  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <section className="stories" style={{ paddingTop: 96 }}>
            <div className="container" style={{ maxWidth: 820 }}>
              <div className="eyebrow">
                {w.kind} · {w.status}
              </div>
              <h1 className="section-title">{w.name}</h1>
              <p className="lede">{w.oneLiner}</p>

              {w.body.map((p, i) => (
                <p className="story__body" key={i} style={{ marginTop: 20 }}>
                  {p}
                </p>
              ))}

              <p className="story__outcome" style={{ marginTop: 32 }}>
                {w.outcome}
              </p>

              <p className="story__meta" style={{ marginTop: 24 }}>{w.stack}</p>

              <div style={{ marginTop: 40, display: 'flex', gap: 24 }}>
                {w.href && (
                  <a className="btn-primary" href={w.href} target="_blank" rel="noopener noreferrer">
                    See it live
                  </a>
                )}
                <Link className="btn-quiet" href="/work">
                  ← All work
                </Link>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
