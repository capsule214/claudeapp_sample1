import { Image, ensureSync } from "@/lib/db";
import { ImageData } from "@/components/DraggableImage";

export async function GET() {
  await ensureSync();

  const rows = await Image.findAll({ order: [["z_index", "ASC"]] });

  return Response.json(
    rows.map((r) => ({
      id: r.id,
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      zIndex: r.zIndex,
      url: r.url,
    }))
  );
}

export async function POST(request: Request) {
  await ensureSync();
  const img: ImageData = await request.json();

  await Image.create({
    id: img.id,
    x: img.x,
    y: img.y,
    width: img.width,
    height: img.height,
    zIndex: img.zIndex,
    url: img.url,
  });

  return Response.json({ ok: true }, { status: 201 });
}
