import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/home/SiteHeader'
import { SiteFooter } from '@/components/home/SiteFooter'
import { WORK } from '@/lib/work-data'

export const metadata: Metadata = {
  title: 'Work — Ridgeline Knows',
  description: 'Products and client platforms, built end-to-end by one developer. Named where they are mine; anonymized where they are not.',
}

export default function WorkPage() {
  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <section className="stories" style={{ paddingTop: 96 }}>
            <div className="container">
              <div className="eyebrow">Work</div>
              <h1 className="section-title">
                Built, shipped,<br />
                <em>and running.</em>
              </h1>
              <p className="lede">
                Products are named and linked — click through and see them live. Client work is
                anonymized; outcomes are not.
              </p>

              {WORK.map((w, i) => (
                <article className="story" key={w.slug}>
                  <div>
                    <div className="story__num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="story__meta">
                      <span>{w.kind}</span>
                      {w.status}
                    </div>
                  </div>
                  <div>
                    <h3 className="story__title">
                      <Link href={`/work/${w.slug}`} style={{ color: 'inherit' }}>
                        {w.name}
                      </Link>
                    </h3>
                    <p className="story__body">{w.oneLiner}</p>
                  </div>
                  <div>
                    <p className="story__outcome">
                      <Link href={`/work/${w.slug}`}>The full story →</Link>
                      {w.href && (
                        <>
                          <br />
                          <a href={w.href} target="_blank" rel="noopener noreferrer">
                            Visit it live →
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </article>
              ))}

              <p className="lede" style={{ marginTop: 56 }}>
                Written deep-dives live on the <Link href="/papers">papers page</Link>.
              </p>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
