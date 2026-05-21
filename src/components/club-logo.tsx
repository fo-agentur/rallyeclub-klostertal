import Image from "next/image";
import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  variant?: "icon" | "mark";
  /** Set to true for above-the-fold uses (e.g. header). Defaults to false to avoid preloading footer logos. */
  priority?: boolean;
}

export function ClubLogo({ className, variant = "icon", priority = false }: ClubLogoProps) {
  const width = variant === "mark" ? 340 : 168;
  const height = Math.round((width * 69) / 522);
  const imageClassName =
    variant === "mark"
      ? "h-auto w-[clamp(180px,32vw,340px)]"
      : "h-auto w-[168px]";

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="Rallyeclub Klostertal"
        width={width}
        height={height}
        className={imageClassName}
        priority={priority}
      />
    </span>
  );
}
