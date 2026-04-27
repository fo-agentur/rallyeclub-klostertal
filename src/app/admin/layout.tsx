import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { ClubLogo } from "@/components/club-logo";

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
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
          >
            ← Zur Website
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
