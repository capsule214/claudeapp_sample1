import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/images/[id]/file">
) {
  const { id } = await ctx.params;
  const db = getDb();

  const row = db
    .prepare("SELECT data, mime_type FROM images WHERE id=?")
    .get(id) as { data: Buffer; mime_type: string } | undefined;

  if (!row?.data) return new Response("Not Found", { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime_type || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
