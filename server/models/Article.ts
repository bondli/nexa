import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Article 文章模型属性接口
 */
interface ArticleAttributes {
  id: number;
  title: string;
  desc: string | null;
  url: string;
  cateId: number;
  userId: number;
  status: string;
}

/**
 * Article 创建时的可选属性
 */
interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id' | 'desc' | 'status'> {}

/**
 * Article 文章模型实例接口
 */
interface ArticleInstance extends Model<ArticleAttributes, ArticleCreationAttributes>, ArticleAttributes {}

const Article = sequelize.define<ArticleInstance, ArticleCreationAttributes>(
  'Article',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      comment: '文章标题',
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      comment: '文章详情',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      comment: '文章链接',
      type: DataTypes.STRING,
      allowNull: false,
    },
    cateId: {
      comment: '分类id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      comment: '状态',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal',
    },
  },
  {
    tableName: 'Article',
    indexes: [
      { fields: ['userId'] },
      { fields: ['cateId'] },
      { fields: ['status'] },
      { fields: ['userId', 'cateId'] },
      { fields: ['userId', 'status'] },
      { fields: ['updatedAt'] },
    ],
  },
);

export default Article;
export type { ArticleInstance, ArticleAttributes, ArticleCreationAttributes };