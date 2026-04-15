import { getSupabaseAdmin } from "../supabase/admin";
import type { Post } from "../db";
import { slugify } from "../utils";

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: row.excerpt != null ? String(row.excerpt) : null,
    content: String(row.content),
    cover_image: row.cover_image != null ? String(row.cover_image) : null,
    published_at: String(row.published_at),
    created_at: String(row.created_at),
  };
}

export async function listPosts(limit?: number): Promise<Post[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase.from("posts").select("*").order("published_at", { ascending: false });
  if (limit != null) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => mapPost(row as Record<string, unknown>));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapPost(data as Record<string, unknown>);
}

export async function getPostById(id: number): Promise<Post | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapPost(data as Record<string, unknown>);
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
  const supabase = getSupabaseAdmin();
  const slug = input.slug || (await ensureUniqueSlug(slugify(input.title)));
  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content,
      cover_image: input.cover_image ?? null,
      published_at: input.published_at,
    })
    .select("id")
    .single();
  if (error) throw error;
  return Number((data as { id: number }).id);
}

export async function updatePost(id: number, input: PostInput): Promise<void> {
  const supabase = getSupabaseAdmin();
  const slug = input.slug || slugify(input.title);
  const { error } = await supabase
    .from("posts")
    .update({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content,
      cover_image: input.cover_image ?? null,
      published_at: input.published_at,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePost(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

async function ensureUniqueSlug(base: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  let slug = base;
  let n = 2;
  while (true) {
    const { data } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${n++}`;
  }
}
