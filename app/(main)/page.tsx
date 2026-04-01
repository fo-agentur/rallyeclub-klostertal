import { getPublicSiteData } from '@/lib/get-public-site-data'
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

export default async function HomePage() {
  const { site, termine } = await getPublicSiteData()

  return (
    <>
      <main id="main">
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
    </>
  )
}
