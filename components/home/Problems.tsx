import { Reveal } from './Reveal'

const PROBLEMS = [
  {
    title: 'The report that takes hours to pull together.',
    body: 'Manually gathering data from multiple systems, combining it in a spreadsheet, reviewing for errors.',
  },
  {
    title: 'The form prospects print, fill out, sign, and scan back.',
    body: 'A paper workflow in a digital world, with emails getting lost and information stuck in inboxes.',
  },
  {
    title: 'The inbox that buries the emails that matter.',
    body: 'Thousands of messages, and the urgent items disappear among the noise. Nothing is getting tracked.',
  },
  {
    title: 'The spreadsheet that three people update manually.',
    body: 'No single source of truth. Versions conflict. Updates happen in different places. Nobody fully trusts the numbers.',
  },
]

export function Problems() {
  return (
    <section className="problems" id="problems">
      <div className="container">
        <Reveal>
          <div className="eyebrow">01 — What I fix</div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            Multiple small problems,<br />
            <em>costing you more</em> than you realize.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="lede">
            Most small businesses are not losing time to one big problem. They are losing it to many
            small ones, every single day. None of these feel urgent enough to stop and fix. Together,
            they cost you more than you realize.
          </p>
        </Reveal>

        <Reveal delay={2}>
          <div className="problem-list">
            {PROBLEMS.map((p, i) => (
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
  )
}
