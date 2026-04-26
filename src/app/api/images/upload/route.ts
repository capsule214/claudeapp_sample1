import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const id = formData.get("id") as string | null;
  if (!file || !id) return Response.json({ error: "file and id are required" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  const db = getDb();
  db.prepare("UPDATE images SET mime_type=?, data=?, url=? WHERE id=?").run(
    mimeType,
    buffer,
    `/api/images/${id}/file`,
    id
  );

  return Response.json({ url: `/api/images/${id}/file` });
}
