import { getDb } from "@/lib/db";
import { RichTextData } from "@/components/DraggableRichText";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/rich-texts/[id]">
) {
  const { id } = await ctx.params;
  const rt: RichTextData = await request.json();
  getDb().prepare(
    `UPDATE rich_texts SET x=?, y=?, width=?, height=?, z_index=?, content=? WHERE id=?`
  ).run(rt.x, rt.y, rt.width, rt.height, rt.zIndex, rt.content, id);
  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/rich-texts/[id]">
) {
  const { id } = await ctx.params;
  getDb().prepare("DELETE FROM rich_texts WHERE id=?").run(id);
  return Response.json({ ok: true });
}
