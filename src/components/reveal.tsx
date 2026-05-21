"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms */
  delay?: number;
  /** Animation variant */
  variant?: "up" | "fade" | "left" | "right" | "scale";
  /** If true, re-runs the animation when leaving and re-entering */
  once?: boolean;
  as?: React.ElementType;
};

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  once = true,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const Comp = Tag;

  return (
    <Comp
      ref={ref as never}
      data-reveal={variant}
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: visible && delay ? `${delay}ms` : undefined }}
      className={cn("reveal-base", className)}
    >
      {children}
    </Comp>
  );
}
