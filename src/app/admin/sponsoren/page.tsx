import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listSponsors } from "@/lib/queries/sponsors";
import { deleteSponsorAction } from "./actions";

export default async function AdminSponsorsPage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const sponsors = await listSponsors();

  return (
    <div className="section">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
            >
              ← Dashboard
            </Link>
            <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
              Sponsoren
            </h1>
          </div>
          <Link href="/admin/sponsoren/neu" className="btn-primary">
            + Neu
          </Link>
        </div>

        <div className="mt-10 border border-neutral-200 bg-white">
          {sponsors.length === 0 && (
            <div className="p-8 text-sm text-neutral-500">Noch keine Sponsoren.</div>
          )}
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex flex-wrap items-center gap-4 border-b border-neutral-100 p-5 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-lg tracking-wider text-ink">
                  {sponsor.name}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {sponsor.tagline ?? "Sponsor"}
                  {sponsor.website ? ` · ${sponsor.website}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/sponsoren/${sponsor.id}`}
                  className="btn-outline !px-4 !py-2 text-xs"
                >
                  Bearbeiten
                </Link>
                <form action={deleteSponsorAction}>
                  <input type="hidden" name="id" value={sponsor.id} />
                  <button
                    type="submit"
                    className="border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 transition hover:border-racing hover:text-racing"
                  >
                    Löschen
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
