import { getDb } from "@/lib/db";
import { ImageData } from "@/components/DraggableImage";

interface ImageRow {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  url: string;
}

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM images ORDER BY z_index ASC").all() as ImageRow[];
  const images: ImageData[] = rows.map((r) => ({
    id: r.id,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    zIndex: r.z_index,
    url: r.url,
  }));
  return Response.json(images);
}

export async function POST(request: Request) {
  const img: ImageData = await request.json();
  const db = getDb();
  db.prepare(
    `INSERT INTO images (id, x, y, width, height, z_index, url) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(img.id, img.x, img.y, img.width, img.height, img.zIndex, img.url);
  return Response.json({ ok: true }, { status: 201 });
}
