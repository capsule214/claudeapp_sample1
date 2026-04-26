import { Image, ensureSync } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/images/[id]/file">
) {
  await ensureSync();
  const { id } = await ctx.params;

  const image = await Image.findByPk(id, { attributes: ["data", "mimeType"] });

  if (!image?.data) return new Response("Not Found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mimeType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
