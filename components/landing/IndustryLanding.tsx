import { SiteHeader } from '@/components/home/SiteHeader'
import { SiteFooter } from '@/components/home/SiteFooter'
import { Reveal } from '@/components/home/Reveal'
import { Contact } from '@/components/home/Contact'
import { PortalMock } from './PortalMock'
import type { LandingIndustry } from '@/lib/landing-data'

/** Shared template behind every card-word page (/vrm, /trades, …) and the
    generic /customer-pulse-check. One layout, per-industry content from
    lib/landing-data.ts, contact form tagged with the page so the lead
    records which card converted. */
export function IndustryLanding({ entry }: { entry: LandingIndustry }) {
  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <section className="hero landing-hero" id="top">
            <div className="container">
              <Reveal className="hero__meta">
                <span>Operations &amp; automation</span>
                <i />
                <span>The Lowcountry to Myrtle Beach and beyond</span>
              </Reveal>
              <Reveal delay={1}>
                {/* The industry IS the headline act — a broker landing on /real
                    must see "Real estate" before anything else. */}
                <h1 className="landing-hero__title">
                  <span className="landing-hero__industry">{entry.name}.</span>
                  <span className="landing-hero__hook">{entry.headline}</span>
                </h1>
              </Reveal>
              <Reveal delay={2}>
                <p className="hero__pitch landing-hero__pitch">{entry.lede}</p>
              </Reveal>
              <Reveal delay={3} className="hero__cta-row">
                <a href="#contact" className="btn-primary">
                  Let&rsquo;s Talk
                  <span className="arrow" />
                </a>
                <a href="/#how" className="btn-quiet">How I work</a>
              </Reveal>
            </div>
          </section>

          <section className="landing-portal">
            <div className="container">
              <div className="two-col">
                <div>
                  <Reveal>
                    <div className="eyebrow">The proof, live</div>
                  </Reveal>
                  <Reveal delay={1}>
                    <h2 className="section-title">
                      You will <em>see</em> what it saves.
                    </h2>
                  </Reveal>
                  <Reveal delay={2}>
                    <p className="lede">
                      Every client gets a private portal: what ran, what it saved, and the math
                      behind the number. You will never wonder what you&rsquo;re paying for.
                    </p>
                  </Reveal>
                  <Reveal delay={2}>
                    <p className="landing-portal__note">
                      The dashboard here is sample data. Yours shows your numbers, counted
                      conservatively, with the arithmetic visible.
                    </p>
                  </Reveal>
                </div>
                <Reveal delay={1}>
                  <PortalMock mock={entry.mock} industry={entry.name} />
                </Reveal>
              </div>
            </div>
          </section>

          <section className="problems">
            <div className="container">
              <Reveal>
                <div className="eyebrow">What eats the week</div>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="section-title">
                  Sound <em>familiar?</em>
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <div className="problem-list">
                  {entry.pains.map((p, i) => (
                    <article key={i} className="problem">
                      <div className="problem__num">{String(i + 1).padStart(2, '0')}</div>
                      <div>
                        <div className="problem__title">{p.title}</div>
                        <div className="problem__body">{p.body}</div>
                      </div>
                      <div className="problem__mark">Common</div>
                    </article>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          <section className="landing-review">
            <div className="container">
              <Reveal>
                <figure className="reserved-review">
                  <blockquote>&ldquo;He gave me my Tuesday mornings back.&rdquo;</blockquote>
                  <figcaption>
                    &mdash; Nobody yet. This space is reserved for my first{' '}
                    {entry.reviewLabel ?? entry.name.toLowerCase()} clients, and I intend to earn
                    it.
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </section>

          <section className="landing-how" id="how">
            <div className="container">
              <Reveal>
                <div className="eyebrow">How it works</div>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="section-title">
                  Four steps. <em>Clear terms.</em>
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <ol className="landing-steps">
                  <li>
                    <strong>A free conversation.</strong> Phone or in person. If I&rsquo;m not the
                    right fit, I&rsquo;ll say so and point you to someone better suited.
                  </li>
                  <li>
                    <strong>A paid assessment.</strong> I map how your operation actually runs and
                    write down exactly where the time goes. The document is yours to keep either
                    way.
                  </li>
                  <li>
                    <strong>A fixed-price proposal.</strong> Defined scope, one price, no hourly
                    meter running.
                  </li>
                  <li>
                    <strong>The build, and after.</strong> Built once, to fit your operation
                    exactly. Monitored after hand-off, with a monthly plain-language report of what
                    ran and what it saved. Automations nobody watches break silently; mine
                    don&rsquo;t.
                  </li>
                </ol>
              </Reveal>
              <Reveal delay={2}>
                <p className="lede" style={{ marginTop: 28 }}>
                  The longer version, and the work behind it, is on the <a href="/">home page</a>.
                </p>
              </Reveal>
            </div>
          </section>

          <Contact situations={entry.situations} source={`/${entry.slug}`} eyebrow={'Let’s talk'} />
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
