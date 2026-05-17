import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getEnv } from "./env";

let _client: S3Client | null = null;

export function isS3Configured(): boolean {
  return !!(
    getEnv("S3_ENDPOINT") &&
    getEnv("S3_BUCKET") &&
    getEnv("S3_ACCESS_KEY_ID") &&
    getEnv("S3_SECRET_ACCESS_KEY")
  );
}

export function getBucket(): string {
  const b = getEnv("S3_BUCKET");
  if (!b) throw new Error("S3_BUCKET ist nicht gesetzt");
  return b;
}

/**
 * Basis-URL unter der Objekte öffentlich erreichbar sind.
 * MinIO hinter Coolify-Reverse-Proxy: z. B. `https://files.example.com/uploads`.
 * Fällt zurück auf `${S3_ENDPOINT}/${S3_BUCKET}`, was für interne Tests reicht.
 */
export function getPublicBaseUrl(): string {
  const explicit = getEnv("S3_PUBLIC_URL");
  if (explicit) return explicit.replace(/\/+$/, "");
  const endpoint = getEnv("S3_ENDPOINT");
  if (!endpoint) throw new Error("S3_PUBLIC_URL oder S3_ENDPOINT muss gesetzt sein");
  return `${endpoint.replace(/\/+$/, "")}/${getBucket()}`;
}

export function getS3Client(): S3Client {
  if (_client) return _client;
  const endpoint = getEnv("S3_ENDPOINT");
  const accessKeyId = getEnv("S3_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("S3_SECRET_ACCESS_KEY");
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY — in Coolify als ENV setzen.",
    );
  }
  _client = new S3Client({
    endpoint,
    region: getEnv("S3_REGION") || "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
    // MinIO mag nur Path-Style; AWS S3 braucht es nicht. Default: an.
    forcePathStyle: (getEnv("S3_FORCE_PATH_STYLE") ?? "true") !== "false",
  });
  return _client;
}

export async function putObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${getPublicBaseUrl()}/${key}`;
}

export async function deleteObject(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key }),
  );
}

/** Aus einer Public-URL den Objekt-Key extrahieren (für Delete). */
export function keyFromPublicUrl(url: string): string | null {
  const base = getPublicBaseUrl();
  if (!url.startsWith(base + "/")) return null;
  return decodeURIComponent(url.slice(base.length + 1));
}
