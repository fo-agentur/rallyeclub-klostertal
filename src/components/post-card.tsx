import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-ink text-racing">
            <span className="font-display text-6xl tracking-widest opacity-60">RCK</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <time
          dateTime={post.published_at}
          className="text-xs font-semibold uppercase tracking-widest text-racing"
        >
          {formatDate(post.published_at)}
        </time>
        <h3 className="mt-3 text-xl font-semibold leading-snug text-ink group-hover:text-racing">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {post.excerpt}
          </p>
        )}
        <span className="mt-auto pt-6 text-xs font-semibold uppercase tracking-widest text-ink transition group-hover:text-racing">
          Weiterlesen →
        </span>
      </div>
    </Link>
  );
}
