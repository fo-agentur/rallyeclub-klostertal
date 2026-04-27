"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ClubLogo } from "@/components/club-logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/veranstaltungen", label: "Termine" },
  { href: "/galerie", label: "Galerie" },
  { href: "/mitglieder", label: "Mitglieder" },
  { href: "/fahrer", label: "Fahrer" },
  { href: "/kontakt", label: "Kontakt" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        transparent
          ? "bg-transparent"
          : scrolled
            ? "border-b border-neutral-200 bg-white/90 backdrop-blur"
            : "bg-white border-b border-neutral-200"
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Rallyeclub Klostertal — Home">
          <ClubLogo className="shrink-0" />
          <span className="hidden flex-col leading-none md:flex">
            <span
              className={cn(
                "font-display text-lg tracking-widest transition-colors duration-300",
                transparent ? "text-white" : "text-ink"
              )}
            >
              RALLYECLUB
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-300",
                transparent ? "text-white/60" : "text-neutral-500"
              )}
            >
              Klostertal · Vorarlberg
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium uppercase tracking-widest transition",
                  transparent
                    ? active
                      ? "text-racing"
                      : "text-white/85 hover:text-racing"
                    : active
                      ? "text-racing"
                      : "text-ink hover:text-racing"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={cn(
            "flex h-10 w-10 items-center justify-center lg:hidden",
            transparent ? "text-white" : "text-ink"
          )}
          aria-label="Menü öffnen"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü</span>
          <div className="space-y-1.5">
            <span
              className={cn(
                "block h-[2px] w-6 transition",
                transparent ? "bg-white" : "bg-ink",
                open && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-6 transition",
                transparent ? "bg-white" : "bg-ink",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-6 transition",
                transparent ? "bg-white" : "bg-ink",
                open && "-translate-y-2 -rotate-45"
              )}
            />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-200 bg-white lg:hidden">
          <nav className="container-wide flex flex-col py-4">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "py-3 text-base font-medium uppercase tracking-widest",
                    active ? "text-racing" : "text-ink"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
