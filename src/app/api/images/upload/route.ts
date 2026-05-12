import sharp from "sharp";
import { Image, ensureSync } from "@/lib/db";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_COUNT = 50;
const HD_W = 1920;
const HD_H = 1080;

export async function POST(request: Request) {
  await ensureSync();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const id = formData.get("id") as string | null;
  if (!file || !id) return Response.json({ error: "file and id are required" }, { status: 400 });

  if (!ALLOWED_MIME.has(file.type)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const ext = "." + file.name.split(".").pop()!.toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return Response.json({ error: "Unsupported file extension" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File too large (max 20 MB)" }, { status: 413 });
  }

  const count = await Image.count();
  if (count >= MAX_COUNT) {
    return Response.json({ error: `Image limit reached (max ${MAX_COUNT})` }, { status: 422 });
  }

  // eslint-disable-next-line prefer-const
  let rawBuffer = Buffer.from(await file.arrayBuffer());
  let buffer: Buffer = rawBuffer;
  const mimeType = file.type;

  if (file.type !== "image/gif") {
    const img = sharp(rawBuffer);
    const meta = await img.metadata();
    if ((meta.width ?? 0) > HD_W || (meta.height ?? 0) > HD_H) {
      buffer = await img
        .resize(HD_W, HD_H, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
    }
  }

  const url = `/api/images/${id}/file`;
  await Image.update({ mimeType, data: buffer, url }, { where: { id } });

  return Response.json({ url });
}
