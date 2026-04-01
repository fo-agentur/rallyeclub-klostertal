'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import type { SiteContent } from '@/lib/schemas/site-content'

export function TeamSection({ site }: { site: SiteContent }) {
  const { teamMembers, social } = site
  const [activeId, setActiveId] = useState<string | null>(null)

  const setActive = useCallback((id: string | null) => {
    setActiveId(id)
  }, [])

  const photoLayout = [
    ['1', '4'],
    ['2', '5'],
    ['3', '6'],
  ] as const

  return (
    <section id="team" className="relative scroll-mt-20 border-t border-white/10 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-rally-orange/90">Vorstand</p>
            <h2 id="headline-team" className="font-display clip-reveal mt-2 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Team
            </h2>
          </div>
        </header>

        <div
          id="team-showcase"
          className={`team-showcase mx-auto mt-12 flex w-full max-w-5xl flex-col items-start gap-8 px-0 py-4 font-sans md:mt-14 md:flex-row md:gap-10 lg:gap-14 ${activeId ? 'team-showcase--hover' : ''}`}
          data-team-showcase
        >
          <div className="team-showcase__photos flex touch-pan-x gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] md:gap-3 md:pb-0">
            {photoLayout.map((col, colIdx) => (
              <div
                key={colIdx}
                className={
                  colIdx === 1
                    ? 'mt-[48px] flex flex-col gap-2 sm:mt-[56px] md:mt-[68px] md:gap-3'
                    : colIdx === 2
                      ? 'mt-[22px] flex flex-col gap-2 sm:mt-[26px] md:mt-[32px] md:gap-3'
                      : 'flex flex-col gap-2 md:gap-3'
                }
              >
                {col.map((id) => {
                  const m = teamMembers.find((x) => x.id === id)
                  if (!m) return null
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`team-photo-card team-photo-card--photo ${colIdx === 0 ? 'h-[120px] w-[110px] sm:h-[140px] sm:w-[130px] md:h-[165px] md:w-[155px]' : colIdx === 1 ? 'h-[132px] w-[122px] sm:h-[155px] sm:w-[145px] md:h-[182px] md:w-[172px]' : 'h-[125px] w-[115px] sm:h-[146px] sm:w-[136px] md:h-[172px] md:w-[162px]'}`}
                      data-team-id={id}
                      aria-label={`${m.name}, ${m.role}`}
                      onMouseEnter={() => setActive(id)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(id)}
                      onBlur={(e) => {
                        if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setActive(null)
                      }}
                    >
                      <Image
                        className="team-photo-card__img"
                        src={m.imageSrc}
                        alt=""
                        width={165}
                        height={293}
                        loading="lazy"
                      />
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex w-full flex-1 flex-col gap-4 pt-0 sm:grid sm:grid-cols-2 md:flex md:flex-col md:gap-5 md:pt-2">
            {teamMembers.map((m) => (
              <div
                key={m.id}
                className={`team-member-row ${activeId === m.id ? 'is-active' : ''}`}
                data-team-id={m.id}
                tabIndex={0}
                role="button"
                onMouseEnter={() => setActive(m.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(m.id)}
                onBlur={(e) => {
                  if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setActive(null)
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="team-row-indicator" aria-hidden />
                  <span className="team-member-name md:text-[18px]">{m.name}</span>
                  <div className="team-social">
                    <a
                      href={m.facebookUrl ?? social.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook Rallyeclub Klostertal"
                      className="inline-flex"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-1.9v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  </div>
                </div>
                <p className="team-member-role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
