'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'

const nav = [
  { href: '#ueber-uns', label: 'Club' },
  { href: '#team', label: 'Team' },
  { href: '#termine', label: 'Termine' },
  { href: '#events', label: 'Highlights' },
  { href: '#medien', label: 'Galerie' },
  { href: '#kontakt', label: 'Kontakt' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  return (
    <header
      id="site-header"
      className="nav-glass fixed left-0 right-0 top-0 z-[900] overflow-visible border-b border-transparent pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 py-3 sm:gap-4">
        <a href="#hero" className="flex min-h-[44px] min-w-[44px] items-center" data-lenis-scroll onClick={close}>
          <Image
            src="/images/schriftzug_transparent_kl.png"
            alt="Rallyeclub Klostertal Logo"
            width={200}
            height={40}
            className="h-9 w-auto max-w-[200px] object-contain sm:h-10"
            priority
          />
        </a>
        <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Hauptnavigation">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-lenis-scroll
              className="min-h-[44px] min-w-[44px] px-2 py-2 text-sm font-medium text-white/90 transition hover:text-rally-orange xl:px-3"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#mitmachen"
            data-lenis-scroll
            className="ml-1 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-rally-accent to-rally-orange px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rally-orange xl:ml-2 xl:px-5"
          >
            Mitglied werden
          </a>
        </nav>
        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Menü schließen' : 'Menü öffnen'}</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      <div
        id="mobile-menu"
        className={`absolute left-0 right-0 top-full z-[899] max-h-[min(75dvh,28rem)] overflow-y-auto overscroll-contain border-b border-white/10 glass lg:hidden ${
          open ? 'block' : 'hidden'
        }`}
        hidden={!open}
      >
        <nav className="flex flex-col gap-1 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]" aria-label="Mobile Navigation">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-lenis-scroll
              className="min-h-[44px] rounded-lg px-3 py-3 text-base font-medium text-white"
              onClick={close}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#mitmachen"
            data-lenis-scroll
            className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-rally-accent to-rally-orange px-5 py-3 text-center font-semibold text-white"
            onClick={close}
          >
            Mitglied werden
          </a>
        </nav>
      </div>
    </header>
  )
}
