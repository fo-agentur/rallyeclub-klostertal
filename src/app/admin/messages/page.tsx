import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listMessages } from "@/lib/queries/messages";
import { formatDate } from "@/lib/utils";
import { deleteMessageAction } from "./actions";

export default async function AdminMessagesPage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const messages = await listMessages();

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
              Nachrichten
            </h1>
          </div>
          <span className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            {messages.length} {messages.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        </div>

        <div className="mt-10 border border-neutral-200 bg-white">
          {messages.length === 0 && (
            <div className="p-8 text-sm text-neutral-500">Noch keine Nachrichten.</div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-start gap-4 border-b border-neutral-100 p-5 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-lg tracking-wider text-ink">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-xs font-semibold uppercase tracking-widest text-racing hover:underline"
                  >
                    {m.email}
                  </a>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
                    >
                      {m.phone}
                    </a>
                  )}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  {formatDate(m.created_at)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink whitespace-pre-wrap">{m.body}</p>
              </div>
              <form action={deleteMessageAction} className="shrink-0">
                <input type="hidden" name="id" value={m.id} />
                <button
                  type="submit"
                  className="border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 transition hover:border-racing hover:text-racing"
                >
                  Löschen
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
