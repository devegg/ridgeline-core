import { Reveal } from './Reveal'

const STEPS = [
  {
    title: 'The first conversation.',
    body: 'Free, whether by phone or in person. Sometimes that conversation ends with a recommendation for someone better suited to the problem. Sometimes I can walk you through enough that you can handle it yourself. I would rather do that than take a job that is not the right fit.',
    time: 'Week 0',
  },
  {
    title: 'A paid assessment.',
    body: 'I map how your operation currently works, identify where time and money are going, and document what a better version looks like in specific terms. That assessment belongs to you. You can hand it to me or take it anywhere else.',
    time: '2 – 4 weeks',
  },
  {
    title: 'A formal proposal.',
    body: 'If you want me to do the work, I will give you a defined scope and a fixed price. For custom builds, I stand behind the finished product. If it does not meet the scope we agreed on at the start, we settle the final price together.',
    time: 'Upon completion of assessment',
  },
  {
    title: 'The implementation.',
    body: 'This is not the cheapest option in the market. It is the option where the solution fits your operation exactly, gets built once, and does not need to be replaced in two years.',
    time: 'Varies',
  },
]

const OFFER = [
  {
    lead: 'The first hour is free.',
    body: 'I come and look, and we price one task on the spot with your own numbers. If there is nothing here worth doing, I will tell you that and go.',
  },
  {
    lead: 'No savings, no fee.',
    body: 'For the first twelve months I take 25% of what the system actually saves you, month by month, against a count you can check. A slow month is a small bill. A month where it saves nothing costs you nothing.',
  },
  {
    lead: 'After twelve months the percentage stops.',
    body: 'It becomes a flat monthly fee to keep the thing running — agreed before we start, and it does not go up because your business got busier.',
  },
  {
    lead: 'You can own it outright whenever you want.',
    body: 'And if I ever stop, it becomes yours automatically. You should not be one person’s health away from losing how your business runs.',
  },
]

export function Engagement() {
  return (
    <section className="engagement band band--dark band--accent" id="how">
      <div className="container">
        <Reveal>
          <div className="eyebrow">04 — How it works</div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            Four steps. <em>Clear terms.</em>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="lede">
            Every engagement starts the same way: I need to understand your operation before I say
            anything about what I can do for it. From there, the path is clear at every step.
          </p>
        </Reveal>

        <Reveal delay={2}>
          <div className="engagement__steps">
            {STEPS.map((s, i) => (
              <div className="step" key={i}>
                <div className="step__num">Step 0{i + 1}</div>
                <div className="step__title">{s.title}</div>
                <div className="step__body">{s.body}</div>
                <div className="step__time">{s.time}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={2}>
          <aside className="offer" aria-labelledby="offer-title">
            <div className="offer__head">
              <div className="offer__label">The other way in</div>
              <h3 className="offer__title" id="offer-title">
                Some jobs don&rsquo;t need an assessment.
              </h3>
              <p className="offer__lede">
                The four steps above are for work where the value is real but hard to count &mdash;
                where I need to understand how your whole operation runs before I can tell you what
                to do about it. Not every job is like that. If we can put a number on it before I
                start &mdash; this task, this many times a week, this much of somebody&rsquo;s day
                &mdash; then there is no reason for you to pay me to go and find that out.
              </p>
            </div>

            <ul className="offer__points">
              {OFFER.map((o) => (
                <li key={o.lead}>
                  <strong>{o.lead}</strong>
                  <span>{o.body}</span>
                </li>
              ))}
            </ul>

            <p className="offer__close">
              Which of the two applies is not about what you would rather pay. It is about whether
              the number can be named before we start &mdash; and I will tell you which one it is on
              the first call.
            </p>
          </aside>
        </Reveal>
      </div>
    </section>
  )
}
