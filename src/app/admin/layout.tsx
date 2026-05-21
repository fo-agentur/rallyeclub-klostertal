import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { ClubLogo } from "@/components/club-logo";

// Cookie/session must be read on every request — avoid static shell that redirects to /admin.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Rallyeclub Klostertal",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="container-wide flex min-h-16 items-center justify-between gap-4 py-3">
          <Link
            href={authed ? "/admin/dashboard" : "/admin"}
            className="flex items-center gap-3"
          >
            <ClubLogo className="scale-[0.82] origin-left px-2 py-1.5 shadow-none ring-1 ring-neutral-200" variant="mark" />
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-6">
            {authed && (
              <>
                <a
                  href="/admin/personen"
                  className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
                >
                  Personen
                </a>
                <a
                  href="/admin/sponsoren"
                  className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
                >
                  Sponsoren
                </a>
                <a
                  href="/admin/texte"
                  className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
                >
                  Texte
                </a>
                <a
                  href="/admin/import"
                  className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
                >
                  Import
                </a>
                <a
                  href="/admin/passwort"
                  className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
                >
                  Passwort ändern
                </a>
              </>
            )}
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
            >
              ← Zur Website
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
