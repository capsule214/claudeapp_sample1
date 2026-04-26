import {
  Sequelize, DataTypes, Model,
  InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute,
} from "sequelize";
import path from "path";

const DB_PATH = path.join(process.cwd(), "memo.db");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_PATH,
  logging: false,
});

// ---- Card ----
export class Card extends Model<InferAttributes<Card>, InferCreationAttributes<Card>> {
  declare id: string;
  declare x: number;
  declare y: number;
  declare width: number;
  declare height: number;
  declare title: string;
  declare titleColor: string;
  declare zIndex: number;
  declare links?: NonAttribute<Link[]>;
}

Card.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    x: DataTypes.FLOAT,
    y: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    title: DataTypes.STRING,
    titleColor: { type: DataTypes.STRING, field: "title_color" },
    zIndex: { type: DataTypes.INTEGER, field: "z_index" },
  },
  { sequelize, tableName: "cards", timestamps: false }
);

// ---- Link ----
export class Link extends Model<InferAttributes<Link>, InferCreationAttributes<Link>> {
  declare id: string;
  declare cardId: string;
  declare title: string;
  declare url: string;
  declare sortOrder: number;
}

Link.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    cardId: { type: DataTypes.STRING, field: "card_id" },
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    sortOrder: { type: DataTypes.INTEGER, field: "sort_order" },
  },
  { sequelize, tableName: "links", timestamps: false }
);

Card.hasMany(Link, { foreignKey: "cardId", as: "links" });
Link.belongsTo(Card, { foreignKey: "cardId" });

// ---- Image ----
export class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
  declare id: string;
  declare x: number;
  declare y: number;
  declare width: number;
  declare height: number;
  declare zIndex: number;
  declare url: CreationOptional<string>;
  declare mimeType: CreationOptional<string>;
  declare data: CreationOptional<Buffer | null>;
}

Image.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    x: DataTypes.FLOAT,
    y: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    zIndex: { type: DataTypes.INTEGER, field: "z_index" },
    url: { type: DataTypes.STRING, defaultValue: "" },
    mimeType: { type: DataTypes.STRING, field: "mime_type", defaultValue: "" },
    data: { type: DataTypes.BLOB, allowNull: true },
  },
  { sequelize, tableName: "images", timestamps: false }
);

// ---- RichText ----
export class RichText extends Model<InferAttributes<RichText>, InferCreationAttributes<RichText>> {
  declare id: string;
  declare x: number;
  declare y: number;
  declare width: number;
  declare height: number;
  declare zIndex: number;
  declare content: CreationOptional<string>;
}

RichText.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    x: DataTypes.FLOAT,
    y: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    zIndex: { type: DataTypes.INTEGER, field: "z_index" },
    content: { type: DataTypes.TEXT, defaultValue: "" },
  },
  { sequelize, tableName: "rich_texts", timestamps: false }
);

// ---- 初期化 ----
declare global { var _seqSynced: boolean | undefined; }

export async function ensureSync() {
  if (!global._seqSynced) {
    await sequelize.sync();
    global._seqSynced = true;
  }
}
