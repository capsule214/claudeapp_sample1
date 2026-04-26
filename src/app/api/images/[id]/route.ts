import { Image, ensureSync } from "@/lib/db";
import { ImageData } from "@/components/DraggableImage";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/images/[id]">
) {
  await ensureSync();
  const { id } = await ctx.params;
  const img: ImageData = await request.json();

  await Image.update(
    { x: img.x, y: img.y, width: img.width, height: img.height, zIndex: img.zIndex, url: img.url },
    { where: { id } }
  );

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/images/[id]">
) {
  await ensureSync();
  const { id } = await ctx.params;

  await Image.destroy({ where: { id } });

  return Response.json({ ok: true });
}
