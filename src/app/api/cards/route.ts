import { getDb } from "@/lib/db";
import { CardData } from "@/components/DraggableCard";

interface CardRow {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  title_color: string;
  z_index: number;
}

interface LinkRow {
  id: string;
  card_id: string;
  title: string;
  url: string;
  sort_order: number;
}

export async function GET() {
  const db = getDb();

  const cardRows = db.prepare("SELECT * FROM cards ORDER BY z_index ASC").all() as CardRow[];
  const linkRows = db.prepare("SELECT * FROM links ORDER BY sort_order ASC").all() as LinkRow[];

  const cards: CardData[] = cardRows.map((row) => ({
    id: row.id,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    title: row.title,
    titleColor: row.title_color,
    zIndex: row.z_index,
    links: linkRows
      .filter((l) => l.card_id === row.id)
      .map((l) => ({ id: l.id, title: l.title, url: l.url })),
  }));

  return Response.json(cards);
}

export async function POST(request: Request) {
  const card: CardData = await request.json();
  const db = getDb();

  db.prepare(
    `INSERT INTO cards (id, x, y, width, height, title, title_color, z_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(card.id, card.x, card.y, card.width, card.height, card.title, card.titleColor, card.zIndex);

  const insertLink = db.prepare(
    `INSERT INTO links (id, card_id, title, url, sort_order) VALUES (?, ?, ?, ?, ?)`
  );
  card.links.forEach((link, i) => insertLink.run(link.id, card.id, link.title, link.url, i));

  return Response.json({ ok: true }, { status: 201 });
}
