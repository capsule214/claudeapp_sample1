import { Card, Link, ensureSync } from "@/lib/db";
import { CardData } from "@/components/DraggableCard";

export async function GET() {
  await ensureSync();

  const cards = await Card.findAll({
    include: [{ model: Link, as: "links" }],
    order: [
      ["z_index", "ASC"],
      [{ model: Link, as: "links" }, "sort_order", "ASC"],
    ],
  });

  return Response.json(
    cards.map((c) => ({
      id: c.id,
      x: c.x,
      y: c.y,
      width: c.width,
      height: c.height,
      title: c.title,
      titleColor: c.titleColor,
      zIndex: c.zIndex,
      links: (c.links ?? []).map((l) => ({ id: l.id, title: l.title, url: l.url })),
    }))
  );
}

export async function POST(request: Request) {
  await ensureSync();
  const card: CardData = await request.json();

  await Card.create({
    id: card.id,
    x: card.x,
    y: card.y,
    width: card.width,
    height: card.height,
    title: card.title,
    titleColor: card.titleColor,
    zIndex: card.zIndex,
  });

  if (card.links.length > 0) {
    await Link.bulkCreate(
      card.links.map((l, i) => ({
        id: l.id,
        cardId: card.id,
        title: l.title,
        url: l.url,
        sortOrder: i,
      }))
    );
  }

  return Response.json({ ok: true }, { status: 201 });
}
