"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  /** Final numeric value */
  to: number;
  /** Duration in ms */
  duration?: number;
  /** Suffix appended (e.g. "+" or "%") */
  suffix?: string;
  /** Prefix prepended */
  prefix?: string;
  /** Fallback string for non-numeric values like "VBG" — rendered as-is, no animation */
  staticText?: string;
  className?: string;
};

export function CountUp({
  to,
  duration = 1400,
  suffix = "",
  prefix = "",
  staticText,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || staticText) return;
    if (typeof IntersectionObserver === "undefined") {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            setStarted(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [staticText, started, to]);

  useEffect(() => {
    if (!started || staticText) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration, staticText]);

  if (staticText) {
    return <span ref={ref} className={className}>{staticText}</span>;
  }
  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toLocaleString("de-DE")}
      {suffix}
    </span>
  );
}
