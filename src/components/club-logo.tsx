import Image from "next/image";
import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  variant?: "icon" | "mark";
}

export function ClubLogo({ className, variant = "icon" }: ClubLogoProps) {
  const width = variant === "mark" ? 220 : 168;
  const height = Math.round((width * 69) / 522);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm bg-white px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="Rallyeclub Klostertal"
        width={width}
        height={height}
        priority
      />
    </span>
  );
}
