import Image from "next/image";

interface ClubLogoProps {
  className?: string;
  /** Larger lockup on wide header */
  variant?: "icon" | "mark";
}

export function ClubLogo({ className, variant = "icon" }: ClubLogoProps) {
  const size = variant === "mark" ? 44 : 40;
  return (
    <Image
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      priority
      aria-hidden
    />
  );
}
