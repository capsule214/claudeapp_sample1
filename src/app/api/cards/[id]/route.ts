import { getDb } from "@/lib/db";
import { CardData } from "@/components/DraggableCard";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  const { id } = await ctx.params;
  const card: CardData = await request.json();
  const db = getDb();

  db.prepare(
    `UPDATE cards SET x=?, y=?, width=?, height=?, title=?, title_color=?, z_index=? WHERE id=?`
  ).run(card.x, card.y, card.width, card.height, card.title, card.titleColor, card.zIndex, id);

  // links を全削除して再挿入
  db.prepare("DELETE FROM links WHERE card_id=?").run(id);
  const insertLink = db.prepare(
    `INSERT INTO links (id, card_id, title, url, sort_order) VALUES (?, ?, ?, ?, ?)`
  );
  card.links.forEach((link, i) => insertLink.run(link.id, id, link.title, link.url, i));

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  const { id } = await ctx.params;
  const db = getDb();

  db.prepare("DELETE FROM cards WHERE id=?").run(id);

  return Response.json({ ok: true });
}
