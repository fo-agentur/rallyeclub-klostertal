'use client'

import { useEffect, useRef } from 'react'

const TITLE = 'RALLYECLUB KLOSTERTAL'

export function HeroTitleSplit() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.textContent = ''
    for (const ch of TITLE) {
      const span = document.createElement('span')
      if (ch === ' ') {
        span.className = 'inline-block w-[0.35em]'
        span.textContent = '\u00a0'
      } else {
        span.className = 'inline-block'
        span.textContent = ch
      }
      node.appendChild(span)
    }
  }, [])

  return <span id="hero-split" ref={ref} className="inline-block" />
}
