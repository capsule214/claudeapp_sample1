import { Card, Link, sequelize, ensureSync } from "@/lib/db";
import { CardData } from "@/components/DraggableCard";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  await ensureSync();
  const { id } = await ctx.params;
  const card: CardData = await request.json();

  await sequelize.transaction(async (t) => {
    await Card.update(
      {
        x: card.x,
        y: card.y,
        width: card.width,
        height: card.height,
        title: card.title,
        titleColor: card.titleColor,
        zIndex: card.zIndex,
      },
      { where: { id }, transaction: t }
    );

    await Link.destroy({ where: { cardId: id }, transaction: t });

    if (card.links.length > 0) {
      await Link.bulkCreate(
        card.links.map((l, i) => ({
          id: l.id,
          cardId: id,
          title: l.title,
          url: l.url,
          sortOrder: i,
        })),
        { transaction: t }
      );
    }
  });

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  await ensureSync();
  const { id } = await ctx.params;

  await sequelize.transaction(async (t) => {
    await Link.destroy({ where: { cardId: id }, transaction: t });
    await Card.destroy({ where: { id }, transaction: t });
  });

  return Response.json({ ok: true });
}
