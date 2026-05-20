import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AlbumForm } from "../album-form";

export default async function NewAlbumPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <div className="section">
      <div className="container-wide max-w-3xl">
        <Link
          href="/admin/galerie"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Galerie
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Neues Album
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Erst Album anlegen — danach kannst du Fotos hochladen.
        </p>
        <div className="mt-10">
          <AlbumForm />
        </div>
      </div>
    </div>
  );
}
