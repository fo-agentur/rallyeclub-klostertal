import { unstable_cache } from 'next/cache'
import { getFirestore } from 'firebase-admin/firestore'
import { clampSiteContentForPublic, clampTermineForPublic } from '@/lib/cms-limits'
import { defaultSiteContent } from '@/lib/default-site-data'
import { defaultTermine } from '@/lib/default-termine'
import { getFirebaseAdminApp } from '@/lib/firebase/admin-app'
import { siteContentSchema } from '@/lib/schemas/site-content'
import { termineItemSchema, type TermineItem } from '@/lib/schemas/termine'

export type PublicSiteData = {
  site: typeof defaultSiteContent
  termine: TermineItem[]
}

async function loadSiteUncached(): Promise<PublicSiteData> {
  const adminApp = getFirebaseAdminApp()
  if (!adminApp) {
    return { site: defaultSiteContent, termine: defaultTermine }
  }
  const db = getFirestore(adminApp)
  let site = defaultSiteContent
  try {
    const snap = await db.doc('site/content').get()
    if (snap.exists) {
      const parsed = siteContentSchema.safeParse(snap.data())
      if (parsed.success) {
        site = clampSiteContentForPublic(parsed.data)
      }
    }
  } catch {
    site = defaultSiteContent
  }

  let termine: TermineItem[] = defaultTermine
  try {
    const qs = await db.collection('termine').get()
    if (!qs.empty) {
      const rows: TermineItem[] = []
      qs.docs.forEach((d) => {
        const body = termineItemSchema.safeParse(d.data())
        if (body.success) {
          rows.push({ ...body.data, id: d.id })
        }
      })
      rows.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
      termine = rows.length > 0 ? clampTermineForPublic(rows) : defaultTermine
    }
  } catch {
    termine = defaultTermine
  }

  return { site, termine }
}

export const getPublicSiteData = unstable_cache(loadSiteUncached, ['public-site-data'], {
  revalidate: 60,
  tags: ['site-content'],
})
