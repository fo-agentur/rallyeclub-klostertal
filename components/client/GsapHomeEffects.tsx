'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Port of key motion from legacy index.html (hero slideshow, headline clip-reveals, termine cards focus).
 */
export function GsapHomeEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cleanups: (() => void)[] = []

    const heroSlideEls = document.querySelectorAll<HTMLElement>('.hero-slide')
    if (heroSlideEls.length > 1) {
      let slideIdx = 0
      const id = window.setInterval(() => {
        const next = (slideIdx + 1) % heroSlideEls.length
        const cur = heroSlideEls[slideIdx]
        const n = heroSlideEls[next]
        gsap.killTweensOf([cur, n])
        gsap.to(cur, { opacity: 0, duration: 1.35, ease: 'power2.inOut' })
        gsap.to(n, {
          opacity: 1,
          duration: 1.35,
          ease: 'power2.inOut',
          onStart: () => {
            n.style.zIndex = '2'
            cur.style.zIndex = '1'
          },
        })
        slideIdx = next
      }, 7500)
      cleanups.push(() => clearInterval(id))
    }

    const splitContainer = document.getElementById('hero-split')
    if (splitContainer?.children.length) {
      gsap.from(splitContainer.children, {
        y: 80,
        opacity: 0,
        duration: 0.85,
        stagger: 0.03,
        ease: 'power3.out',
        delay: 0.15,
        onComplete: () => {
          Array.from(splitContainer.children).forEach((c) => {
            ;(c as HTMLElement).style.willChange = 'auto'
          })
        },
      })
    }

    const sub = document.getElementById('hero-sub')
    if (sub) {
      gsap.fromTo(
        sub,
        { filter: 'blur(12px)', opacity: 0.2 },
        { filter: 'blur(0px)', opacity: 1, duration: 1.1, delay: 0.5, ease: 'power2.out' }
      )
    }

    const heroInner = document.querySelector('.hero-inner')
    const heroSlides = document.getElementById('hero-slides')
    const scrollInd = document.querySelector('.scroll-indicator')
    const isMobile = window.matchMedia('(max-width: 767px)').matches

    if (heroInner && !isMobile) {
      gsap.to(heroInner, {
        y: -120,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
      })
    }
    if (heroSlides) {
      gsap.to(heroSlides, {
        opacity: 0.35,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
      })
    }
    if (scrollInd) {
      gsap.to(scrollInd, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: '30% top', scrub: true },
      })
    }

    function clipReveal(selector: string) {
      const el = document.querySelector(selector)
      if (!el) return
      gsap.fromTo(
        el,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          onComplete: () => {
            ;(el as HTMLElement).style.willChange = 'auto'
          },
        }
      )
      ;(el as HTMLElement).style.willChange = 'clip-path'
    }
    ;[
      '#headline-ueber',
      '#headline-team',
      '#headline-termine',
      '#headline-events',
      '#headline-medien',
      '#headline-mitmachen',
      '#headline-kontakt',
    ].forEach(clipReveal)

    document.querySelectorAll<HTMLElement>('[data-termine-card]').forEach((card) => {
      card.style.willChange = 'transform'
      const st = ScrollTrigger.create({
        trigger: card,
        start: 'top 52%',
        end: 'bottom 48%',
        onToggle: (self) => {
          card.classList.toggle('is-scroll-focus', self.isActive)
        },
      })
      cleanups.push(() => st.kill())
    })

    gsap.fromTo(
      '[data-termine-card]',
      { y: 56, opacity: 0, rotationX: 8 },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        transformPerspective: 1200,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#termine-track', start: 'top 82%', once: true },
        onComplete: () => {
          document.querySelectorAll('[data-termine-card]').forEach((c) => {
            ;(c as HTMLElement).style.willChange = 'auto'
          })
        },
      }
    )

    const lineProgress = document.getElementById('termine-line-progress')
    const termineTrack = document.getElementById('termine-track')
    if (lineProgress && termineTrack) {
      gsap.fromTo(
        lineProgress,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'center top',
          scrollTrigger: {
            trigger: termineTrack,
            start: 'top 72%',
            end: 'bottom 38%',
            scrub: 0.45,
          },
        }
      )
    }

    document.querySelectorAll<HTMLElement>('[data-highlight-tilt]').forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        el.style.setProperty('--tilt-x', `${y * -6}deg`)
        el.style.setProperty('--tilt-y', `${x * 6}deg`)
      }
      const leave = () => {
        el.style.setProperty('--tilt-x', '0deg')
        el.style.setProperty('--tilt-y', '0deg')
      }
      el.addEventListener('mousemove', move)
      el.addEventListener('mouseleave', leave)
      cleanups.push(() => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
      })
    })

    return () => {
      cleanups.forEach((c) => c())
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return null
}
