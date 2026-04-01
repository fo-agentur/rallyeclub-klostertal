import type { TermineItem } from '@/lib/schemas/termine'

export const defaultTermine: TermineItem[] = [
  {
    id: 'default-1',
    title: 'Autoslalom',
    dateStr: 'Frühjahr 2026',
    location: 'St. Gallenkirch — Ausschreibung folgt',
    category: 'Slalom',
    description: 'Ausschreibung folgt',
    calendarDate: '2026-04-15',
    sortOrder: 1,
  },
  {
    id: 'default-2',
    title: 'Club-Event',
    dateStr: 'Sommer 2026',
    location: 'Termin wird bekanntgegeben',
    category: 'Club',
    description: '',
    calendarDate: '2026-07-10',
    sortOrder: 2,
  },
  {
    id: 'default-3',
    title: 'Gala & Ehrungen',
    dateStr: 'Herbst 2026',
    location: 'Details folgen',
    category: 'Gala',
    description: '',
    calendarDate: '2026-10-20',
    sortOrder: 3,
  },
]
