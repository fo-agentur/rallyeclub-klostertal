import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listEvents } from "@/lib/queries/events";
import { formatDate } from "@/lib/utils";
import { deleteEventAction } from "./actions";

export default async function AdminEventsPage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const events = await listEvents();
  const today = new Date().toISOString().slice(0, 10);

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
              Termine
            </h1>
          </div>
          <Link href="/admin/termine/neu" className="btn-primary">
            + Neu
          </Link>
        </div>

        <div className="mt-10 border border-neutral-200 bg-white">
          {events.length === 0 && (
            <div className="p-8 text-sm text-neutral-500">Noch keine Termine.</div>
          )}
          {events.map((e) => {
            const past = e.date < today;
            return (
              <div
                key={e.id}
                className={`flex flex-wrap items-center gap-4 border-b border-neutral-100 p-5 last:border-0 ${
                  past ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate font-display text-lg tracking-wider text-ink">
                    {e.title}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    {formatDate(e.date)}
                    {e.end_date && ` – ${formatDate(e.end_date)}`}
                    {e.location && ` · ${e.location}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/termine/${e.id}`}
                    className="btn-outline !px-4 !py-2 text-xs"
                  >
                    Bearbeiten
                  </Link>
                  <form action={deleteEventAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      className="border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 transition hover:border-racing hover:text-racing"
                    >
                      Löschen
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
