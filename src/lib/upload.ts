import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

type UploadDir = "posts" | "galerie" | "covers";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export async function saveImage(
  file: File,
  subdir: UploadDir,
  opts?: { maxWidth?: number; quality?: number }
): Promise<string> {
  const maxWidth = opts?.maxWidth ?? 1920;
  const quality = opts?.quality ?? 85;

  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(UPLOADS_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });

  const hash = crypto.randomBytes(6).toString("hex");
  const base = slugifyFilename(file.name.replace(/\.[^.]+$/, "")) || "bild";
  const filename = `${Date.now()}-${hash}-${base}.jpg`;
  const outPath = path.join(dir, filename);

  await sharp(buf)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(outPath);

  return `/uploads/${subdir}/${filename}`;
}

export async function deleteUpload(publicPath: string): Promise<void> {
  if (!publicPath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  try {
    await fs.unlink(abs);
  } catch {
    // ignore
  }
}

function slugifyFilename(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}
