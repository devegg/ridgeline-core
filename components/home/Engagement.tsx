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

export function Engagement() {
  return (
    <section className="engagement" id="how">
      <div className="container">
        <Reveal>
          <div className="eyebrow">05 — How it works</div>
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
      </div>
    </section>
  )
}
