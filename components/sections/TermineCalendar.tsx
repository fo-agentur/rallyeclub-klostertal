'use client'

import { useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { TermineItem } from '@/lib/schemas/termine'

type CalEvent = { month: number; day: number; title: string; sub: string; kind: string }

function categoryToKind(category?: string): string {
  const c = (category ?? '').toLowerCase()
  if (c.includes('slalom')) return 'slalom'
  if (c.includes('gala')) return 'gala'
  return 'club'
}

function termineToEvents(items: TermineItem[]): CalEvent[] {
  const out: CalEvent[] = []
  for (const t of items) {
    if (!t.calendarDate) continue
    const [y, mo, d] = t.calendarDate.split('-').map(Number)
    if (!y || !mo || !d) continue
    out.push({
      month: mo - 1,
      day: d,
      title: t.title,
      sub: `${t.category ?? 'Event'} · ${t.location}`,
      kind: categoryToKind(t.category),
    })
  }
  return out
}

export function TermineCalendar({ termine }: { termine: TermineItem[] }) {
  const [view, setView] = useState(() => new Date(2026, 2, 1))
  const events = termineToEvents(termine)
  const monthNames = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ]

  const renderGrid = useCallback(() => {
    const y = view.getFullYear()
    const m = view.getMonth()
    const first = new Date(y, m, 1)
    const startPad = (first.getDay() + 6) % 7
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const cells: React.ReactNode[] = []
    for (let i = 0; i < startPad; i++) {
      cells.push(
        <div key={`pad-${i}`} className="termine-cal-cell termine-cal-cell--muted" data-termine-cal aria-hidden />
      )
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const evList = events.filter((e) => e.month === m && e.day === day)
      const cls =
        evList.length > 0
          ? `termine-cal-cell termine-cal-cell--event termine-cal-cell--${evList[0].kind}`
          : 'termine-cal-cell'
      cells.push(
        <div key={day} className={cls} data-termine-cal role="gridcell">
          <span className="termine-cal-cell__num">{day}</span>
          {evList.length > 0 ? (
            <>
              <span className="termine-cal-cell__title">{evList[0].title}</span>
              <span className="termine-cal-cell__sub">{evList[0].sub}</span>
            </>
          ) : null}
        </div>
      )
    }
    return cells
  }, [view, events])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        gsap.from('#termine-kalender [data-termine-cal]', {
          opacity: 0,
          y: 12,
          stagger: 0.018,
          duration: 0.42,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#termine-kalender', start: 'top 88%', once: true },
        })
      })
    })
    return () => ctx.revert()
  }, [view])

  return (
    <div id="termine-kalender" className="termine-calendar scroll-mt-24 mt-20" tabIndex={-1}>
      <div className="termine-cal-nav">
        <div>
          <h3 className="font-display text-xl font-bold text-white sm:text-2xl">Kalenderansicht</h3>
          <p className="mt-1 max-w-xl text-sm text-rally-muted">
            Zeitfenster der Saison — Marker aus den Termin-Daten (Kalenderdatum), sobald hinterlegt.
          </p>
        </div>
        <div className="termine-cal-nav__btns">
          <button
            type="button"
            id="termine-cal-prev"
            className="termine-cal-nav__btn"
            aria-label="Vorheriger Monat"
            onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p id="termine-cal-label" className="termine-cal-nav__label">
            {monthNames[view.getMonth()]} {view.getFullYear()}
          </p>
          <button
            type="button"
            id="termine-cal-next"
            className="termine-cal-nav__btn"
            aria-label="Nächster Monat"
            onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div id="termine-cal-grid" className="min-h-[12rem]">
        <div className="termine-cal-grid__head" role="row">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
            <div key={d} className="termine-cal-grid__headcell">
              {d}
            </div>
          ))}
        </div>
        <div className="termine-cal-grid__cells" role="grid">
          {renderGrid()}
        </div>
      </div>
    </div>
  )
}
