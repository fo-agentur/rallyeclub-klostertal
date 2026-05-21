"use client";

import Image from "next/image";
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
  /** Hint for next/image sizes prop. */
  sizes?: string;
}

/**
 * Portrait image with graceful initials fallback when src is missing or fails to load.
 */
export function PortraitImage({
  src,
  alt,
  imgClassName,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: PortraitImageProps) {
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
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("object-cover", imgClassName)}
      onError={() => setFailed(true)}
    />
  );
}
