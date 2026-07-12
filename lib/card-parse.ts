/**
 * Heuristic field extraction from business-card OCR text. OCR is imperfect
 * and cards are chaos, so every guess lands in an EDITABLE form — a human
 * confirms before anything is saved. Guesses beat blank fields; they never
 * beat the person holding the card.
 */

export interface CardGuess {
  contact_name: string
  business_name: string
  email: string
  phone: string
  website: string
  raw: string
}

const COMPANY_HINTS = /\b(llc|inc|realty|group|services?|company|co\.|corp|plumbing|hvac|heating|cooling|roofing|dental|insurance|properties|rentals?|management|construction|contracting|electric(al)?)\b/i

export function parseCardText(raw: string): CardGuess {
  const text = raw.replace(/\r/g, '')
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1)

  const email = text.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/)?.[0]?.toLowerCase() ?? ''

  const phone = text.match(/(\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/)?.[0] ?? ''

  // A web address — sharing the email's domain is fine; a match that is just
  // the tail of the email address itself is not. The email's position in the
  // text tells the two apart.
  let website = ''
  const emailStart = email ? text.toLowerCase().indexOf(email) : -1
  const emailEnd = emailStart === -1 ? -1 : emailStart + email.length
  for (const m of text.matchAll(/(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|biz|co|us|io|realty|homes)\b[^\s]*/gi)) {
    const idx = m.index ?? -1
    if (m[0].includes('@')) continue
    if (emailStart !== -1 && idx >= emailStart && idx < emailEnd) continue // inside the email
    website = m[0].toLowerCase()
    break
  }

  // Company: the line with a business word in it; else the SHOUTIEST line.
  let business_name = lines.find(l => COMPANY_HINTS.test(l) && !l.includes('@')) ?? ''
  if (!business_name) {
    business_name = lines.find(l => l.length > 3 && l === l.toUpperCase() && /[A-Z]/.test(l) && !/\d/.test(l)) ?? ''
  }

  // Person: first line that looks like a two-or-three word name — letters
  // only, mixed case, no business words, not the company line.
  const contact_name =
    lines.find(l => {
      if (l === business_name || COMPANY_HINTS.test(l)) return false
      if (/[\d@/]/.test(l)) return false
      const words = l.split(/\s+/)
      return words.length >= 2 && words.length <= 4 && words.every(w => /^[A-Za-z.'-]+$/.test(w))
    }) ?? ''

  return { contact_name, business_name, email, phone, website, raw: text.trim() }
}
