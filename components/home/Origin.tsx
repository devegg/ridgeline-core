import { Reveal } from './Reveal'

export function Origin() {
  return (
    <section className="origin" id="name">
      <div className="container">
        <div className="two-col">
          <div>
            <Reveal>
              <div className="eyebrow">04 — The name</div>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="section-title">
                Why <em>Ridgeline.</em>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="origin__attribution">
                From a song I wrote about where<br />
                I was headed and who I was becoming.
              </p>
            </Reveal>
          </div>
          <div>
            <Reveal delay={1}>
              <p className="origin__big">
                A ridgeline does not move. It does not exaggerate the terrain or hide it. It shows
                you exactly where you stand.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <div className="origin__body">
                <p>
                  That is the promise I make to every business I work with. I will tell you honestly
                  what I see, what is costing you time, and whether I can fix it. If I cannot, I
                  will tell you that too.
                </p>
                <p>
                  The domain RidgelineKnows.com came together the same way. Bo Jackson built a
                  career on two words. Bo Knows. The idea is the same. Ridgeline Knows. Not because
                  I know everything, but because I have spent thirty years inside real business
                  operations, finding what is broken and building what works.
                </p>
                <p>
                  The name is personal. The work is practical. That combination is the whole
                  business.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
