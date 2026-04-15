import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listPosts } from "@/lib/queries/posts";
import { formatDate } from "@/lib/utils";
import { deletePostAction } from "./actions";

export default async function AdminPostsPage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const posts = listPosts();

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
              Beiträge
            </h1>
          </div>
          <Link href="/admin/beitraege/neu" className="btn-primary">
            + Neu
          </Link>
        </div>

        <div className="mt-10 border border-neutral-200 bg-white">
          {posts.length === 0 && (
            <div className="p-8 text-sm text-neutral-500">Noch keine Beiträge.</div>
          )}
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-4 border-b border-neutral-100 p-5 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-display text-lg tracking-wider text-ink">
                  {p.title}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {formatDate(p.published_at)} · {p.slug}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/beitraege/${p.id}`}
                  className="btn-outline !px-4 !py-2 text-xs"
                >
                  Bearbeiten
                </Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="id" value={p.id} />
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
