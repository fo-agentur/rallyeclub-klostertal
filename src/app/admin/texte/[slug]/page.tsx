import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getPageBySlug } from "@/lib/queries/pages";
import { PageForm } from "../page-form";

export default async function EditPageContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin");
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="section">
      <div className="container-wide max-w-4xl">
        <Link
          href="/admin/texte"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Texte
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Text bearbeiten
        </h1>
        <div className="mt-10">
          <PageForm initial={page} />
        </div>
      </div>
    </div>
  );
}
