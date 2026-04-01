import { siteContentSchema, type SiteContent } from '@/lib/schemas/site-content'

const FB = 'https://www.facebook.com/132632750148150'

/** Fallback when Firestore has no document or server has no Admin credentials */
export const defaultSiteContentRaw = {
  heroTagline: 'Motorsport · Leidenschaft · Klostertal',
  heroSlides: [
    { imageSrc: '/images/headers/hero-hq-1.png', alt: 'Rallyeclub Klostertal — Impression' },
    { imageSrc: '/images/headers/hero-hq-2.png', alt: 'Rallyeclub Klostertal — Impression' },
    { imageSrc: '/images/headers/hero-hq-3.png', alt: 'Rallyeclub Klostertal — Impression' },
  ],
  social: {
    facebookUrl: FB,
    instagramUrl: '',
    youtubeUrl: '',
    heroFacebookButtonLabel: 'Fotos & News auf Facebook',
  },
  teamMembers: [
    { id: '1', name: 'Christoph Schuler', role: 'Obmann', imageSrc: '/images/team/christoph-schuler.jpg', facebookUrl: FB },
    { id: '2', name: 'Christian Breuss', role: 'Vizeobmann', imageSrc: '/images/team/christian-breuss.jpg', facebookUrl: FB },
    { id: '3', name: 'Martina Zögernitz', role: 'Schriftführerin & Kassierin', imageSrc: '/images/team/martina-zoegernitz.jpg', facebookUrl: FB },
    { id: '4', name: 'Manuel Schuler', role: 'Vorstand', imageSrc: '/images/team/manuel-schuler.jpg', facebookUrl: FB },
    { id: '5', name: 'Herbert Schuler', role: 'Vorstand', imageSrc: '/images/team/herbert-schuler.jpg', facebookUrl: FB },
    { id: '6', name: 'Alex Schmöllerl', role: 'Fahrervertreter', imageSrc: '/images/team/alex-schmoellerl-placeholder.jpg', facebookUrl: FB },
  ],
  clubStripImages: [
    { src: '/images/gallery/IMG-20150410-WA0001.jpg', alt: 'Autoslalom Röthis — Vereinsimpression' },
    { src: '/images/Autoslalom.jpg', alt: 'Autoslalom St. Gallenkirch' },
    { src: '/images/gallery/IMG-20150410-WA0000.jpg', alt: 'Autoslalom Röthis — Fahrzeug' },
    { src: '/images/Vorankuendigung.jpg', alt: 'Slalom Vorankündigung' },
    { src: '/images/headers/3.png', alt: 'Gala und Vereinsleben' },
    { src: '/images/Bericht-Kartfahren-Bild.png', alt: 'Kartfahren Event' },
  ],
  highlights: [
    {
      variant: 'feature' as const,
      imageSrc: '/images/headers/1.png',
      alt: 'Autoslalom St. Gallenkirch — Fahrzeug in der Kurve',
      tag: 'Slalom',
      eyebrow: 'Signature Event',
      title: 'Autoslalom St. Gallenkirch',
      description:
        'Pylonen, Präzision, Publikum — unser klassisches Heimspiel im Klostertal.',
    },
    {
      variant: 'default' as const,
      imageSrc: '/images/headers/2.png',
      alt: 'Bergrennen — Rallye in alpinem Gelände',
      tag: 'Berg',
      title: 'Bergrennen',
      description: 'Höhenmeter, Adrenalin, Ansehen.',
    },
    {
      variant: 'default' as const,
      imageSrc: '/images/headers/3.png',
      alt: 'Gala — Vereinsabend',
      tag: 'Gala',
      title: 'Gala & Ehrungen',
      description: 'Gemeinschaft jenseits der Stoppuhr.',
    },
  ],
  galleryImages: [
    { src: '/images/gallery/IMG-20150410-WA0001.jpg', alt: 'Slalom Impression' },
    { src: '/images/Autoslalom.jpg', alt: 'Autoslalom' },
    { src: '/images/gallery/IMG-20150410-WA0000.jpg', alt: 'Fahrzeug in der Kurve' },
    { src: '/images/Vorankuendigung.jpg', alt: 'Vorankündigung' },
    { src: '/images/headers/1.png', alt: 'Header Motiv 1' },
    { src: '/images/headers/2.png', alt: 'Header Motiv 2' },
    { src: '/images/headers/3.png', alt: 'Header Motiv 3' },
    { src: '/images/Bericht-Kartfahren-Bild.png', alt: 'Kartfahren' },
  ],
  contactEmail: 'info@rallyeclub-klostertal.at',
  mapSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=Klostertal%2C+Vorarlberg%2C+%C3%96sterreich',
  galleryFacebookTeaser: FB,
  termineIntro:
    'Saisonale Highlights und feste Vereinstermine — Aktualisierungen durch das Vorstandsteam.',
  seasonLabel: 'Saison 2026',
  termineOverviewCards: [
    {
      windowLabel: 'Zeitfenster',
      windowValue: 'Frühjahr 2026',
      title: 'Autoslalom',
      subtitle: 'St. Gallenkirch',
      badge: 'Slalom',
      badgeTone: 'accent' as const,
    },
    {
      windowLabel: 'Zeitfenster',
      windowValue: 'Sommer 2026',
      title: 'Club-Event',
      subtitle: 'Ort folgt',
      badge: 'Club',
      badgeTone: 'muted' as const,
    },
    {
      windowLabel: 'Zeitfenster',
      windowValue: 'Herbst 2026',
      title: 'Gala & Ehrungen',
      subtitle: 'Details folgen',
      badge: 'Gala',
      badgeTone: 'muted' as const,
    },
  ],
} satisfies SiteContent

export const defaultSiteContent: SiteContent = siteContentSchema.parse(defaultSiteContentRaw)
