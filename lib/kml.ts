/**
 * Minimal KML reader for Google My Maps exports ("Export to KML" with the
 * "Export as KML instead of KMZ" box checked). My Maps writes one <Folder>
 * per layer and one <Placemark> per pin; this extracts exactly what the
 * prospects import needs and nothing more. Not a general KML parser.
 */

export interface KmlPlacemark {
  name: string
  layer: string | null
  address: string | null
  lat: number | null
  lng: number | null
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))
  return m ? decode(m[1]) : null
}

export function parseKml(xml: string, cap = 2000): KmlPlacemark[] {
  const out: KmlPlacemark[] = []

  // Walk folders so each placemark knows its layer; placemarks outside any
  // folder (single-layer exports) get layer = null.
  const folderRe = /<Folder>([\s\S]*?)<\/Folder>/g
  const placemarkRe = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g

  const collect = (chunk: string, layer: string | null) => {
    for (const pm of chunk.matchAll(placemarkRe)) {
      if (out.length >= cap) return
      const block = pm[1]
      const name = tag(block, 'name')
      if (!name) continue
      const coords = tag(block, 'coordinates')
      let lat: number | null = null
      let lng: number | null = null
      if (coords) {
        const [lngRaw, latRaw] = coords.split(',')
        const lngNum = Number(lngRaw)
        const latNum = Number(latRaw)
        if (Number.isFinite(lngNum) && Number.isFinite(latNum)) {
          lng = lngNum
          lat = latNum
        }
      }
      out.push({ name, layer, address: tag(block, 'address'), lat, lng })
    }
  }

  let foundFolder = false
  let stripped = xml
  for (const f of xml.matchAll(folderRe)) {
    foundFolder = true
    collect(f[1], tag(f[1], 'name'))
    stripped = stripped.replace(f[0], '')
  }
  // Placemarks not inside any folder (or no folders at all).
  collect(foundFolder ? stripped : xml, null)

  return out
}
