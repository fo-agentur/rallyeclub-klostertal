import { getDb, type Post } from "../db";
import { slugify } from "../utils";

export async function listPosts(limit?: number): Promise<Post[]> {
  const db = await getDb();
  return limit
    ? db.all<Post>("SELECT * FROM posts ORDER BY published_at DESC LIMIT ?", [limit])
    : db.all<Post>("SELECT * FROM posts ORDER BY published_at DESC");
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = await getDb();
  return db.first<Post>("SELECT * FROM posts WHERE slug = ?", [slug]);
}

export async function getPostById(id: number): Promise<Post | null> {
  const db = await getDb();
  return db.first<Post>("SELECT * FROM posts WHERE id = ?", [id]);
}

export type PostInput = {
  title: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  published_at: string;
  slug?: string;
};

export async function createPost(input: PostInput): Promise<number> {
  const db = await getDb();
  const slug = input.slug || (await ensureUniqueSlug(db, slugify(input.title)));
  const { lastInsertRowid } = await db.run(
    `INSERT INTO posts (slug, title, excerpt, content, cover_image, published_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [slug, input.title, input.excerpt ?? null, input.content, input.cover_image ?? null, input.published_at],
  );
  return lastInsertRowid;
}

export async function updatePost(id: number, input: PostInput): Promise<void> {
  const db = await getDb();
  const slug = input.slug || slugify(input.title);
  await db.run(
    `UPDATE posts
     SET slug = ?, title = ?, excerpt = ?, content = ?, cover_image = ?, published_at = ?
     WHERE id = ?`,
    [slug, input.title, input.excerpt ?? null, input.content, input.cover_image ?? null, input.published_at, id],
  );
}

export async function deletePost(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM posts WHERE id = ?", [id]);
}

type Db = Awaited<ReturnType<typeof getDb>>;

async function ensureUniqueSlug(db: Db, base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await db.first("SELECT 1 FROM posts WHERE slug = ?", [slug])) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
