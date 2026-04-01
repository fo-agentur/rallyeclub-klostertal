import Image from 'next/image'
import type { SiteContent } from '@/lib/schemas/site-content'

export function GallerySection({ site }: { site: SiteContent }) {
  const fb = site.social.facebookUrl

  return (
    <section id="medien" className="relative scroll-mt-20 border-t border-white/10 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="headline-medien" className="font-display clip-reveal text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Impressionen
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-rally-muted">
          Ein Blick auf unsere Momente am Limit — plus ergänzende Stimmungsbilder. Noch mehr aktuelle Fotos und News gibt es auf{' '}
          <a
            className="font-medium text-rally-orange underline decoration-rally-orange/40 underline-offset-4 hover:text-white"
            href={fb}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          .
        </p>
        <div id="masonry-grid" className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {site.galleryImages.map((img, i) => (
            <figure key={`${img.src}-${i}`} className="gallery-item mb-4 break-inside-avoid overflow-hidden rounded-xl border border-white/10">
              <div className="group relative">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={800}
                  height={600}
                  className="w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-rally-accent/0 transition duration-300 group-hover:bg-rally-accent/25" />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
