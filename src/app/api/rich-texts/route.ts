import { getDb } from "@/lib/db";
import { RichTextData } from "@/components/DraggableRichText";

interface RichTextRow {
  id: string; x: number; y: number; width: number; height: number;
  z_index: number; content: string;
}

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM rich_texts ORDER BY z_index ASC").all() as RichTextRow[];
  const data: RichTextData[] = rows.map((r) => ({
    id: r.id, x: r.x, y: r.y, width: r.width, height: r.height,
    zIndex: r.z_index, content: r.content,
  }));
  return Response.json(data);
}

export async function POST(request: Request) {
  const rt: RichTextData = await request.json();
  getDb().prepare(
    `INSERT INTO rich_texts (id, x, y, width, height, z_index, content) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(rt.id, rt.x, rt.y, rt.width, rt.height, rt.zIndex, rt.content);
  return Response.json({ ok: true }, { status: 201 });
}
