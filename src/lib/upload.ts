import crypto from "node:crypto";
import { getEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type UploadDir = "posts" | "galerie" | "covers";

const STORAGE_BUCKET = "uploads";

function isCloudflareWorker(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent?.startsWith("Cloudflare-Workers")
  );
}

function useSupabaseStorage(): boolean {
  return !!(getEnv("SUPABASE_URL") && getEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

/** Extract object path inside bucket from Supabase public URL. */
function pathFromSupabasePublicUrl(url: string): string | null {
  const marker = "/object/public/uploads/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

async function uploadToSupabase(objectPath: string, data: Buffer, contentType: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, data, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  return pub.publicUrl;
}

export async function saveImage(
  file: File,
  subdir: UploadDir,
  opts?: { maxWidth?: number; quality?: number },
): Promise<string> {
  const maxWidth = opts?.maxWidth ?? 1920;
  const quality = opts?.quality ?? 85;

  const hash = crypto.randomBytes(6).toString("hex");
  const base = slugifyFilename(file.name.replace(/\.[^.]+$/, "")) || "bild";
  const filename = `${Date.now()}-${hash}-${base}.jpg`;

  if (useSupabaseStorage()) {
    const buf = Buffer.from(await file.arrayBuffer());
    let out: Buffer;
    let contentType = "image/jpeg";

    if (isCloudflareWorker()) {
      // No sharp on Workers — upload as-is (still JPEG filename; browser-sent JPEG/PNG OK)
      out = buf;
      if (file.type === "image/png") contentType = "image/png";
      else if (file.type === "image/webp") contentType = "image/webp";
    } else {
      const { default: sharp } = await import("sharp");
      out = await sharp(buf)
        .rotate()
        .resize({ width: maxWidth, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    const objectPath = `${subdir}/${filename}`;
    return uploadToSupabase(objectPath, out, contentType);
  }

  const [{ default: sharp }, { default: fs }, { default: path }] = await Promise.all([
    import("sharp"),
    import("node:fs/promises"),
    import("node:path"),
  ]);

  const buf = Buffer.from(await file.arrayBuffer());
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const dir = path.join(uploadsRoot, subdir);
  await fs.mkdir(dir, { recursive: true });
  const outPath = path.join(dir, filename);

  await sharp(buf)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(outPath);

  return `/uploads/${subdir}/${filename}`;
}

export async function deleteUpload(publicPath: string): Promise<void> {
  if (publicPath.includes("supabase.co") && publicPath.includes("/storage/")) {
    if (!useSupabaseStorage()) return;
    const objectPath = pathFromSupabasePublicUrl(publicPath);
    if (!objectPath) return;
    const supabase = getSupabaseAdmin();
    await supabase.storage.from(STORAGE_BUCKET).remove([objectPath]);
    return;
  }

  if (isCloudflareWorker()) return;

  if (!publicPath.startsWith("/uploads/")) return;
  const { default: fs } = await import("node:fs/promises");
  const { default: path } = await import("node:path");
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
