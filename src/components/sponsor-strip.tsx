import Image from "next/image";
import { SPONSOR_ENTRIES } from "@/config/sponsors";
import { cn } from "@/lib/utils";

interface SponsorStripProps {
  sponsors?: SponsorEntry[];
  compact?: boolean;
  variant?: "light" | "dark";
}

type SponsorEntry = {
  id: number | string;
  name: string;
  tagline?: string | null;
  website?: string | null;
  logo?: string | null;
};

export function SponsorStrip({ sponsors, compact, variant = "light" }: SponsorStripProps) {
  const entries: readonly SponsorEntry[] =
    sponsors && sponsors.length > 0 ? sponsors : SPONSOR_ENTRIES;

  const card = cn(
    "flex min-h-[4rem] min-w-[10rem] flex-col items-center justify-center px-5 py-3 text-center transition",
    variant === "dark"
      ? "border border-white/15 bg-white/5 hover:border-racing/50"
      : "border border-neutral-200 bg-white shadow-sm hover:border-racing/40",
  );
  const tag = "text-neutral-500";
  const title = variant === "dark" ? "text-white" : "text-ink";

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-6"
          : "flex flex-wrap items-center justify-center gap-10 md:gap-16"
      }
    >
      {entries.map((s) => {
        const body = (
          <>
            {s.logo && (
              <span className="relative mb-2 block h-8 w-32">
                <Image src={s.logo} alt={s.name} fill className="object-contain" />
              </span>
            )}
            <span className={cn("text-[10px] font-semibold uppercase tracking-widest", tag)}>
              {s.tagline ?? "Partner"}
            </span>
            <span className={cn("mt-1 font-display text-base tracking-wider md:text-lg", title)}>
              {s.name}
            </span>
          </>
        );

        return s.website ? (
          <a key={s.id} href={s.website} target="_blank" rel="noopener noreferrer" className={card}>
            {body}
          </a>
        ) : (
          <div key={s.id} className={card}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
