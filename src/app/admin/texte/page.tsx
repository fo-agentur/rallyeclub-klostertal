import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listPages } from "@/lib/queries/pages";

export default async function AdminPagesPage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const pages = await listPages();

  return (
    <div className="section">
      <div className="container-wide">
        <Link
          href="/admin/dashboard"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Texte
        </h1>

        <div className="mt-10 border border-neutral-200 bg-white">
          {pages.length === 0 && (
            <div className="p-8 text-sm text-neutral-500">Noch keine Seiten-Texte.</div>
          )}
          {pages.map((page) => (
            <div
              key={page.slug}
              className="flex flex-wrap items-center gap-4 border-b border-neutral-100 p-5 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-lg tracking-wider text-ink">
                  {page.title}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  /{page.slug}
                </div>
              </div>
              <Link
                href={`/admin/texte/${page.slug}`}
                className="btn-outline !px-4 !py-2 text-xs"
              >
                Bearbeiten
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
