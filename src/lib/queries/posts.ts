import { isDatabaseConfigured, query } from "../pg";
import type { Post } from "../db";
import { slugify } from "../utils";

type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published_at: string;
  created_at: string | Date;
};

function mapPost(row: PostRow): Post {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    cover_image: row.cover_image,
    published_at: row.published_at,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function listPosts(limit?: number): Promise<Post[]> {
  if (!isDatabaseConfigured()) return [];
  const sql = limit != null
    ? "SELECT * FROM posts ORDER BY published_at DESC LIMIT $1"
    : "SELECT * FROM posts ORDER BY published_at DESC";
  const { rows } = await query<PostRow>(sql, limit != null ? [limit] : undefined);
  return rows.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isDatabaseConfigured()) return null;
  const { rows } = await query<PostRow>(
    "SELECT * FROM posts WHERE slug = $1 LIMIT 1",
    [slug],
  );
  return rows[0] ? mapPost(rows[0]) : null;
}

export async function getPostById(id: number): Promise<Post | null> {
  if (!isDatabaseConfigured()) return null;
  const { rows } = await query<PostRow>(
    "SELECT * FROM posts WHERE id = $1 LIMIT 1",
    [id],
  );
  return rows[0] ? mapPost(rows[0]) : null;
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
  const slug = input.slug || (await ensureUniqueSlug(slugify(input.title)));
  const { rows } = await query<{ id: number }>(
    `INSERT INTO posts (slug, title, excerpt, content, cover_image, published_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      slug,
      input.title,
      input.excerpt ?? null,
      input.content,
      input.cover_image ?? null,
      input.published_at,
    ],
  );
  return Number(rows[0].id);
}

export async function updatePost(id: number, input: PostInput): Promise<void> {
  const slug = input.slug || slugify(input.title);
  await query(
    `UPDATE posts
       SET slug = $1,
           title = $2,
           excerpt = $3,
           content = $4,
           cover_image = $5,
           published_at = $6
     WHERE id = $7`,
    [
      slug,
      input.title,
      input.excerpt ?? null,
      input.content,
      input.cover_image ?? null,
      input.published_at,
      id,
    ],
  );
}

export async function deletePost(id: number): Promise<void> {
  await query("DELETE FROM posts WHERE id = $1", [id]);
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (true) {
    const { rows } = await query<{ id: number }>(
      "SELECT id FROM posts WHERE slug = $1 LIMIT 1",
      [slug],
    );
    if (rows.length === 0) return slug;
    slug = `${base}-${n++}`;
  }
}
