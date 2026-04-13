import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * TempArticle 临时文章模型属性接口
 */
interface TempArticleAttributes {
  id: number;
  url: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TempArticle 创建时的可选属性
 */
interface TempArticleCreationAttributes extends Optional<TempArticleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * TempArticle 临时文章模型实例接口
 */
interface TempArticleInstance extends Model<TempArticleAttributes, TempArticleCreationAttributes>, TempArticleAttributes {}

const TempArticle = sequelize.define<TempArticleInstance, TempArticleCreationAttributes>(
  'TempArticle',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      comment: '文章链接',
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'TempArticle',
    indexes: [{ fields: ['userId'] }, { fields: ['createdAt'] }],
  },
);

export default TempArticle;
export type { TempArticleInstance, TempArticleAttributes, TempArticleCreationAttributes };