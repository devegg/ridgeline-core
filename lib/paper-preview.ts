// Derives index-card preview text from a paper's markdown: the first real
// paragraph (headings, the italic disclosure line, and bullets skipped).

export function paperExcerpt(md: string, max = 230): string {
  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('#')) continue
    if (line.startsWith('*') && line.endsWith('*')) continue
    if (line.startsWith('-')) continue
    const text = line.replace(/\*\*/g, '')
    if (text.length <= max) return text
    const cut = text.slice(0, max)
    return cut.slice(0, cut.lastIndexOf(' ')) + ' …'
  }
  return ''
}

export function paperMinutes(md: string): number {
  const words = md.split(/\s+/).length
  return Math.max(2, Math.round(words / 220))
}
