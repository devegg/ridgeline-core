import Link from 'next/link'
import { SiteHeader } from '@/components/home/SiteHeader'
import { SiteFooter } from '@/components/home/SiteFooter'
import { LANDING_INDUSTRIES } from '@/lib/landing-data'

/** The typo net. Handwritten card words get misspelled; this page turns a
    miss into navigation by listing the real words. Public-safe only — it
    also fires for any other unknown URL on the site. */
export default function NotFound() {
  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <section className="nf">
            <div className="container">
              <div className="eyebrow">404 — Not quite</div>
              <h1 className="section-title">
                That page isn&rsquo;t here, <em>but you&rsquo;re close.</em>
              </h1>
              <p className="lede" style={{ marginTop: 20 }}>
                If a business card sent you, the handwritten word is one of these:
              </p>
              <div className="nf__words">
                {LANDING_INDUSTRIES.map((i) => (
                  <Link key={i.slug} href={`/${i.slug}`} className="nf__word">
                    <span>/{i.slug}</span>
                    <em>{i.name}</em>
                  </Link>
                ))}
              </div>
              <p className="lede" style={{ marginTop: 36 }}>
                Or start at the <Link href="/">home page</Link>, or with a{' '}
                <Link href="/customer-pulse-check">pulse check on your operation</Link>.
              </p>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
