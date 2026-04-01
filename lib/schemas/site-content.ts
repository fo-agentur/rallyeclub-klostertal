import { z } from 'zod'

export const heroSlideSchema = z.object({
  imageSrc: z.string().min(1),
  alt: z.string().optional(),
})

export const socialLinksSchema = z.object({
  facebookUrl: z.string().min(1),
  instagramUrl: z.string(),
  youtubeUrl: z.string(),
  heroFacebookButtonLabel: z.string().optional(),
})

export const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  imageSrc: z.string().min(1),
  facebookUrl: z.string().optional(),
})

export const highlightCardSchema = z.object({
  variant: z.enum(['feature', 'default']),
  imageSrc: z.string(),
  alt: z.string(),
  tag: z.string(),
  title: z.string(),
  description: z.string(),
  eyebrow: z.string().optional(),
})

export const imageRefSchema = z.object({
  src: z.string(),
  alt: z.string(),
})

export const termineOverviewCardSchema = z.object({
  windowLabel: z.string(),
  windowValue: z.string(),
  title: z.string(),
  subtitle: z.string(),
  badge: z.string(),
  badgeTone: z.enum(['accent', 'muted']),
})

export const siteContentSchema = z.object({
  heroTagline: z.string(),
  heroSlides: z.array(heroSlideSchema).min(1),
  social: socialLinksSchema,
  teamMembers: z.array(teamMemberSchema),
  clubStripImages: z.array(imageRefSchema),
  highlights: z.array(highlightCardSchema),
  galleryImages: z.array(imageRefSchema),
  contactEmail: z.string().email(),
  mapSearchUrl: z.string(),
  galleryFacebookTeaser: z.string().optional(),
  termineIntro: z.string(),
  seasonLabel: z.string(),
  termineOverviewCards: z.array(termineOverviewCardSchema),
})

export type SiteContent = z.infer<typeof siteContentSchema>
export type HeroSlide = z.infer<typeof heroSlideSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>
export type HighlightCard = z.infer<typeof highlightCardSchema>
export type TermineOverviewCard = z.infer<typeof termineOverviewCardSchema>
