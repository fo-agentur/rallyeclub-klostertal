import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/queries/posts";
import { listAlbums } from "@/lib/queries/albums";

const BASE_URL = "https://rallyeclub-klostertal.at";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/veranstaltungen`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/galerie`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/fahrer`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/mitglieder`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/reglement`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [posts, albums] = await Promise.all([listPosts(), listAlbums()]);

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${BASE_URL}/news/${post.slug}`,
      lastModified: new Date(post.published_at ?? post.created_at ?? now),
      changeFrequency: "yearly",
      priority: 0.7,
    }));

    const albumRoutes: MetadataRoute.Sitemap = albums.map((album) => ({
      url: `${BASE_URL}/galerie/${album.slug}`,
      lastModified: new Date(album.date ?? album.created_at ?? now),
      changeFrequency: "yearly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...postRoutes, ...albumRoutes];
  } catch {
    return staticRoutes;
  }
}
