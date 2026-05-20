import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { SponsorForm } from "../sponsor-form";

export default async function NewSponsorPage() {
  if (!(await isAuthenticated())) redirect("/admin");

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
          Neuer Sponsor
        </h1>
        <div className="mt-10">
          <SponsorForm />
        </div>
      </div>
    </div>
  );
}
