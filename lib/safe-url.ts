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
