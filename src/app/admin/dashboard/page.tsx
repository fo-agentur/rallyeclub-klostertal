import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listPosts } from "@/lib/queries/posts";
import { listEvents } from "@/lib/queries/events";
import { listAlbums } from "@/lib/queries/albums";
import { listMessages } from "@/lib/queries/messages";
import { logout } from "../actions";

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  const [posts, events, albums, messages] = await Promise.all([
    listPosts(),
    listEvents(),
    listAlbums(),
    listMessages(),
  ]);
  const postCount = posts.length;
  const eventCount = events.length;
  const albumCount = albums.length;
  const messageCount = messages.length;

  const tiles = [
    {
      href: "/admin/beitraege",
      label: "Beiträge",
      count: postCount,
      hint: "News verwalten",
    },
    {
      href: "/admin/galerie",
      label: "Galerie",
      count: albumCount,
      hint: "Alben & Fotos",
    },
    {
      href: "/admin/termine",
      label: "Termine",
      count: eventCount,
      hint: "Veranstaltungen",
    },
    {
      href: "/admin/messages",
      label: "Nachrichten",
      count: messageCount,
      hint: "Kontaktanfragen",
    },
  ];

  return (
    <div className="section">
      <div className="container-wide">
        <div className="eyebrow">Admin</div>
        <h1 className="mt-2 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Dashboard
        </h1>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group block border border-neutral-200 bg-white p-8 transition hover:border-ink"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-racing">
                  {t.hint}
                </span>
                <span className="font-display text-3xl tracking-wider text-ink">
                  {t.count}
                </span>
              </div>
              <div className="mt-6 font-display text-2xl tracking-wider text-ink group-hover:text-racing">
                {t.label}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Öffnen →
              </div>
            </Link>
          ))}

          <form action={logout} className="block">
            <button
              type="submit"
              className="h-full w-full border border-neutral-200 bg-white p-8 text-left transition hover:border-racing"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Sitzung
              </div>
              <div className="mt-6 font-display text-2xl tracking-wider text-ink hover:text-racing">
                Logout
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Abmelden →
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
