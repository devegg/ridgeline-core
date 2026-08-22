/**
 * Returns the URL if it parses and its scheme is http(s); otherwise null.
 * Guard every anchor whose href comes from user-writable data — the leads
 * table accepts unauthenticated inserts, and React does not sanitize hrefs
 * (a stored `javascript:` link would run in the owner's session on click).
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? raw : null
  } catch {
    return null
  }
}

/**
 * Normalizes a URL captured from a business card into something the
 * `leads_website_http` CHECK will accept. Card OCR yields bare domains
 * ("acme.com", "www.acme.com") far more often than full URLs, and `leads`
 * requires an http(s) scheme while `prospects` does not — without this,
 * promoting a scanned prospect would fail the whole insert on a perfectly
 * good website. Returns null when there is nothing usable, so a bad guess
 * costs the URL and never the promotion.
 */
export function toHttpUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
  return safeHttpUrl(candidate)
}
