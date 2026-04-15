import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";

export const metadata = {
  title: "Admin · Rallyeclub Klostertal",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="container-wide flex h-14 items-center justify-between">
          <Link
            href={authed ? "/admin/dashboard" : "/admin"}
            className="flex items-center gap-3"
          >
            <span className="flex h-7 w-7 items-center justify-center bg-ink text-[11px] font-bold tracking-widest text-racing">
              RCK
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-ink">
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
