import { LenisRoot } from '@/components/client/LenisRoot'
import { CustomCursor } from '@/components/client/CustomCursor'
import { GsapHomeEffects } from '@/components/client/GsapHomeEffects'
import { SiteHeader } from '@/components/layout/SiteHeader'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisRoot>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-lg focus:bg-rally-accent focus:px-4 focus:py-3 focus:text-white focus:outline-none"
      >
        Zum Inhalt springen
      </a>
      <CustomCursor />
      <GsapHomeEffects />
      <SiteHeader />
      {children}
    </LenisRoot>
  )
}
