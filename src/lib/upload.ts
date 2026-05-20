import crypto from "node:crypto";
import { deleteObject, isS3Configured, keyFromPublicUrl, putObject } from "@/lib/s3";

type UploadDir = "posts" | "galerie" | "covers" | "people" | "sponsors";

export async function saveImage(
  file: File,
  subdir: UploadDir,
  opts?: { maxWidth?: number; quality?: number },
): Promise<string> {
  if (!isS3Configured()) {
    throw new Error(
      "S3/MinIO ist nicht konfiguriert — S3_ENDPOINT / S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY setzen.",
    );
  }

  const maxWidth = opts?.maxWidth ?? 1920;
  const quality = opts?.quality ?? 85;

  const hash = crypto.randomBytes(6).toString("hex");
  const base = slugifyFilename(file.name.replace(/\.[^.]+$/, "")) || "bild";
  const filename = `${Date.now()}-${hash}-${base}.jpg`;
  const key = `${subdir}/${filename}`;

  const buf = Buffer.from(await file.arrayBuffer());

  const { default: sharp } = await import("sharp");
  const out = await sharp(buf)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return putObject(key, out, "image/jpeg");
}

export async function deleteUpload(publicPath: string): Promise<void> {
  if (!isS3Configured()) return;
  const key = keyFromPublicUrl(publicPath);
  if (!key) return;
  try {
    await deleteObject(key);
  } catch (err) {
    console.warn("deleteUpload failed", err);
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
