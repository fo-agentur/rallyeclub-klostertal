import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Verhindert falsche Wurzel bei mehreren lockfiles (Parent-Ordner) – sonst kaputte Builds/Tracing
  outputFileTracingRoot: path.join(__dirname),
  // Standalone nur für Docker; Vercel nutzt den normalen Next-Build
  ...(process.env.DOCKER === "1" ? { output: "standalone" } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
