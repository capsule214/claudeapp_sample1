import { getDb } from "@/lib/db";
import { ImageData } from "@/components/DraggableImage";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/images/[id]">
) {
  const { id } = await ctx.params;
  const img: ImageData = await request.json();
  const db = getDb();
  db.prepare(
    `UPDATE images SET x=?, y=?, width=?, height=?, z_index=?, url=? WHERE id=?`
  ).run(img.x, img.y, img.width, img.height, img.zIndex, img.url, id);
  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/images/[id]">
) {
  const { id } = await ctx.params;
  getDb().prepare("DELETE FROM images WHERE id=?").run(id);
  return Response.json({ ok: true });
}
