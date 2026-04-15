import { getDb, type Post } from "../db";
import { slugify } from "../utils";

export function listPosts(limit?: number): Post[] {
  const db = getDb();
  const stmt = limit
    ? db.prepare("SELECT * FROM posts ORDER BY published_at DESC LIMIT ?")
    : db.prepare("SELECT * FROM posts ORDER BY published_at DESC");
  return (limit ? stmt.all(limit) : stmt.all()) as Post[];
}

export function getPostBySlug(slug: string): Post | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as Post) ?? null;
}

export function getPostById(id: number): Post | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as Post) ?? null;
}

export type PostInput = {
  title: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  published_at: string;
  slug?: string;
};

export function createPost(input: PostInput): number {
  const db = getDb();
  const slug = input.slug || ensureUniqueSlug(slugify(input.title));
  const info = db
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, cover_image, published_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      slug,
      input.title,
      input.excerpt ?? null,
      input.content,
      input.cover_image ?? null,
      input.published_at
    );
  return Number(info.lastInsertRowid);
}

export function updatePost(id: number, input: PostInput): void {
  const db = getDb();
  const slug = input.slug || slugify(input.title);
  db.prepare(
    `UPDATE posts
     SET slug = ?, title = ?, excerpt = ?, content = ?, cover_image = ?, published_at = ?
     WHERE id = ?`
  ).run(
    slug,
    input.title,
    input.excerpt ?? null,
    input.content,
    input.cover_image ?? null,
    input.published_at,
    id
  );
}

export function deletePost(id: number): void {
  getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

function ensureUniqueSlug(base: string): string {
  const db = getDb();
  let slug = base;
  let n = 2;
  while (db.prepare("SELECT 1 FROM posts WHERE slug = ?").get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
