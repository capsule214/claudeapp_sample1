import { RichText, ensureSync } from "@/lib/db";
import { RichTextData } from "@/components/DraggableRichText";

export async function GET() {
  await ensureSync();

  const rows = await RichText.findAll({ order: [["z_index", "ASC"]] });

  return Response.json(
    rows.map((r) => ({
      id: r.id,
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      zIndex: r.zIndex,
      content: r.content,
    }))
  );
}

export async function POST(request: Request) {
  await ensureSync();
  const rt: RichTextData = await request.json();

  await RichText.create({
    id: rt.id,
    x: rt.x,
    y: rt.y,
    width: rt.width,
    height: rt.height,
    zIndex: rt.zIndex,
    content: rt.content,
  });

  return Response.json({ ok: true }, { status: 201 });
}
