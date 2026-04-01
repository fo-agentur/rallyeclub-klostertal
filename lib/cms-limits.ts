import type { SiteContent } from '@/lib/schemas/site-content'
import type { TermineItem } from '@/lib/schemas/termine'

/**
 * Hard caps for CMS content and uploads — keeps Firebase Storage / Firestore usage
 * in a small-club range (free-tier friendly). Adjust only with care (storage.rules must match maxImageBytes).
 */
export const CMS_LIMITS = {
  /** Must be <= storage.rules request.resource.size */
  maxImageBytes: 2 * 1024 * 1024,
  maxHeroSlides: 5,
  maxTeamMembers: 10,
  maxClubStripImages: 12,
  maxGalleryImages: 24,
  maxHighlightCards: 12,
  maxTermineDocuments: 35,
} as const

export function formatMaxImageSizeLabel(): string {
  return `${Math.round(CMS_LIMITS.maxImageBytes / (1024 * 1024))} MB`
}

/** Client-side check before Storage upload. Returns German error message or null if OK. */
export function assertImageUploadAllowed(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Nur Bilder (image/*) dürfen hochgeladen werden.'
  }
  if (file.size > CMS_LIMITS.maxImageBytes) {
    return `Datei zu groß — maximal ${formatMaxImageSizeLabel()} pro Bild (Speicherlimit).`
  }
  return null
}

/** Validates full site document before Firestore write (admin). */
export function validateSiteContentLimits(site: SiteContent): string | null {
  if (site.heroSlides.length > CMS_LIMITS.maxHeroSlides) {
    return `Zu viele Hero-Slides (max. ${CMS_LIMITS.maxHeroSlides}).`
  }
  if (site.teamMembers.length > CMS_LIMITS.maxTeamMembers) {
    return `Zu viele Team-Einträge (max. ${CMS_LIMITS.maxTeamMembers}).`
  }
  if (site.clubStripImages.length > CMS_LIMITS.maxClubStripImages) {
    return `Zu viele Club-Streifen-Bilder (max. ${CMS_LIMITS.maxClubStripImages}).`
  }
  if (site.galleryImages.length > CMS_LIMITS.maxGalleryImages) {
    return `Zu viele Galerie-Bilder (max. ${CMS_LIMITS.maxGalleryImages}).`
  }
  if (site.highlights.length > CMS_LIMITS.maxHighlightCards) {
    return `Zu viele Highlights (max. ${CMS_LIMITS.maxHighlightCards}).`
  }
  return null
}

/** Trims oversized arrays from Firestore so the public site never renders huge payloads. */
export function clampSiteContentForPublic(site: SiteContent): SiteContent {
  return {
    ...site,
    heroSlides: site.heroSlides.slice(0, CMS_LIMITS.maxHeroSlides),
    teamMembers: site.teamMembers.slice(0, CMS_LIMITS.maxTeamMembers),
    clubStripImages: site.clubStripImages.slice(0, CMS_LIMITS.maxClubStripImages),
    highlights: site.highlights.slice(0, CMS_LIMITS.maxHighlightCards),
    galleryImages: site.galleryImages.slice(0, CMS_LIMITS.maxGalleryImages),
  }
}

export function clampTermineForPublic(termine: TermineItem[]): TermineItem[] {
  return termine.slice(0, CMS_LIMITS.maxTermineDocuments)
}
