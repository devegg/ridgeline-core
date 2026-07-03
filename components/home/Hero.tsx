import { Reveal } from './Reveal'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <Reveal className="hero__meta">
          <span>Operations Counsel</span>
          <i />
          <span>The Lowcountry to Myrtle Beach and beyond</span>
          <i />
          <span>Small Business</span>
        </Reveal>

        <Reveal delay={1}>
          <h1>
            Ridgeline <span className="ital">Knows</span>
          </h1>
        </Reveal>

        <Reveal delay={2}>
          <p className="hero__pitch">
            I help businesses eliminate hours lost to tasks that can run automatically.
          </p>
        </Reveal>

        <Reveal delay={3}>
          <p className="hero__sub">
            Thirty years inside real operations. I find what is costing you time, and I fix it.
          </p>
        </Reveal>

        <Reveal delay={3} className="hero__cta-row">
          <a href="#contact" className="btn-primary">
            Let&rsquo;s Talk
            <span className="arrow" />
          </a>
          <a href="#how" className="btn-quiet">How it works</a>
        </Reveal>
      </div>
    </section>
  )
}
