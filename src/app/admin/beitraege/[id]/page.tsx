import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getPostById } from "@/lib/queries/posts";
import { PostForm } from "../post-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  if (!(await isAuthenticated())) redirect("/admin");
  const { id } = await params;
  const post = await getPostById(Number(id));
  if (!post) notFound();

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
          Beitrag bearbeiten
        </h1>
        <div className="mt-10">
          <PostForm
            initial={{
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              cover_image: post.cover_image,
              published_at: post.published_at.slice(0, 10),
            }}
          />
        </div>
      </div>
    </div>
  );
}
