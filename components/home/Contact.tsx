'use client'

import { useState } from 'react'
import { Reveal } from './Reveal'
import { sendContactMessage } from '@/app/actions/contact'

const SITUATIONS = [
  'Growth has stalled',
  'Margin is eroding',
  'Succession or sale',
  'Outgrowing how we operate',
  'Something else',
]

function ContactForm() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    company: '',
    situation: SITUATIONS[0],
    message: '',
    website: '', // honeypot — humans never see it, bots fill it
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!values.name.trim()) next.name = 'Required'
    if (!values.email.trim()) next.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Doesn't look right"
    if (!values.message.trim() || values.message.trim().length < 20) next.message = 'A sentence or two, please'
    return next
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    try {
      const result = await sendContactMessage(values)
      if (result.ok) {
        setSubmitted(true)
      } else {
        setErrors({ _root: result.error ?? 'Something went wrong — please email hello@ridgelineknows.com directly.' })
      }
    } catch {
      // Server action rejected (deployment skew, timeout, network) — never leave the button hung.
      setErrors({ _root: 'Something went wrong — please refresh and try again, or email hello@ridgelineknows.com directly.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="form-success" role="status">
        <div className="form-success__mark">Message received</div>
        <div className="form-success__title">
          Thank you, {values.name.split(' ')[0]}. I will be in touch within two business days.
        </div>
        <div className="form-success__body">
          Replies come from a personal address — not a marketing system. If the matter is
          time-sensitive, the phone number to the left is the fastest way through.
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field-row">
        <div className={`field ${errors.name ? 'field--error' : ''}`}>
          <label htmlFor="f-name">Your name</label>
          <input id="f-name" type="text" value={values.name} onChange={setField('name')} autoComplete="name" />
          {errors.name && <div className="field__error">{errors.name}</div>}
        </div>
        <div className={`field ${errors.email ? 'field--error' : ''}`}>
          <label htmlFor="f-email">Email</label>
          <input id="f-email" type="email" value={values.email} onChange={setField('email')} autoComplete="email" />
          {errors.email && <div className="field__error">{errors.email}</div>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="f-company">Company (optional)</label>
          <input id="f-company" type="text" value={values.company} onChange={setField('company')} autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="f-situation">Which is closest</label>
          <select id="f-situation" value={values.situation} onChange={setField('situation')}>
            {SITUATIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className={`field ${errors.message ? 'field--error' : ''}`}>
        <label htmlFor="f-message">What&rsquo;s going on</label>
        <textarea
          id="f-message"
          value={values.message}
          onChange={setField('message')}
          placeholder="A few sentences is plenty. I'll read it before we talk."
        />
        {errors.message && <div className="field__error">{errors.message}</div>}
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 'auto' }} aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input
          id="f-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={setField('website')}
        />
      </div>

      {errors._root && (
        <div className="field__error" role="alert" style={{ marginBottom: 12 }}>
          {errors._root}
        </div>
      )}

      <div className="form__footer">
        <div className="form__note">
          Replies within two business days. Nothing here goes into a CRM or a mailing list.
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
          {!submitting && <span className="arrow" />}
        </button>
      </div>
    </form>
  )
}

export function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <Reveal>
          <div className="eyebrow">06 — Let&rsquo;s talk</div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            A first conversation,<br />
            <em>at no charge.</em>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="lede">
            If something on this page sounded familiar, the next step is a conversation. Write a
            few sentences about what is going on. I&rsquo;ll read it before we talk.
          </p>
        </Reveal>

        <div className="contact-grid">
          <Reveal delay={1} className="contact__info">
            <div>
              <div className="info-row__label">By phone</div>
              <div className="info-row__value">
                <a href="tel:+18434257030">843-425-7030</a>
              </div>
              <div className="info-row__note">Leave a message and I&rsquo;ll return your call within a reasonable time — sometimes right away, sometimes a few hours, sometimes the next business day.</div>
            </div>
            <div>
              <div className="info-row__label">By email</div>
              <div className="info-row__value">
                <a href="mailto:hello@ridgelineknows.com">hello@ridgelineknows.com</a>
              </div>
              <div className="info-row__note">Replies within two business days.</div>
            </div>
            <div>
              <div className="info-row__label">Based in</div>
              <div className="info-row__value">Myrtle Beach, SC</div>
              <div className="info-row__note">
                Serving the Lowcountry to Myrtle Beach and beyond — and clients across the country.
              </div>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
