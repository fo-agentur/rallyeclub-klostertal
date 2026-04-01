'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export function LenisRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis()
    document.documentElement.classList.add('lenis', 'lenis-smooth')
    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    function onClick(e: MouseEvent) {
      const t = (e.target as HTMLElement).closest('a[data-lenis-scroll]')
      if (!t) return
      const href = t.getAttribute('href')
      if (!href?.startsWith('#')) return
      const el = document.querySelector(href)
      if (el) {
        e.preventDefault()
        lenis.scrollTo(el as HTMLElement, { offset: -80, lerp: 0.12 })
      }
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('click', onClick)
      lenis.destroy()
      document.documentElement.classList.remove('lenis', 'lenis-smooth')
    }
  }, [])

  return <>{children}</>
}
