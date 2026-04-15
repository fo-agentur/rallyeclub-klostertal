import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { PostForm } from "../post-form";

export default async function NewPostPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <div className="section">
      <div className="container-wide max-w-4xl">
        <Link
          href="/admin/beitraege"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Beiträge
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Neuer Beitrag
        </h1>
        <div className="mt-10">
          <PostForm />
        </div>
      </div>
    </div>
  );
}
