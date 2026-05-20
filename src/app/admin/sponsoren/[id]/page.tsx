import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { parseRequiredFormPk } from "@/lib/form-parse";
import { getSponsorById } from "@/lib/queries/sponsors";
import { SponsorForm } from "../sponsor-form";

export default async function EditSponsorPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/admin");
  const { id: rawId } = await params;
  const id = parseRequiredFormPk(rawId);
  if (!id) notFound();
  const sponsor = await getSponsorById(id);
  if (!sponsor) notFound();

  return (
    <div className="section">
      <div className="container-wide max-w-4xl">
        <Link
          href="/admin/sponsoren"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Sponsoren
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Sponsor bearbeiten
        </h1>
        <div className="mt-10">
          <SponsorForm initial={sponsor} />
        </div>
      </div>
    </div>
  );
}
