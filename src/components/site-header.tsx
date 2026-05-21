"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ClubLogo } from "@/components/club-logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/veranstaltungen", label: "Termine" },
  { href: "/news", label: "News" },
  { href: "/galerie", label: "Galerie" },
  { href: "/fahrer", label: "Fahrer" },
  { href: "/mitglieder", label: "Mitglieder" },
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

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-neutral-200 bg-white/95 shadow-[0_8px_30px_rgba(20,20,20,0.06)] backdrop-blur-md"
          : "border-b border-neutral-200 bg-white",
      )}
    >
      <div className="container-wide flex h-[74px] items-center justify-between gap-5 lg:h-20">
        <Link
          href="/"
          className="flex min-w-0 items-center"
          aria-label="Rallyeclub Klostertal - Home"
        >
          <ClubLogo className="shrink-0" variant="mark" />
        </Link>

        <nav className="hidden min-w-0 items-center justify-end gap-1 lg:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative whitespace-nowrap px-3 py-2 text-sm font-medium uppercase tracking-widest transition-colors duration-200",
                  active ? "text-racing" : "text-ink hover:text-racing",
                )}
              >
                <span>{item.label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-racing transition-transform duration-300 ease-out",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-300 bg-white shadow-sm lg:hidden"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
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
                className={cn("block h-[2px] w-6 bg-ink transition-all duration-200", extra)}
              />
            ))}
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
                    "py-3 text-base font-medium uppercase tracking-widest transition",
                    active ? "text-racing" : "text-ink",
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
