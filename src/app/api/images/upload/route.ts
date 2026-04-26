import { Image, ensureSync } from "@/lib/db";

export async function POST(request: Request) {
  await ensureSync();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const id = formData.get("id") as string | null;
  if (!file || !id) return Response.json({ error: "file and id are required" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = `/api/images/${id}/file`;

  await Image.update(
    { mimeType: file.type || "application/octet-stream", data: buffer, url },
    { where: { id } }
  );

  return Response.json({ url });
}
