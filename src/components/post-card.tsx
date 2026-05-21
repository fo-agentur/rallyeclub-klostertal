import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="card-hover group flex flex-col border border-neutral-200 bg-white hover:shadow-card"
    >
      <div
        className={cn(
          "relative overflow-hidden bg-neutral-100",
          featured ? "aspect-[16/9]" : "aspect-[16/10]"
        )}
      >
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition duration-[700ms] ease-out group-hover:scale-[1.07]"
            sizes={featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-ink text-racing">
            <span className="font-display text-6xl tracking-widest opacity-40">RCK</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-full motion-reduce:hidden" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <time
          dateTime={post.published_at}
          className="text-xs font-semibold uppercase tracking-widest text-racing"
        >
          {formatDate(post.published_at)}
        </time>
        <h3
          className={cn(
            "mt-3 font-semibold leading-snug text-ink transition group-hover:text-racing",
            featured ? "text-2xl md:text-3xl" : "text-xl"
          )}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {post.excerpt}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold uppercase tracking-widest text-neutral-400 transition-all group-hover:gap-2 group-hover:text-racing">
          Weiterlesen <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
