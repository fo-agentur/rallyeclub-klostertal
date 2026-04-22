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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const isHome = pathname === "/";
  const dark = isHome;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isHome
          ? scrolled
            ? "border-b border-white/10 bg-ink/95 backdrop-blur-md"
            : "border-b border-white/10 bg-ink/72 backdrop-blur-md"
          : scrolled
            ? "border-b border-neutral-200 bg-white/92 backdrop-blur-md"
            : "bg-white"
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Rallyeclub Klostertal — Home">
          <ClubLogo className="shrink-0" />
          <span className="hidden flex-col leading-none md:flex">
            <span
              className={cn(
                "font-display text-lg tracking-widest transition-colors duration-300",
                dark ? "text-white" : "text-ink"
              )}
            >
              RALLYECLUB
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-300",
                dark ? "text-neutral-400" : "text-neutral-500"
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
                  "px-3 py-2 text-sm font-medium uppercase tracking-widest transition-colors duration-200",
                  dark
                    ? active
                      ? "text-racing"
                      : "text-white/80 hover:text-white"
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
          className="flex h-10 w-10 items-center justify-center lg:hidden"
          aria-label="Menü öffnen"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü</span>
          <div className="space-y-1.5">
            {[
              open ? "translate-y-2 rotate-45" : "",
              open ? "opacity-0" : "",
              open ? "-translate-y-2 -rotate-45" : "",
            ].map((extra, i) => (
              <span
                key={i}
                className={cn(
                  "block h-[2px] w-6 transition-all duration-200",
                  dark ? "bg-white" : "bg-ink",
                  extra
                )}
              />
            ))}
          </div>
        </button>
      </div>

      {open && (
        <div
          className={cn(
            "border-t lg:hidden",
            isHome ? "border-white/10 bg-ink" : "border-neutral-200 bg-white"
          )}
        >
          <nav className="container-wide flex flex-col py-4">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "py-3 text-base font-medium uppercase tracking-widest transition",
                    isHome
                      ? active
                        ? "text-racing"
                        : "text-white/80"
                      : active
                        ? "text-racing"
                        : "text-ink"
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
