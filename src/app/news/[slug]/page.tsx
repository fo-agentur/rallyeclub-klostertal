import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, listPosts } from "@/lib/queries/posts";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Beitrag nicht gefunden" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article>
      <div className="bg-ink text-white">
        <div className="container-prose py-20 md:py-28">
          <Link
            href="/news"
            className="text-xs font-semibold uppercase tracking-widest text-racing hover:underline"
          >
            ← News
          </Link>
          <time
            dateTime={post.published_at}
            className="mt-6 block text-xs font-semibold uppercase tracking-widest text-neutral-400"
          >
            {formatDate(post.published_at)}
          </time>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-wider md:text-6xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-6 text-base leading-relaxed text-neutral-300 md:text-lg">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>

      {post.cover_image && (
        <div className="relative aspect-[16/8] w-full bg-neutral-100">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="section">
        <div className="container-prose prose-article">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <div className="container-prose mt-16 border-t border-neutral-200 pt-8">
          <Link href="/news" className="btn-ghost">
            ← Alle News
          </Link>
        </div>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}
