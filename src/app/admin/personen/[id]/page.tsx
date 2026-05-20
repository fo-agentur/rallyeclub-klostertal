import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { parseRequiredFormPk } from "@/lib/form-parse";
import { getPersonById } from "@/lib/queries/people";
import { PersonForm } from "../person-form";

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/admin");
  const { id: rawId } = await params;
  const id = parseRequiredFormPk(rawId);
  if (!id) notFound();
  const person = await getPersonById(id);
  if (!person) notFound();

  return (
    <div className="section">
      <div className="container-wide max-w-4xl">
        <Link
          href="/admin/personen"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Personen
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Person bearbeiten
        </h1>
        <div className="mt-10">
          <PersonForm initial={person} />
        </div>
      </div>
    </div>
  );
}
