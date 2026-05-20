import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_UPLOAD_HOST = (() => {
  const url = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Verhindert falsche Wurzel bei mehreren lockfiles (Parent-Ordner)
  outputFileTracingRoot: path.join(__dirname),
  // `public/uploads/**` (Legacy-Galerie) und `scripts/data/**` sind reine
  // Asset-/JSON-Daten — sie werden zur Laufzeit via fs.readFile gelesen,
  // aber nicht via ES-Import. Aus dem Trace ausschließen, sonst frisst der
  // letzte Build-Schritt unnötig Speicher (Coolify-Helper killt ihn dann).
  outputFileTracingExcludes: {
    "**": [
      "public/uploads/**",
      "scripts/data/**",
      "node_modules/@swc/core-linux-*",
      "node_modules/@esbuild/linux-*",
    ],
  },
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // MinIO / S3 — Host dynamisch aus ENV, sonst Wildcard als Notnagel
      PUBLIC_UPLOAD_HOST
        ? { protocol: "https", hostname: PUBLIC_UPLOAD_HOST }
        : { protocol: "https", hostname: "**" },
      PUBLIC_UPLOAD_HOST
        ? { protocol: "http", hostname: PUBLIC_UPLOAD_HOST }
        : { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
