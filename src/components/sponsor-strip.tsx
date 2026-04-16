import { SPONSOR_ENTRIES } from "@/config/sponsors";
import { cn } from "@/lib/utils";

interface SponsorStripProps {
  /** Tighter row for footer */
  compact?: boolean;
  /** Footer (dark) vs home section (light) */
  variant?: "light" | "dark";
}

export function SponsorStrip({ compact, variant = "light" }: SponsorStripProps) {
  const card = cn(
    "flex min-h-[4rem] min-w-[10rem] flex-col items-center justify-center px-5 py-3 text-center transition",
    variant === "dark"
      ? "border border-white/15 bg-white/5 hover:border-racing/50"
      : "border border-neutral-200 bg-white shadow-sm hover:border-racing/40"
  );
  const tag = variant === "dark" ? "text-neutral-500" : "text-neutral-500";
  const title = variant === "dark" ? "text-white" : "text-ink";

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-6"
          : "flex flex-wrap items-center justify-center gap-10 md:gap-16"
      }
    >
      {SPONSOR_ENTRIES.map((s) => (
        <div key={s.id} className={card}>
          <span className={cn("text-[10px] font-semibold uppercase tracking-widest", tag)}>
            {s.tagline}
          </span>
          <span className={cn("mt-1 font-display text-base tracking-wider md:text-lg", title)}>
            {s.name}
          </span>
        </div>
      ))}
    </div>
  );
}
