import Image from "next/image";
import { SPONSOR_ENTRIES } from "@/config/sponsors";
import { cn } from "@/lib/utils";

interface SponsorStripProps {
  sponsors?: SponsorEntry[];
  compact?: boolean;
  variant?: "light" | "dark";
  /** Render as auto-scrolling marquee */
  marquee?: boolean;
}

type SponsorEntry = {
  id: number | string;
  name: string;
  tagline?: string | null;
  website?: string | null;
  logo?: string | null;
};

export function SponsorStrip({
  sponsors,
  compact,
  variant = "light",
  marquee = false,
}: SponsorStripProps) {
  const entries: readonly SponsorEntry[] =
    sponsors && sponsors.length > 0 ? sponsors : SPONSOR_ENTRIES;

  const card = cn(
    "flex min-h-[4rem] min-w-[10rem] flex-col items-center justify-center px-5 py-3 text-center transition duration-300 hover:-translate-y-0.5",
    variant === "dark"
      ? "border border-white/15 bg-white/5 hover:border-racing/50"
      : "border border-neutral-200 bg-white shadow-sm hover:border-racing/40 hover:shadow-card",
  );
  const tag = "text-neutral-500";
  const title = variant === "dark" ? "text-white" : "text-ink";

  const renderItem = (s: SponsorEntry, keySuffix = "") => {
    const body = (
      <>
        {s.logo && (
          <span className="relative mb-2 block h-8 w-32">
            <Image src={s.logo} alt={s.name} fill className="object-contain transition group-hover:scale-105" />
          </span>
        )}
        <span className={cn("text-[10px] font-semibold uppercase tracking-widest", tag)}>
          {s.tagline ?? "Partner"}
        </span>
        <span className={cn("mt-1 font-display text-base tracking-wider md:text-lg transition-colors group-hover:text-racing", title)}>
          {s.name}
        </span>
      </>
    );

    return s.website ? (
      <a
        key={`${s.id}${keySuffix}`}
        href={s.website}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(card, "group")}
      >
        {body}
      </a>
    ) : (
      <div key={`${s.id}${keySuffix}`} className={cn(card, "group")}>
        {body}
      </div>
    );
  };

  if (marquee && entries.length > 2) {
    return (
      <div className="group relative w-full overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee items-stretch gap-10 motion-reduce:animate-none [.group:hover_&]:[animation-play-state:paused] md:gap-16">
          {entries.map((s) => renderItem(s, "-a"))}
          {entries.map((s) => renderItem(s, "-b"))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-6"
          : "flex flex-wrap items-center justify-center gap-10 md:gap-16"
      }
    >
      {entries.map((s) => renderItem(s))}
    </div>
  );
}
