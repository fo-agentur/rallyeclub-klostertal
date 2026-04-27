"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClubLogo } from "@/components/club-logo";
import { SponsorStrip } from "@/components/sponsor-strip";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-ink text-neutral-300">
      <div className="container-wide py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <ClubLogo className="shrink-0" variant="mark" />
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-400">
              Der Rallyeclub Klostertal ist ein Motorsportverein aus Vorarlberg und organisiert
              jährlich den Autoslalom in St.&nbsp;Gallenkirch sowie Clubausfahrten und gesellige
              Veranstaltungen.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">Seiten</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { href: "/news", label: "News" },
                { href: "/veranstaltungen", label: "Termine" },
                { href: "/galerie", label: "Galerie" },
                { href: "/mitglieder", label: "Mitglieder" },
                { href: "/fahrer", label: "Aktive Fahrer" },
                { href: "/reglement", label: "Reglement" },
              ].map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="transition hover:text-racing">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">Kontakt</h3>
            <address className="mt-4 space-y-2 text-sm not-italic text-neutral-400">
              <div>Rallyeclub Klostertal</div>
              <div>Amerdonastraße 22</div>
              <div>6820 Frastanz</div>
              <div className="pt-2">
                <a href="tel:+436643512997" className="transition hover:text-racing">
                  0664 / 35 12 997
                </a>
              </div>
              <div>
                <a
                  href="mailto:info@rallyeclub-klostertal.at"
                  className="transition hover:text-racing"
                >
                  info@rallyeclub-klostertal.at
                </a>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 border-t border-ink-line pt-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <SponsorStrip compact variant="dark" />

            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <Link href="/impressum" className="transition hover:text-racing">
                Impressum
              </Link>
              <span>·</span>
              <Link href="/kontakt" className="transition hover:text-racing">
                Kontakt
              </Link>
              <span>·</span>
              <span>© {new Date().getFullYear()} Rallyeclub Klostertal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
