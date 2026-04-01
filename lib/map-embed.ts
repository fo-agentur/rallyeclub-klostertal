/** Build Google Maps embed URL from a Maps search URL or fallback query */
export function mapEmbedSrcFromSearchUrl(mapSearchUrl: string): string {
  try {
    const u = new URL(mapSearchUrl)
    const q = u.searchParams.get('query') ?? u.searchParams.get('q')
    const query = q && q.length > 0 ? q : 'Klostertal, Vorarlberg, Österreich'
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=de&z=11&output=embed`
  } catch {
    return 'https://www.google.com/maps?q=Klostertal%2C+Vorarlberg%2C+%C3%96sterreich&hl=de&z=11&output=embed'
  }
}
