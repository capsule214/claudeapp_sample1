import { RichText, ensureSync } from "@/lib/db";
import { RichTextData } from "@/components/DraggableRichText";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/rich-texts/[id]">
) {
  await ensureSync();
  const { id } = await ctx.params;
  const rt: RichTextData = await request.json();

  await RichText.update(
    { x: rt.x, y: rt.y, width: rt.width, height: rt.height, zIndex: rt.zIndex, content: rt.content },
    { where: { id } }
  );

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/rich-texts/[id]">
) {
  await ensureSync();
  const { id } = await ctx.params;

  await RichText.destroy({ where: { id } });

  return Response.json({ ok: true });
}
