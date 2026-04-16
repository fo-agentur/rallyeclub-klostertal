import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase/admin";
import type { Album, Photo } from "../db";
import { slugify } from "../utils";

function mapAlbum(row: Record<string, unknown>): Album {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description != null ? String(row.description) : null,
    cover_image: row.cover_image != null ? String(row.cover_image) : null,
    date: row.date != null ? String(row.date) : null,
    created_at: String(row.created_at),
  };
}

function mapPhoto(row: Record<string, unknown>): Photo {
  return {
    id: Number(row.id),
    album_id: Number(row.album_id),
    url: String(row.url),
    caption: row.caption != null ? String(row.caption) : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
  };
}

export type AlbumWithCount = Album & { photo_count: number };

export async function listAlbums(): Promise<AlbumWithCount[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("album_list")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const a = mapAlbum(row as Record<string, unknown>);
    const photo_count = Number((row as { photo_count?: number }).photo_count ?? 0);
    return { ...a, photo_count };
  });
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("albums").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapAlbum(data as Record<string, unknown>);
}

export async function getAlbumById(id: number): Promise<Album | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("albums").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapAlbum(data as Record<string, unknown>);
}

export async function getAlbumPhotos(albumId: number): Promise<Photo[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapPhoto(row as Record<string, unknown>));
}

export type AlbumInput = {
  title: string;
  description?: string | null;
  cover_image?: string | null;
  date?: string | null;
  slug?: string;
};

export async function createAlbum(input: AlbumInput): Promise<number> {
  const supabase = getSupabaseAdmin();
  const slug = input.slug || (await ensureUniqueSlug(slugify(input.title)));
  const { data, error } = await supabase
    .from("albums")
    .insert({
      slug,
      title: input.title,
      description: input.description ?? null,
      cover_image: input.cover_image ?? null,
      date: input.date ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return Number((data as { id: number }).id);
}

export async function updateAlbum(id: number, input: AlbumInput): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("albums")
    .update({
      title: input.title,
      description: input.description ?? null,
      cover_image: input.cover_image ?? null,
      date: input.date ?? null,
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAlbum(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) throw error;
}

export async function addPhoto(albumId: number, url: string, caption?: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data: maxRows, error: maxErr } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1);
  if (maxErr) throw maxErr;
  const maxOrder = maxRows?.[0] ? Number((maxRows[0] as { sort_order: number }).sort_order) : 0;
  const sortOrder = maxOrder + 1;

  const { data, error } = await supabase
    .from("photos")
    .insert({
      album_id: albumId,
      url,
      caption: caption ?? null,
      sort_order: sortOrder,
    })
    .select("id")
    .single();
  if (error) throw error;
  const photoId = Number((data as { id: number }).id);

  const { data: album } = await supabase.from("albums").select("cover_image").eq("id", albumId).maybeSingle();
  const cover = album ? (album as { cover_image: string | null }).cover_image : null;
  if (!cover) {
    await supabase.from("albums").update({ cover_image: url }).eq("id", albumId);
  }

  return photoId;
}

export async function deletePhoto(photoId: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("photos").delete().eq("id", photoId);
  if (error) throw error;
}

/** URL of a single photo row (for admin actions). */
export async function getPhotoUrlById(photoId: number): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("photos").select("url").eq("id", photoId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return String((data as { url: string }).url);
}

/** First photo URL in album sort order (for cover fallback). */
export async function getFirstPhotoUrlForAlbum(albumId: number): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photos")
    .select("url")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return String((data as { url: string }).url);
}

/** Set album cover image (or clear with null). */
export async function setAlbumCoverImage(albumId: number, url: string | null): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("albums").update({ cover_image: url }).eq("id", albumId);
  if (error) throw error;
}

async function ensureUniqueSlug(base: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  let slug = base;
  let n = 2;
  while (true) {
    const { data } = await supabase.from("albums").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${n++}`;
  }
}
