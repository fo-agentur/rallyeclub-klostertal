'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { UberUnsSection } from '@/components/sections/UberUnsSection'
import { TeamSection } from '@/components/sections/TeamSection'
import { TermineSection } from '@/components/sections/TermineSection'
import { HighlightsSection } from '@/components/sections/HighlightsSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { MitmachenSection } from '@/components/sections/MitmachenSection'
import { KontaktSection } from '@/components/sections/KontaktSection'
import { ImpressumSection } from '@/components/sections/ImpressumSection'
import { SiteFooter } from '@/components/layout/SiteFooter'
import type { SiteContent } from '@/lib/schemas/site-content'
import type { TermineItem } from '@/lib/schemas/termine'

interface AdminSitePreviewProps {
  site: SiteContent
  termine: TermineItem[]
}

/**
 * Renders the same sections as the public homepage with draft CMS data (no JSON, no code).
 * Pointer events disabled so anchor links do not navigate away from the admin route.
 */
export function AdminSitePreview({ site, termine }: AdminSitePreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-rally-orange/50 bg-rally-bg shadow-[0_0_48px_-12px_rgba(249,115,22,0.45)]">
      <div className="bg-gradient-to-r from-rally-orange via-orange-500 to-red-600 px-4 py-3 text-center">
        <p className="text-sm font-bold text-black">Website-Vorschau</p>
        <p className="mt-0.5 text-xs font-medium text-black/80">
          So sieht die Seite mit deinem aktuellen Entwurf aus — erst nach „Speichern“ ist es online.
        </p>
      </div>
      <div className="max-h-[min(82vh,1500px)] overflow-x-hidden overflow-y-auto overscroll-contain bg-rally-bg">
        <div
          className="pointer-events-none select-none [&_a]:cursor-default"
          aria-label="Vorschau der Website (Klicks deaktiviert)"
        >
          <main id="admin-preview-main">
            <HeroSection site={site} />
            <UberUnsSection site={site} />
            <TeamSection site={site} />
            <TermineSection site={site} termine={termine} />
            <HighlightsSection site={site} />
            <GallerySection site={site} />
            <MitmachenSection />
            <KontaktSection site={site} />
            <ImpressumSection site={site} />
          </main>
          <SiteFooter facebookUrl={site.social.facebookUrl} />
        </div>
      </div>
    </div>
  )
}
