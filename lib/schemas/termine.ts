import { z } from 'zod'

export const termineItemSchema = z.object({
  title: z.string().min(1).max(200),
  dateStr: z.string().max(120),
  location: z.string().max(200),
  category: z.string().max(80).optional(),
  description: z.string().max(2000).optional(),
  /** ISO date yyyy-mm-dd for calendar cell placement */
  calendarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortOrder: z.number().int().optional(),
})

export type TermineItem = z.infer<typeof termineItemSchema> & { id: string }
