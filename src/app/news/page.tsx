import { SectionHeader } from "@/components/section-header";
import { PostCard } from "@/components/post-card";
import { listPosts } from "@/lib/queries/posts";

export const metadata = {
  title: "News",
  description: "Aktuelle Nachrichten, Berichte und Ergebnisse des Rallyeclub Klostertal.",
};

export default async function NewsPage() {
  const posts = await listPosts();

  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="News"
          title="Aus dem Fahrerlager"
          description="Alle Berichte, Ergebnisse und Ankündigungen des Rallyeclub Klostertal."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {posts.length === 0 && (
          <div className="mt-12 border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
            Noch keine Beiträge veröffentlicht.
          </div>
        )}
      </div>
    </div>
  );
}
