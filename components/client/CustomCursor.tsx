'use client'

import { useEffect } from 'react'

export function CustomCursor() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 1024px)').matches
    if (reduced || !desktop) return

    const el = document.getElementById('custom-cursor')
    if (!(el instanceof HTMLElement)) return
    const cursorEl = el

    document.body.classList.add('has-custom-cursor')
    cursorEl.classList.add('is-visible')

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let cx = mx
    let cy = my
    const lerp = 0.28

    function onMove(e: MouseEvent) {
      mx = e.clientX
      my = e.clientY
    }
    document.addEventListener('mousemove', onMove)

    let frame = 0
    function loop() {
      cx += (mx - cx) * lerp
      cy += (my - cy) * lerp
      cursorEl.style.left = `${cx}px`
      cursorEl.style.top = `${cy}px`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousemove', onMove)
      document.body.classList.remove('has-custom-cursor')
      cursorEl.classList.remove('is-visible')
    }
  }, [])

  return <div id="custom-cursor" className="cursor-dot hidden lg:block" aria-hidden />
}
