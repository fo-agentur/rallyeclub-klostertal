import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getEventById } from "@/lib/queries/events";
import { EventForm } from "../event-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  if (!(await isAuthenticated())) redirect("/admin");
  const { id } = await params;
  const event = await getEventById(Number(id));
  if (!event) notFound();

  return (
    <div className="section">
      <div className="container-wide max-w-3xl">
        <Link
          href="/admin/termine"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Termine
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Termin bearbeiten
        </h1>
        <div className="mt-10">
          <EventForm
            initial={{
              id: event.id,
              title: event.title,
              date: event.date.slice(0, 10),
              end_date: event.end_date?.slice(0, 10) ?? "",
              location: event.location,
              description: event.description,
            }}
          />
        </div>
      </div>
    </div>
  );
}
