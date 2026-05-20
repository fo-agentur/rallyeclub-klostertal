"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

interface PortraitImageProps {
  src?: string;
  alt: string;
  imgClassName?: string;
}

/**
 * Local portrait path; falls back to initials when file is missing (e.g. not in git).
 */
export function PortraitImage({ src, alt, imgClassName }: PortraitImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-ink text-racing">
        <span className="font-display text-3xl tracking-widest opacity-80 md:text-4xl">
          {initialsFor(alt)}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", imgClassName)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
