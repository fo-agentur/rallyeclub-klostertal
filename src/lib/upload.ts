import crypto from "node:crypto";

type UploadDir = "posts" | "galerie" | "covers";

function isCloudflareWorker(): boolean {
  // Cloudflare Workers expose a global `navigator.userAgent` starting with "Cloudflare-Workers"
  // and do NOT have `process.versions.node`
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent?.startsWith("Cloudflare-Workers")
  );
}

export async function saveImage(
  file: File,
  subdir: UploadDir,
  opts?: { maxWidth?: number; quality?: number }
): Promise<string> {
  if (isCloudflareWorker()) {
    // TODO: replace with R2 upload once the bucket is set up in the Cloudflare Dashboard.
    // For now, return a placeholder path so the admin flow doesn't hard-crash.
    throw new Error(
      "Bild-Upload auf Cloudflare noch nicht konfiguriert. Bitte R2-Bucket im Dashboard aktivieren."
    );
  }

  // Local / Docker path: use sharp + filesystem
  const [{ default: sharp }, { default: fs }, { default: path }] = await Promise.all([
    import("sharp"),
    import("node:fs/promises"),
    import("node:path"),
  ]);

  const maxWidth = opts?.maxWidth ?? 1920;
  const quality = opts?.quality ?? 85;

  const buf = Buffer.from(await file.arrayBuffer());
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const dir = path.join(uploadsRoot, subdir);
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
  if (isCloudflareWorker()) return; // No-op on Cloudflare until R2 is wired up

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
