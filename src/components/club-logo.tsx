import Image from "next/image";
import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  variant?: "icon" | "mark";
}

export function ClubLogo({ className, variant = "icon" }: ClubLogoProps) {
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
        priority
      />
    </span>
  );
}
