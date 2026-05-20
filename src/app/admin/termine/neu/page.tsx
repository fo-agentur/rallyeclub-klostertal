import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { EventForm } from "../event-form";

export default async function NewEventPage() {
  if (!(await isAuthenticated())) redirect("/admin");

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
          Neuer Termin
        </h1>
        <div className="mt-10">
          <EventForm />
        </div>
      </div>
    </div>
  );
}
